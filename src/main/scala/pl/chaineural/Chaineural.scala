package pl.chaineural

import akka.actor.{ActorRef, ActorSelection, ActorSystem, Address, Props}
import akka.pattern.pipe
import akka.cluster.{Cluster, Member}
import akka.cluster.ClusterEvent.{InitialStateAsEvents, MemberEvent, MemberRemoved, MemberUp, UnreachableMember}
import akka.dispatch.{PriorityGenerator, UnboundedPriorityMailbox}
import akka.util.Timeout
import com.typesafe.config.{Config, ConfigFactory}

import scala.util.Random
import scala.concurrent.duration._
import scala.language.postfixOps
import dataUtils.CustomCharacterDataSeparatedDistributor
import pl.chaineural.dataStructures._


object ChaineuralDomain {
  final case class InformAboutMaster(amountOfMiniBatches: Int, outputSize: Int)
  final case class InitializeWorkerNodes(workerNodesCount: Int)
  final case class ProcessExemplarJob(work: Seq[Int], workAggregatorActorRef: ActorRef)
  final case class ResultExemplarJob(work: Seq[Int])
  final case class DistributeData(path: String, sizeOfDataBatches: Int)
  final case class Up2DateParametersAndStaleness(amountOfMiniBatches: Int, θW1: M, θB1: M, θW2: M, θB2: M, globalStalenessClock: BigInt)
  final case class ProvideUp2DateParameters(workerRef: ActorRef)
  final case object FinishedBroadcastingParameters
  final case class ForwardPass(X: M, Y: M)
  final case class BackwardPass(amountOfMiniBatches: Int, X: M, Y: M, θZ1: Matrices, θA1: Matrices, θZ2: Matrices, Loss: Float)
  final case class BackPropagatedParameters(amountOfMiniBatches: Int, JacobianθW1: M, JacobianθB1: M, JacobianθW2: M, JacobianθB2: M)
  final case object BroadcastParameters2Workers
}

object BackpropagationDomain {
  final case class BackwardPass(loss: Float)
  final case class BackpropagationResult(partialDerivatives: Map[String, Float => Float])
}

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

  import ChaineuralDomain._

  import context.dispatcher

  implicit val timeout: Timeout = Timeout(3 seconds)

  private val chaineuralCluster: Cluster = Cluster(context.system)
  // TODO 1: These should be passed as states in receives
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
    case MemberUp(member) if member.hasRole("stalenessWorker") =>
      log.info(s"[master]: A member with an address ${member.address} is up")
      val stalenessWorkerSelection: ActorSelection =
        context.actorSelection(s"${member.address}/user/chaineuralStalenessWorker")
      stalenessWorkerSelection ! InformAboutMaster(50, outputSize)  // improvisation

    case MemberUp(member) if member.hasRole("mainWorker") =>
      log.info(s"[master]: A member with an address: ${member.address} is up")
      if (workerNodesPendingRemoval.contains(member.address)) {
        workerNodesPendingRemoval - member.address
      } else {
        // TODO 2: selection of remotely deployed, instead of manually started (POOLING, config)
        val workerSelection: ActorSelection =
          context.actorSelection(s"${member.address}/user/chaineuralMainWorker")
        workerSelection.resolveOne().map(ref => (member.address, ref)).pipeTo(self)
      }

    case MemberRemoved(member, prevStatus) if member.hasRole("mainWorker") =>
      log.info(s"[master]: A member with an address: ${member.address} has been removed from $prevStatus")
      workerNodesUp = workerNodesUp - member.address

    case UnreachableMember(member) if member.hasRole("mainWorker") =>
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

      stalenessWorkerRef ! ProvideUp2DateParameters(workerRef)
  }

  // ensure this one will not collide with broadcastStalenessAndParametersAmongWorkerNodes
  def distributeDataAmongWorkerNodes: Receive = {
    case DistributeData(path, sizeOfDataBatches) =>
      val dataBatches: B =
        CustomCharacterDataSeparatedDistributor(path, ',', sizeOfDataBatches)

      val epoch = 1

      val amountOfDataBatches: Int = dataBatches.size
      log.info(s"[master]: There are ${workerNodesUp.size} worker nodes up & $amountOfDataBatches batches")

      dataBatches.foreach { dataBatch =>
        val X: M = dataBatch.map(_.init)
        val Y: M = dataBatch.map(b => (1 to outputSize).map(_ => b.last).toVector)
        val activeWorkerNodesUp: Seq[(Address, ActorRef)] = (workerNodesUp -- workerNodesPendingRemoval.keys).toSeq
        val workerIndex: Int = Random.nextInt(activeWorkerNodesUp.size)
        val randomlyChosenWorkerRef: ActorRef = activeWorkerNodesUp.map(_._2)(workerIndex)

        randomlyChosenWorkerRef ! ForwardPass(X, Y)
      }

      log.info(s"[master]: End of epoch $epoch")

    case BroadcastParameters2Workers =>
      context become broadcastStalenessAndParametersAmongWorkerNodes
      self ! Up2DateParametersAndStaleness
  }

  def broadcastStalenessAndParametersAmongWorkerNodes: Receive = {
    case Up2DateParametersAndStaleness =>
      workerNodesUp.values.foreach { workerRef =>
        workerRef ! Up2DateParametersAndStaleness
      }

      stalenessWorkerRef ! FinishedBroadcastingParameters
  }
}

object ChaineuralSeedNodes extends App {

  import ChaineuralDomain._

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

  val amountOfWorkers = 6
  val synchronizationHyperparameter = 2
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

  chaineuralMaster ! DistributeData("src/main/resources/data/10k-data.csv", sizeOfDataBatches)
}
