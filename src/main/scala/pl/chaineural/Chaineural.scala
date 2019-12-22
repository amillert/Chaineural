package pl.chaineural

import akka.actor.{ActorRef, ActorSelection, ActorSystem, Address, Props}
import akka.pattern.pipe
import akka.cluster.Cluster
import akka.cluster.ClusterEvent.{InitialStateAsEvents, MemberEvent, MemberRemoved, MemberUp, UnreachableMember}
import akka.dispatch.{PriorityGenerator, UnboundedPriorityMailbox}
import akka.util.Timeout
import com.typesafe.config.{Config, ConfigFactory}

import scala.util.Random
import scala.concurrent.duration._
import scala.language.postfixOps
import dataUtils.CustomCharacterDataSeparatedDistributor


object ChaineuralDomain {
  final case class InitializeWorkerNodes(workerNodesCount: Int)
  final case class ProcessExemplarJob(work: Seq[Int], workAggregatorActorRef: ActorRef)
  final case class ResultExemplarJob(work: Seq[Int])
  final case class DistributeData(path: String)
  final case class ProcessWork(dataBatch: Seq[Seq[Double]])
}

class ChaineuralPriorityMailbox(settings: ActorSystem.Settings, config: Config)
  extends UnboundedPriorityMailbox(
    PriorityGenerator {
      case _: MemberEvent => 0
      case _ => 1
    }
  )

object ChaineuralMaster {
  def props: Props =
    Props(new ChaineuralMaster)
}

class ChaineuralMaster extends Actress {

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
    case MemberUp(member) if member.hasRole("mainWorker") =>
      log.info(s"A member with an address: ${member.address} is up")
      if (workerNodesPendingRemoval.contains(member.address)) {
        workerNodesPendingRemoval - member.address
      } else {
        // TODO 2: selection of remotely deployed, instead of manually started (POOLING, config)
        val workerSelection: ActorSelection =
          context.actorSelection(s"${member.address}/user/chaineuralMainWorker")
        workerSelection.resolveOne().map(ref => (member.address, ref)).pipeTo(self)
      }

    case MemberRemoved(member, prevStatus) if member.hasRole("mainWorker") =>
      log.info(s"A member with an address: ${member.address} has been removed from $prevStatus")
      workerNodesUp = workerNodesUp - member.address

    case UnreachableMember(member) if member.hasRole("mainWorker") =>
      log.info(s"A member with an address: ${member.address} is unreachable")
      val workerOption: Option[ActorRef] = workerNodesUp get member.address
      workerOption.foreach { workerNodeRef =>
        workerNodesPendingRemoval = workerNodesPendingRemoval + (member.address -> workerNodeRef)
      }

    case m: MemberEvent =>
      log.info(s"Another member event has occurred: $m")
  }

  def handleWorkerRegistration: Receive = {
    case addressActorRefRegistrationPair: (Address, ActorRef) =>
      workerNodesUp = workerNodesUp + addressActorRefRegistrationPair
  }

  def distributeDataAmongWorkerNodes: Receive = {
    case DistributeData(path) =>
      log.info("Started processing data")
      log.info(s"There are ${workerNodesUp.size} worker nodes up")
      val dataBatches: Seq[Seq[Seq[Double]]] =
        CustomCharacterDataSeparatedDistributor(path, ',', workerNodesUp.size)
      log.info("Data has been properly read and split into batches")
      log.info(s"There's ${dataBatches.size} batches")

      dataBatches.foreach { dataBatch =>
        val activeWorkerNodesUp: Seq[(Address, ActorRef)] = (workerNodesUp -- workerNodesPendingRemoval.keys).toSeq
        val workerIndex: Int = Random.nextInt(activeWorkerNodesUp.size)
        val randomlyChosenWorkerRef: ActorRef = activeWorkerNodesUp.map(_._2)(workerIndex)

        randomlyChosenWorkerRef ! ProcessWork(dataBatch)
      }
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
    val actor = system.actorOf(props, actorName)
    println(s"Created: ${actor}, ${actor.path}")
    actor
  }

  val chaineuralMaster = createNode("chaineuralMaster", "master", 2551, Props[ChaineuralMaster])

  (1 to 50).foreach { nWorker =>
    createNode("chaineuralMainWorker", "mainWorker", 2551 + nWorker, Props[ChaineuralWorker])
  }

  Thread.sleep(4000)
  chaineuralMaster ! DistributeData("/home/amillert/private/Chaineural/src/main/resources/data/10k-data.csv")
}
