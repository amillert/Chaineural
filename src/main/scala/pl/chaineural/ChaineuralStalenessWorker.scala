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

  var chaineuralMaster: ActorRef = _
  var stalenessClock: BigInt = 0
  var miniBatchesSoFarCounter = 0
  val stalenessMiniBatchesThreshold: Int = (amountOfWorkers / synchronizationHyperparameter).floor.toInt

  override def receive: Receive = {
    case InformAboutMaster =>
      chaineuralMaster = sender()
      context become broadcasting(initializeNeuralNetwork())
  }

  def broadcasting(up2DateParametersAndStaleness: Up2DateParametersAndStaleness): Receive = {
    case ProvideUp2DateParameters(workerRef: ActorRef) =>
      workerRef ! up2DateParametersAndStaleness
    case FinishedBroadcastingParameters =>
      context become trackStaleness
  }

  def trackStaleness: Receive = {
    case BackPropagatedParameters(JacobianθW1: M, JacobianθB1: M, JacobianθW2: M, JacobianθB2: M) =>
      increaseMiniBatchesCounterSoFarClock()

      if (stalenessClock % stalenessMiniBatchesThreshold == 0) {
        increaseStalenessClock()
        context become broadcasting(Up2DateParametersAndStaleness(JacobianθW1, JacobianθB1, JacobianθW2, JacobianθB2, stalenessClock))
        chaineuralMaster ! BroadcastParameters2Workers
      }
  }

  private def initializeNeuralNetwork(dimensionX1: Int = 10, dimensionY1: Int = 50, dimensionX2: Int = 10, dimensionY2: Int = 10): Up2DateParametersAndStaleness =
    Up2DateParametersAndStaleness(
      generateθ(dimensionX1, dimensionY1),
      generateθ(dimensionX1, dimensionY1),
      generateθ(dimensionX2, dimensionY2),
      generateθ(dimensionX2, dimensionY2),
      stalenessClock
    )

  private def generateθ(xDimension: Int, yDimension: Int): M =
    (1 to xDimension)
      .map(_ => (for (x <- 1 to yDimension) yield Random.nextFloat).toVector)
      .toVector

  private def increaseStalenessClock(): Unit =
    stalenessClock += 1

  private def increaseMiniBatchesCounterSoFarClock(): Unit =
    miniBatchesSoFarCounter += 1
}
