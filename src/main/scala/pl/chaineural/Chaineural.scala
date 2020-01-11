package pl.chaineural

import akka.actor.{ActorRef, ActorSelection, ActorSystem, Address, Props}
import akka.pattern.pipe
import akka.cluster.{Cluster, Member, MemberStatus}
import akka.cluster.ClusterEvent.{InitialStateAsEvents, MemberEvent, MemberRemoved, MemberUp, UnreachableMember}
import akka.dispatch.{PriorityGenerator, UnboundedStablePriorityMailbox}
import akka.util.Timeout
import com.typesafe.config.{Config, ConfigFactory}

import scala.util.Random
import scala.concurrent.duration._
import scala.language.postfixOps
import pl.chaineural.dataStructures.{B, M}
import pl.chaineural.dataUtils.CustomCharacterDataSeparatedDistributor
import pl.chaineural.messagesDomains.LearningDomain.{BackpropagatedParameters, BackwardPass, ForwardPass}
import pl.chaineural.messagesDomains.ParametersExchangeDomain.{OrderUp2DateParametersAndStaleness, Up2DateParametersAndStaleness, BroadcastParameters2Workers}


class WorkerPriorityMailbox(settings: ActorSystem.Settings, config: Config)
  extends UnboundedStablePriorityMailbox(
    PriorityGenerator {
      case Up2DateParametersAndStaleness => 0
      case BackwardPass => 1
      case ForwardPass => 1
      case _ => 5
    }
  )

class StalenessWorkerPriorityMailbox(settings: ActorSystem.Settings, config: Config)
  extends UnboundedStablePriorityMailbox(
    PriorityGenerator {
      case OrderUp2DateParametersAndStaleness => 1
      case Up2DateParametersAndStaleness => 0
      case BackpropagatedParameters => 1
      case _ => 5
    }
  )

class ChaineuralMasterPriorityMailbox(settings: ActorSystem.Settings, config: Config)
  extends UnboundedStablePriorityMailbox(
    PriorityGenerator {
      case _: MemberEvent => 0
      case BroadcastParameters2Workers => 0
      case _ => 5
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
    .orElse(obtainMiniBatches)
  // .orElse(distributeDataAmongWorkerNodes)

  def handleClusterEvents: Receive = {
    case MemberUp(member: Member) if member.hasRole("stalenessWorker") =>
      //      log.info(s"[master]: A member with an address ${member.address} is up")
      val stalenessWorkerSelection: ActorSelection =
        context.actorSelection(s"${member.address}/user/chaineuralStalenessWorker")

      stalenessWorkerSelection ! ProvideTrainingDetails(50)

    case MemberUp(member: Member) if member.hasRole("mainWorker") =>
      //      log.info(s"[master]: A member with an address: ${member.address} is up")
      if (workerNodesPendingRemoval.contains(member.address)) {
        workerNodesPendingRemoval - member.address
      } else {
        // TODO: selection of remotely deployed, instead of manually started (POOLING, config)
        val workerSelection: ActorSelection =
          context.actorSelection(s"${member.address}/user/chaineuralMainWorker")
        workerSelection.resolveOne().map(ref => (member.address, ref)).pipeTo(self)
      }

    case MemberRemoved(member: Member, prevStatus: MemberStatus) if member.hasRole("mainWorker") =>
      //      log.info(s"[master]: A member with an address: ${member.address} has been removed from $prevStatus")
      workerNodesUp = workerNodesUp - member.address

    case UnreachableMember(member: Member) if member.hasRole("mainWorker") =>
      //      log.info(s"[master]: A member with an address: ${member.address} is unreachable")
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

  def obtainMiniBatches: Receive = {
    case DistributeDataAmongWorkerNodes(path, sizeOfDataBatches) =>
      val dataMiniBatches: B =
        CustomCharacterDataSeparatedDistributor(path, ',', sizeOfDataBatches)

      val amountOfDataMiniBatches: Int = dataMiniBatches.size
      log.info(s"[master]: There are ${workerNodesUp.size} worker nodes up & $amountOfDataMiniBatches batches")

      self ! StartDistributing
      context become distributeDataAmongWorkerNodes(
        dataMiniBatches,
        dataMiniBatches,
        workerNodesUp.values.toSeq,
        Seq(),
        0,
        20,
        0,
        amountOfDataMiniBatches
      )
  }

  def idleWaitingForWorkers(
    allDataMiniBatches: B,
    remainingDataMiniBatches: B,
    availableWorkers: Seq[ActorRef],
    unavailableWorkers: Seq[ActorRef],
    currentEpoch: Int,
    allEpochs: Int,
    currentMiniBatch: Int,
    allMiniBatches: Int): Receive = {

    case Ready(workerRef: ActorRef) =>
      self ! StartDistributing

      context become distributeDataAmongWorkerNodes(
        allDataMiniBatches,
        remainingDataMiniBatches,
        workerRef +: availableWorkers,
        unavailableWorkers,
        currentEpoch,
        allEpochs,
        currentMiniBatch,
        allMiniBatches
      )

    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      // yea.. this one works
      // seems like at most times all workers are in use lol
//      log.info("master got up2dateparamters")
      workerNodesUp.values.foreach { workerRef =>
        workerRef ! up2DateParametersAndStaleness
      }

    case workerRef: ActorRef =>
      self ! StartDistributing

      context become distributeDataAmongWorkerNodes(
        allDataMiniBatches,
        remainingDataMiniBatches,
        workerRef +: availableWorkers,
        unavailableWorkers,
        currentEpoch,
        allEpochs,
        currentMiniBatch,
        allMiniBatches
      )
  }

  def distributeDataAmongWorkerNodes(
    allDataMiniBatches: B,
    remainingDataMiniBatches: B,
    availableWorkers: Seq[ActorRef],
    unavailableWorkers: Seq[ActorRef],
    currentEpoch: Int,
    allEpochs: Int,
    currentMiniBatch: Int,
    allMiniBatches: Int): Receive = {

    case workerRef: ActorRef =>
      self ! StartDistributing

      context become distributeDataAmongWorkerNodes(
        allDataMiniBatches,
        remainingDataMiniBatches,
        workerRef +: availableWorkers,
        unavailableWorkers,
        currentEpoch,
        allEpochs,
        currentMiniBatch,
        allMiniBatches
      )

    case StartDistributing =>
      if (availableWorkers.isEmpty) {
        context become idleWaitingForWorkers(
          allDataMiniBatches,
          allDataMiniBatches,
          availableWorkers,
          unavailableWorkers,
          currentEpoch,
          allEpochs,
          currentMiniBatch,
          allMiniBatches
        )
      } else if (currentMiniBatch < allMiniBatches && currentEpoch > 0) {
        val miniBatch: M = remainingDataMiniBatches.head
        val x: M = miniBatch.map(_.init)
        val y: M = miniBatch.map(m => (1 to outputSize).map(_ => m.last).toVector)

        // val workerIndex: Int = Random.nextInt(availableWorkers.size)
        val workerRef: ActorRef = availableWorkers.head

        stalenessWorkerRef ! ProvideMiniBatch(x, y, workerRef, allMiniBatches)

        self ! StartDistributing
        context become distributeDataAmongWorkerNodes(
          allDataMiniBatches,
          allDataMiniBatches.tail,
          availableWorkers.tail,
          workerRef +: unavailableWorkers,
          currentEpoch,
          allEpochs,
          currentMiniBatch + 1,
          allMiniBatches
        )
      } else {
        // chaincode

        self ! StartDistributing
        context become distributeDataAmongWorkerNodes(
          allDataMiniBatches,
          allDataMiniBatches,
          availableWorkers,
          Seq(),
          currentEpoch + 1,
          allEpochs,
          0,
          allMiniBatches
        )
      }

    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      log.info("master got up2dateparamters")
      workerNodesUp.values.foreach { workerRef =>
        workerRef ! up2DateParametersAndStaleness
      }

    case BroadcastParameters2Workers =>
      // Thread.sleep(100)
      log.info(s"master: $stalenessWorkerRef")
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

  val amountOfWorkers = 4
  val synchronizationHyperparameter = 2
  val sizeOfDataBatches = 200

  val chaineuralStalenessWorker: ActorRef = createNode(
    "chaineuralStalenessWorker",
    "stalenessWorker",
    2550,
    ChaineuralStalenessWorker.props(amountOfWorkers, synchronizationHyperparameter, 0.0001f))
  val chaineuralMaster: ActorRef = createNode("chaineuralMaster", "master", 2551, ChaineuralMaster.props(chaineuralStalenessWorker, 5))

  (1 to amountOfWorkers).foreach { nWorker =>
    createNode("chaineuralMainWorker", "mainWorker", 2551 + nWorker, ChaineuralWorker.props(chaineuralStalenessWorker, amountOfWorkers))
  }

  Thread.sleep(10000)

  chaineuralMaster ! DistributeDataAmongWorkerNodes("src/main/resources/data/10k-data.csv", sizeOfDataBatches)
}
