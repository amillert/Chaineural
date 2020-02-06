package pl.chaineural.actors

import akka.actor.{ActorRef, ActorSelection, Address, Props}
import akka.pattern.pipe
import akka.cluster.{Cluster, Member, MemberStatus}
import akka.cluster.ClusterEvent.{InitialStateAsEvents, MemberEvent, MemberRemoved, MemberUp, UnreachableMember}
import akka.util.Timeout

import scala.concurrent.duration._
import scala.language.postfixOps
import scala.util.Random
import pl.chaineural.dataStructures.{B, M}

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
      // log.info(s"[master]: A member with an address: ${member.address} is up")
      if (workerNodesPendingRemoval.contains(member.address)) {
        workerNodesPendingRemoval - member.address
      } else {
        // TODO: selection of remotely deployed, instead of manually started (POOLING, config)
        val workerSelection: ActorSelection =
          context.actorSelection(s"${member.address}/user/chaineuralMainWorker")
        workerSelection.resolveOne().map(ref => (member.address, ref)).pipeTo(self)
      }

    case MemberRemoved(member: Member, prevStatus: MemberStatus) if member.hasRole("mainWorker") =>
      // log.info(s"[master]: A member with an address: ${member.address} has been removed from $prevStatus")
      workerNodesUp = workerNodesUp - member.address

    case UnreachableMember(member: Member) if member.hasRole("mainWorker") =>
      // log.info(s"[master]: A member with an address: ${member.address} is unreachable")
      val workerOption: Option[ActorRef] = workerNodesUp get member.address
      workerOption.foreach { workerNodeRef =>
        workerNodesPendingRemoval += (member.address -> workerNodeRef)
      }

    case m: MemberEvent =>
      // log.info(s"Another member event has occurred: $m")
  }

  def handleWorkerRegistration: Receive = {
    case addressActorRefRegistrationPair: (Address, ActorRef) =>
      val (_, workerRef) = addressActorRefRegistrationPair
      workerNodesUp += addressActorRefRegistrationPair

      // println(System.nanoTime)
      stalenessWorkerRef ! OrderInitialParametersAndStaleness(workerRef)
  }

  def obtainMiniBatches: Receive = {
    case DistributeMiniBatches(miniBatches, epochs) =>
      self ! StartDistributing

      context become distributeDataAmongWorkerNodes(
        miniBatches,
        miniBatches,
        workerNodesUp.values.toSeq,
        Seq(),
        1,
        epochs,
        1
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

    case Ready(workerRef: ActorRef) if workerRef.path.address.port.getOrElse(None).isInstanceOf[Int] =>
      self ! StartDistributing

      context become distributeDataAmongWorkerNodes(
        remainingMiniBatches,
        miniBatches,
        (workerRef +: availableWorkers).distinct,
        unavailableWorkers.filter(_ != workerRef),
        currentEpoch,
        allEpochs,
        currentMiniBatch
      )

    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      workerNodesUp.values.foreach { workerRef =>
        workerRef ! up2DateParametersAndStaleness
      }

    case workerRef: ActorRef =>
      self ! StartDistributing

      context become distributeDataAmongWorkerNodes(
        remainingMiniBatches,
        miniBatches,
        (workerRef +: availableWorkers).distinct,
        unavailableWorkers.filter(_ != workerRef),
        currentEpoch,
        allEpochs,
        currentMiniBatch
      )
  }

  def distributeDataAmongWorkerNodes(
    remainingMiniBatches: B,
    miniBatches: B,
    availableWorkers: Seq[ActorRef],
    unavailableWorkers: Seq[ActorRef],
    currentEpoch: Int,
    allEpochs: Int,
    currentMiniBatch: Int): Receive = {

    case Ready(workerRef: ActorRef) if workerRef.path.address.port.getOrElse(None).isInstanceOf[Int] =>
      self ! StartDistributing

      context become distributeDataAmongWorkerNodes(
        remainingMiniBatches,
        miniBatches,
        (workerRef +: availableWorkers).distinct,
        unavailableWorkers.filter(_ != workerRef),
        currentEpoch,
        allEpochs,
        currentMiniBatch
      )

    case StartDistributing =>
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
      } else if (currentMiniBatch < miniBatches.size) {
        val miniBatch: M = remainingMiniBatches.head
        val x: M = miniBatch.map(_.init)
        val y: M = miniBatch.map(m => (1 to outputSize).map(_ => m.last).toVector)

        val workerRef: ActorRef = availableWorkers.head

        workerRef ! ForwardPass(x, y, currentEpoch, currentMiniBatch)

        self ! StartDistributing

        // Thread.sleep(100)

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
        self ! PerformChaincode

        context become chaincode(
          remainingMiniBatches,
          miniBatches,
          availableWorkers,
          unavailableWorkers,
          currentEpoch,
          allEpochs
        )
      }

    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      workerNodesUp.values.foreach { workerRef =>
        workerRef ! up2DateParametersAndStaleness
      }
  }

  private def chaincode(
    remainingMiniBatch: B,
    miniBatches: B,
    availableWorkers: Seq[ActorRef],
    unavailableWorkers: Seq[ActorRef],
    currentEpoch: Int,
    allEpochs: Int): Receive = {

    case PerformChaincode =>
      if (availableWorkers.size < 4) {
        // println(s"There's only: ${availableWorkers.size} available")
        // availableWorkers.foreach { worker =>
        //   println(worker)
        // }
        // println()

        context become chaincode(
          remainingMiniBatch,
          miniBatches,
          availableWorkers,
          unavailableWorkers,
          currentEpoch,
          allEpochs
        )
      } else {
        // println(s"It's all good; there are: ${availableWorkers.size} should be 4")
        // availableWorkers.foreach { worker =>
        //   println(worker)
        // }
        // println()

        availableWorkers
          .zip((1 to availableWorkers.size)
            .map(_ => remainingMiniBatch))
          .foreach { case (workerRef, miniBatch) =>
            val x: M = miniBatch.head.map(_.init)
            val y: M = miniBatch.head.map(m => (1 to outputSize).map(_ => m.last).toVector)
            // println(s"Performing the chaincode for epoch: $currentEpoch; available workers: ${availableWorkers.size}")
            workerRef ! ForwardPass(x, y, currentEpoch, miniBatches.size)

            // Thread.sleep(100)
          }

        if (currentEpoch == allEpochs) context become done
        else {
          self ! StartDistributing

          context become distributeDataAmongWorkerNodes(
            shuffle(miniBatches),
            miniBatches,
            availableWorkers,
            unavailableWorkers,
            currentEpoch + 1,
            allEpochs,
            1
          )
        }
      }

    case Ready(workerRef: ActorRef) if workerRef.path.address.port.getOrElse(None).isInstanceOf[Int] =>
      self ! PerformChaincode

      context become chaincode(
        remainingMiniBatch,
        miniBatches,
        (workerRef +: availableWorkers).distinct,
        if (unavailableWorkers.contains(workerRef)) unavailableWorkers.filter(_ != workerRef)
        else unavailableWorkers,
        currentEpoch,
        allEpochs
      )
  }

  private def done: Receive = {
    case _ =>
      // println("DONE 4 2NIGHT!")
      // println(System.nanoTime)
  }

  private def shuffle(fullBatch: B): B =
    Random.shuffle(fullBatch)
}
