package pl.chaineural

import akka.actor.{ActorRef, Props}
import pl.chaineural.dataStructures.M

import scala.util.Random


object ChaineuralStalenessWorker {
  def props(amountOfWorkers: Int, synchronizationHyperparameter: Int): Props =
    Props(new ChaineuralStalenessWorker(amountOfWorkers, synchronizationHyperparameter))
}

class ChaineuralStalenessWorker(amountOfWorkers: Int, synchronizationHyperparameter: Int) extends Actress {

  import pl.chaineural.ChaineuralDomain._

  var stalenessClock: BigInt = 0
  var miniBatchesSoFarCounter = 0
  val stalenessMiniBatchesThreshold: Int = (amountOfWorkers / synchronizationHyperparameter).floor.toInt

  override def receive: Receive = initializing

  def initializing: Receive = {
    case InformAboutMaster(amountOfMiniBatches: Int) =>
      context become broadcasting(sender(), initializeNeuralNetwork(amountOfMiniBatches))
  }

  def broadcasting(chaineuralMaster: ActorRef, up2DateParametersAndStaleness: Up2DateParametersAndStaleness): Receive = {
    case ProvideUp2DateParameters(workerRef: ActorRef) =>
      log.info("[staleness worker]: Provide up to date parameters")
      workerRef ! up2DateParametersAndStaleness
    case FinishedBroadcastingParameters =>
      context become trackStaleness(chaineuralMaster)
  }

  def trackStaleness(chaineuralMaster: ActorRef): Receive = {
    case BackPropagatedParameters(amountOfMiniBatches: Int, jacobianθW1: M, jacobianθB1: M, jacobianθW2: M, jacobianθB2: M) =>
      increaseMiniBatchesCounterSoFarClock()

      if (stalenessClock % stalenessMiniBatchesThreshold == 0) {
        increaseStalenessClock()
        context become broadcasting(
          chaineuralMaster: ActorRef,
          Up2DateParametersAndStaleness(
            amountOfMiniBatches,
            jacobianθW1,
            jacobianθB1,
            jacobianθW2,
            jacobianθB2,
            stalenessClock))
        chaineuralMaster ! BroadcastParameters2Workers
      }
  }

  private def initializeNeuralNetwork(amountOfMiniBatches: Int, BatchSize: Int = 200, FeaturesSize: Int = 9, HiddenSize: Int = 50, OutputSize: Int = 1): Up2DateParametersAndStaleness =
    Up2DateParametersAndStaleness(
      amountOfMiniBatches,
      generateθ(FeaturesSize, HiddenSize),
      generateθ(BatchSize, HiddenSize),
      generateθ(HiddenSize, OutputSize),
      generateθ(BatchSize, OutputSize),
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
