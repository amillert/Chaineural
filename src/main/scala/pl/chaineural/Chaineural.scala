package pl.chaineural

import akka.actor.{ActorRef, ActorSelection, ActorSystem, Address, Props}
import akka.pattern.pipe
import akka.cluster.{Cluster, Member, MemberStatus}
import akka.cluster.ClusterEvent.{InitialStateAsEvents, MemberEvent, MemberRemoved, MemberUp, UnreachableMember}
import akka.dispatch.{PriorityGenerator, UnboundedPriorityMailbox}
import akka.util.Timeout
import com.typesafe.config.{Config, ConfigFactory}

import scala.util.Random
import scala.concurrent.duration._
import scala.language.postfixOps
import pl.chaineural.dataStructures.{B, M}
import pl.chaineural.dataUtils.CustomCharacterDataSeparatedDistributor


class ChaineuralPriorityMailbox(settings: ActorSystem.Settings, config: Config)
  extends UnboundedPriorityMailbox(
    PriorityGenerator {
      case _: MemberEvent => 0
      case _ => 1
    }
  )

object ChaineuralMaster {
  def props(stalenessWorkerRef: ActorRef, outputSize: Int): Props =
    Props(new ChaineuralMaster(stalenessWorkerRef, outputSize))
}

class ChaineuralMaster(stalenessWorkerRef: ActorRef, outputSize: Int) extends Actress {

  import pl.chaineural.messagesDomains.InformationExchangeDomain._
  import pl.chaineural.messagesDomains.LearningDomain._
  import pl.chaineural.messagesDomains.ParametersExchangeDomain._

  import context.dispatcher

  implicit val timeout: Timeout = Timeout(3 seconds)

  private val chaineuralCluster: Cluster = Cluster(context.system)
  private var workerNodesUp: Map[Address, ActorRef] = Map()
  private var workerNodesPendingRemoval: Map[Address, ActorRef] = Map()

  override def preStart(): Unit = {
    chaineuralCluster.subscribe(
      self,
      initialStateMode = InitialStateAsEvents,
      classOf[MemberEvent],
      classOf[UnreachableMember]
    )
  }

  override def postStop(): Unit =
    chaineuralCluster.unsubscribe(self)

  override def receive: Receive = handleClusterEvents
    .orElse(handleWorkerRegistration)
    .orElse(distributeDataAmongWorkerNodes)

  def handleClusterEvents: Receive = {
    case MemberUp(member: Member) if member.hasRole("stalenessWorker") =>
      log.info(s"[master]: A member with an address ${member.address} is up")
      val stalenessWorkerSelection: ActorSelection =
        context.actorSelection(s"${member.address}/user/chaineuralStalenessWorker")

      stalenessWorkerSelection ! ProvideTrainingDetails(50)

    case MemberUp(member: Member) if member.hasRole("mainWorker") =>
      log.info(s"[master]: A member with an address: ${member.address} is up")
      if (workerNodesPendingRemoval.contains(member.address)) {
        workerNodesPendingRemoval - member.address
      } else {
        // TODO: selection of remotely deployed, instead of manually started (POOLING, config)
        val workerSelection: ActorSelection =
          context.actorSelection(s"${member.address}/user/chaineuralMainWorker")
        workerSelection.resolveOne().map(ref => (member.address, ref)).pipeTo(self)
      }

    case MemberRemoved(member: Member, prevStatus: MemberStatus) if member.hasRole("mainWorker") =>
      log.info(s"[master]: A member with an address: ${member.address} has been removed from $prevStatus")
      workerNodesUp = workerNodesUp - member.address

    case UnreachableMember(member: Member) if member.hasRole("mainWorker") =>
      log.info(s"[master]: A member with an address: ${member.address} is unreachable")
      val workerOption: Option[ActorRef] = workerNodesUp get member.address
      workerOption.foreach { workerNodeRef =>
        workerNodesPendingRemoval += (member.address -> workerNodeRef)
      }

    case m: MemberEvent =>
      log.info(s"Another member event has occurred: $m")
  }

  def handleWorkerRegistration: Receive = {
    case addressActorRefRegistrationPair: (Address, ActorRef) =>
      val (_, workerRef) = addressActorRefRegistrationPair
      workerNodesUp += addressActorRefRegistrationPair

      stalenessWorkerRef ! OrderUp2DateParametersAndStaleness(workerRef)
  }

  def distributeDataAmongWorkerNodes: Receive = {
    case DistributeDataAmongWorkerNodes(path, sizeOfDataBatches) =>
      val dataBatches: B =
        CustomCharacterDataSeparatedDistributor(path, ',', sizeOfDataBatches)

      val epochs = 10
      val amountOfDataMiniBatches: Int = dataBatches.size
      log.info(s"[master]: There are ${workerNodesUp.size} worker nodes up & $amountOfDataMiniBatches batches")

      (1 to epochs).foreach { epoch =>
        // TODO: do shuffling
        dataBatches.foreach { dataBatch =>
          val x: M = dataBatch.map(_.init)
          val y: M = dataBatch.map(b => (1 to outputSize).map(_ => b.last).toVector)

          val activeWorkerNodesUp: Seq[(Address, ActorRef)] = (workerNodesUp -- workerNodesPendingRemoval.keys).toSeq
          val workerIndex: Int = Random.nextInt(activeWorkerNodesUp.size)
          val randomlyChosenWorkerRef: ActorRef = activeWorkerNodesUp.map(_._2)(workerIndex)

          randomlyChosenWorkerRef ! ForwardPass(x, y, amountOfDataMiniBatches, 0.0001f)
        }

        log.info(s"[master]: End of epoch $epoch")
      }

    case BroadcastParameters2Workers =>
      Thread.sleep(100)
      workerNodesUp.values.foreach { workerRef =>
        stalenessWorkerRef ! OrderUp2DateParametersAndStaleness(workerRef)
      }
  }
}

object ChaineuralSeedNodes extends App {

  import pl.chaineural.messagesDomains.InformationExchangeDomain._

  def createNode(actorName: String, role: String, port: Int, props: Props): ActorRef = {
    val config: Config = ConfigFactory.parseString(
      s"""
         |akka.cluster.roles = ["$role"]
         |akka.remote.artery.canonical.port = $port
         |""".stripMargin)
      .withFallback(ConfigFactory load "cluster.conf")

    val system: ActorSystem = ActorSystem("ChaineuralMasterSystem", config)
    val actor: ActorRef = system.actorOf(props, actorName)
    println(s"Created: $actor, ${actor.path}")
    actor
  }

  val amountOfWorkers = 24
  val synchronizationHyperparameter = 7
  val sizeOfDataBatches = 200

  val chaineuralStalenessWorker: ActorRef = createNode(
    "chaineuralStalenessWorker",
    "stalenessWorker",
    2550,
    ChaineuralStalenessWorker.props(amountOfWorkers, synchronizationHyperparameter))
  val chaineuralMaster: ActorRef = createNode("chaineuralMaster", "master", 2551, ChaineuralMaster.props(chaineuralStalenessWorker, 5))

  (1 to amountOfWorkers).foreach { nWorker =>
    createNode("chaineuralMainWorker", "mainWorker", 2551 + nWorker, ChaineuralWorker.props(chaineuralStalenessWorker, amountOfWorkers))
  }

  Thread.sleep(10000)

  chaineuralMaster ! DistributeDataAmongWorkerNodes("src/main/resources/data/10k-data.csv", sizeOfDataBatches)
}
