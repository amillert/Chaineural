package pl.chaineural

import akka.actor.{ActorRef, ActorSelection, ActorSystem, Address, Props}
import akka.pattern.pipe
import akka.cluster.{Cluster, Member, MemberStatus}
import akka.cluster.ClusterEvent.{InitialStateAsEvents, MemberEvent, MemberRemoved, MemberUp, UnreachableMember}
import akka.util.Timeout
import com.typesafe.config.{Config, ConfigFactory}

import scala.concurrent.duration._
import scala.language.postfixOps
import scala.util.Random
import pl.chaineural.dataStructures.{B, M}
import pl.chaineural.dataUtils.CustomCharacterDataSeparatedDistributor


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

  def handleClusterEvents: Receive = {
    case MemberUp(member: Member) if member.hasRole("stalenessWorker") =>
      // log.info(s"[master]: A member with an address ${member.address} is up")

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

      stalenessWorkerRef ! OrderInitialParametersAndStaleness(workerRef)
  }

  def obtainMiniBatches: Receive = {
    case DistributeMiniBatches(path, sizeOfDataBatches) =>
      val miniBatches: B =
        shuffle(CustomCharacterDataSeparatedDistributor(path, ',', sizeOfDataBatches))

      // val amountOfMiniBatches: Int = miniBatches.size
      // log.info(s"[master]: There are ${workerNodesUp.size} worker nodes up & $amountOfMiniBatches batches")

      self ! StartDistributing
      context become distributeDataAmongWorkerNodes(
        miniBatches,
        miniBatches,
        workerNodesUp.values.toSeq,
        Seq(),
        0,
        20,
        0
      )
  }

  def idleWaitingForWorkers(
    remainingMiniBatches: B,
    miniBatches: B,
    availableWorkers: Seq[ActorRef],
    unavailableWorkers: Seq[ActorRef],
    currentEpoch: Int,
    allEpochs: Int,
    currentMiniBatch: Int): Receive = {

    case Ready(workerRef: ActorRef) =>
      self ! StartDistributing

      context become distributeDataAmongWorkerNodes(
        remainingMiniBatches,
        miniBatches,
        workerRef +: availableWorkers,
        unavailableWorkers.filter(_ != workerRef),
        currentEpoch,
        allEpochs,
        currentMiniBatch
      )

    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      workerNodesUp.values.foreach { workerRef =>
        workerRef ! up2DateParametersAndStaleness
      }

    case workerRef: ActorRef => {
      // find out where does it come from
//      log.info("gotten worker ref lol")
      self ! StartDistributing

      context become distributeDataAmongWorkerNodes(
        remainingMiniBatches,
        miniBatches,
        workerRef +: availableWorkers,
        unavailableWorkers.filter(_ != workerRef),
        currentEpoch,
        allEpochs,
        currentMiniBatch
      )
    }
  }

  def distributeDataAmongWorkerNodes(
    remainingMiniBatches: B,
    miniBatches: B,
    availableWorkers: Seq[ActorRef],
    unavailableWorkers: Seq[ActorRef],
    currentEpoch: Int,
    allEpochs: Int,
    currentMiniBatch: Int): Receive = {

    case workerRef: ActorRef =>
      self ! StartDistributing

      context become distributeDataAmongWorkerNodes(
        remainingMiniBatches,
        miniBatches,
        workerRef +: availableWorkers,
        if (unavailableWorkers.contains(workerRef)) unavailableWorkers.filter(x => x != workerRef)
        else unavailableWorkers,
        currentEpoch,
        allEpochs,
        currentMiniBatch
      )

    case StartDistributing => {
      if (availableWorkers.isEmpty) {
        context become idleWaitingForWorkers(
          remainingMiniBatches,
          miniBatches,
          availableWorkers,
          unavailableWorkers,
          currentEpoch,
          allEpochs,
          currentMiniBatch
        )
      } else if (currentMiniBatch < miniBatches.size && remainingMiniBatches.nonEmpty) {
        log.info(s"$currentMiniBatch-th mini batch of $currentEpoch-th epoch")
        val miniBatch: M = remainingMiniBatches.head
        val x: M = miniBatch.map(_.init)
        val y: M = miniBatch.map(m => (1 to outputSize).map(_ => m.last).toVector)

        val workerRef: ActorRef = availableWorkers.head

        workerRef ! ForwardPass(x, y)

        self ! StartDistributing

        context become distributeDataAmongWorkerNodes(
          remainingMiniBatches.tail,
          miniBatches,
          availableWorkers.tail,
          workerRef +: unavailableWorkers,
          currentEpoch,
          allEpochs,
          currentMiniBatch + 1
        )
      } else {
        // chainCode

        // temporarily for testing to run only 1 epoch
        if (currentEpoch < 10) {
          self ! StartDistributing

          context become distributeDataAmongWorkerNodes(
            shuffle(miniBatches),
            miniBatches,
            availableWorkers,
            unavailableWorkers,
            currentEpoch + 1,
            allEpochs,
            0
          )
        }
      }
    }

    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      workerNodesUp.values.foreach { workerRef =>
        workerRef ! up2DateParametersAndStaleness
      }
  }

  private def shuffle(fullBatch: B): B =
    Random.shuffle(fullBatch)
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

  val amountOfWorkers = 12
  val synchronizationHyperparameter = 3
  val sizeOfMiniBatches = 50
  val featuresSize = 10
  val hiddenSize = 60
  val outputSize = 4
  val eta = 0.001f

  val chaineuralStalenessWorker: ActorRef = createNode(
    "chaineuralStalenessWorker",
    "stalenessWorker",
    2550,
    ChaineuralStalenessWorker.props(amountOfWorkers, synchronizationHyperparameter, eta))

  val chaineuralMaster: ActorRef =
    createNode(
      "chaineuralMaster",
      "master",
      2551,
      ChaineuralMaster.props(chaineuralStalenessWorker, outputSize)
    )

  chaineuralStalenessWorker ! chaineuralMaster
  chaineuralStalenessWorker ! ProvideTrainingDetails(sizeOfMiniBatches, featuresSize, hiddenSize, outputSize)


  (1 to amountOfWorkers).foreach { nWorker =>
    createNode("chaineuralMainWorker", "mainWorker", 2551 + nWorker, ChaineuralWorker.props(chaineuralStalenessWorker))
  }

  Thread.sleep(10000)

   chaineuralMaster ! DistributeMiniBatches("src/main/resources/data/poker.csv", sizeOfMiniBatches)
//  chaineuralMaster ! DistributeMiniBatches("src/main/resources/data/10k-data.csv", sizeOfMiniBatches)
}
