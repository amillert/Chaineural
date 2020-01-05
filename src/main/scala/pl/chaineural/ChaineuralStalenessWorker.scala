package pl.chaineural

import akka.actor.{ActorRef, Props}

import scala.util.Random

import pl.chaineural.dataStructures.M


object ChaineuralStalenessWorker {
  def props(amountOfWorkers: Int, synchronizationHyperparameter: Int): Props =
    Props(new ChaineuralStalenessWorker(amountOfWorkers, synchronizationHyperparameter))
}

class ChaineuralStalenessWorker(amountOfWorkers: Int, synchronizationHyperparameter: Int) extends Actress {

  import pl.chaineural.messagesDomains.InformationExchangeDomain._
  import pl.chaineural.messagesDomains.LearningDomain._
  import pl.chaineural.messagesDomains.ParametersExchangeDomain._

  var stalenessClock: BigInt = 0
  var miniBatchesSoFarCounter = 0
  val stalenessMiniBatchesThreshold: Int = (amountOfWorkers / synchronizationHyperparameter).floor.toInt

  override def receive: Receive = initializing

  def initializing: Receive = {
    case trainingDetails: ProvideTrainingDetails =>
      context become broadcastAndTrackStaleness(sender(), initializeNeuralNetwork(trainingDetails))
  }

  def broadcastAndTrackStaleness(chaineuralMaster: ActorRef, up2DateParametersAndStaleness: Up2DateParametersAndStaleness): Receive = {
    // Most probably this one will be redundant; which may simplify code in Chaineural as well
    case OrderInitialParametersAndStaleness(workerRef: ActorRef) =>
      log.info("[staleness worker]: Providing up to date parameters")
      workerRef ! up2DateParametersAndStaleness

    case OrderUp2DateParametersAndStaleness(workerRef: ActorRef) =>
      log.info("[staleness worker]: Providing up to date parameters")
      workerRef ! up2DateParametersAndStaleness

    case BackPropagatedParameters(jacobianW1: M, jacobianB1: M, jacobianW2: M, jacobianB2: M) =>
      // TODO: Think of what to do with the backpropagated parameters
      increaseMiniBatchesCounterSoFarClock()

      if (stalenessClock % stalenessMiniBatchesThreshold == 0) {
        increaseStalenessClock()

        chaineuralMaster ! BroadcastParameters2Workers

        context become broadcastAndTrackStaleness(
          chaineuralMaster: ActorRef,
          Up2DateParametersAndStaleness(
            jacobianW1,
            jacobianB1,
            jacobianW2,
            jacobianB2,
            stalenessClock))
      }
  }

  private def initializeNeuralNetwork(trainingDetails: ProvideTrainingDetails): Up2DateParametersAndStaleness =
    Up2DateParametersAndStaleness(
      generateθ(trainingDetails.featuresSize, trainingDetails.hiddenSize),
      generateθ(trainingDetails.miniBatchSize, trainingDetails.hiddenSize),
      generateθ(trainingDetails.hiddenSize, trainingDetails.outputSize),
      generateθ(trainingDetails.miniBatchSize, trainingDetails.outputSize),
      stalenessClock
    )

  private def generateθ(xDimension: Int, yDimension: Int): M =
    (1 to xDimension)
      .map(_ => (for (_ <- 1 to yDimension) yield (math.sqrt(2.0 / yDimension) * Random.nextDouble).toFloat).toVector)
      .toVector

  private def increaseStalenessClock(): Unit =
    stalenessClock += 1

  private def increaseMiniBatchesCounterSoFarClock(): Unit =
    miniBatchesSoFarCounter += 1
}
