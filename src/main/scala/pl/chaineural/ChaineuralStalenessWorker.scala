package pl.chaineural

import akka.actor.{ActorRef, Props}

import scala.util.Random
import pl.chaineural.dataStructures.{M, Matrices, V}


object ChaineuralStalenessWorker {
  def props(amountOfWorkers: Int, synchronizationHyperparameter: Int, eta: Float): Props =
    Props(new ChaineuralStalenessWorker(amountOfWorkers, synchronizationHyperparameter, eta))
}

class ChaineuralStalenessWorker(amountOfWorkers: Int, synchronizationHyperparameter: Int, eta: Float) extends Actress {

  import pl.chaineural.messagesDomains.InformationExchangeDomain._
  import pl.chaineural.messagesDomains.LearningDomain._
  import pl.chaineural.messagesDomains.ParametersExchangeDomain._

  val stalenessSynchronizationThreshold: Int = (amountOfWorkers / synchronizationHyperparameter).floor.toInt

  private case class ParameterStalenessPair(jacobian: M, localStaleness: BigInt)

  private case class BackpropagatedParametersStorage(jacobiansW1: Seq[ParameterStalenessPair], jacobiansB1: Seq[ParameterStalenessPair], jacobiansW2: Seq[ParameterStalenessPair], jacobiansB2: Seq[ParameterStalenessPair])

  override def receive: Receive = initializing

  def initializing: Receive = {
    case trainingDetails: ProvideTrainingDetails =>
      context become broadcastAndTrackStaleness(
        sender(),
        0,
        0,
        initializeNeuralNetwork(trainingDetails),
        BackpropagatedParametersStorage(
          Seq(ParameterStalenessPair(zeroedMatrix(trainingDetails.featuresSize, trainingDetails.hiddenSize), 0)),
          Seq(ParameterStalenessPair(zeroedMatrix(trainingDetails.miniBatchSize, trainingDetails.hiddenSize), 0)),
          Seq(ParameterStalenessPair(zeroedMatrix(trainingDetails.hiddenSize, trainingDetails.outputSize), 0)),
          Seq(ParameterStalenessPair(zeroedMatrix(trainingDetails.miniBatchSize, trainingDetails.outputSize), 0))
        )
      )
  }

  def broadcastAndTrackStaleness(chaineuralMaster: ActorRef,
    receivedBackpropagatedParametersCounter: BigInt,
    globalStalenessClock: BigInt,
    up2DateParametersAndStaleness: Up2DateParametersAndStaleness,
    backpropagatedParametersStorage: BackpropagatedParametersStorage): Receive = {

    case OrderUp2DateParametersAndStaleness(workerRef) =>
      log.info("[staleness worker]: Providing up to date parameters")
      log.info(s"[staleness]: ${up2DateParametersAndStaleness.staleness}")
      workerRef ! up2DateParametersAndStaleness

    case ProvideMiniBatch(x: M, y: M, workerRef: ActorRef, allMiniBatches: Int) =>
      workerRef ! ForwardPass(x, y, allMiniBatches)

    case ready @ Ready =>
      chaineuralMaster ! ready

    case backpropagatedParameters: BackpropagatedParameters =>
      chaineuralMaster ! sender()

      val updatedReceivedBackpropagatedParametersCount: BigInt = receivedBackpropagatedParametersCounter + 1
//      log.info(s"Gotten gradients: $updatedReceivedBackpropagatedParametersCount")

      val updatedBackpropagatedParametersStorage: BackpropagatedParametersStorage =
        updateBackpropagatedParametersStorage(backpropagatedParameters, backpropagatedParametersStorage)

      if (updatedReceivedBackpropagatedParametersCount % stalenessSynchronizationThreshold == 0) {
        log.info(s"Time for an update: $updatedReceivedBackpropagatedParametersCount")
        val updatedGlobalStalenessClock: BigInt = globalStalenessClock + 1
        val updatedUp2DateParametersAndStaleness: Up2DateParametersAndStaleness =
          calculateUp2DateParametersAndStaleness(backpropagatedParametersStorage, updatedGlobalStalenessClock)

        // chaineuralMaster ! BroadcastParameters2Workers
        chaineuralMaster ! up2DateParametersAndStaleness

        context become broadcastAndTrackStaleness(
          chaineuralMaster,
          updatedReceivedBackpropagatedParametersCount,
          updatedGlobalStalenessClock,
          updatedUp2DateParametersAndStaleness,
          BackpropagatedParametersStorage(Seq(), Seq(), Seq(), Seq())
        )
      } else {
        context become broadcastAndTrackStaleness(
          chaineuralMaster: ActorRef,
          updatedReceivedBackpropagatedParametersCount,
          globalStalenessClock,
          up2DateParametersAndStaleness,
          updatedBackpropagatedParametersStorage
        )
      }
  }

  private def initializeNeuralNetwork(trainingDetails: ProvideTrainingDetails): Up2DateParametersAndStaleness =
    Up2DateParametersAndStaleness(
      generateθ(trainingDetails.featuresSize, trainingDetails.hiddenSize),
      generateθ(trainingDetails.miniBatchSize, trainingDetails.hiddenSize),
      generateθ(trainingDetails.hiddenSize, trainingDetails.outputSize),
      generateθ(trainingDetails.miniBatchSize, trainingDetails.outputSize),
      0
    )

  private def generateθ(xDimension: Int, yDimension: Int): M =
    (1 to xDimension)
      .map(_ => (for (_ <- 1 to yDimension) yield (math.sqrt(2.0 / yDimension) * Random.nextDouble).toFloat).toVector)
      .toVector

  private def updateBackpropagatedParametersStorage(backpropagatedParameters: BackpropagatedParameters, backpropagatedParametersStorage: BackpropagatedParametersStorage): BackpropagatedParametersStorage =
    BackpropagatedParametersStorage(
      ParameterStalenessPair(backpropagatedParameters.jacobianW1, backpropagatedParameters.localStaleness)
        +: backpropagatedParametersStorage.jacobiansW1,
      ParameterStalenessPair(backpropagatedParameters.jacobianB1, backpropagatedParameters.localStaleness)
        +: backpropagatedParametersStorage.jacobiansB1,
      ParameterStalenessPair(backpropagatedParameters.jacobianW2, backpropagatedParameters.localStaleness)
        +: backpropagatedParametersStorage.jacobiansW2,
      ParameterStalenessPair(backpropagatedParameters.jacobianB2, backpropagatedParameters.localStaleness)
        +: backpropagatedParametersStorage.jacobiansB2
    )

  private def calculateUp2DateParametersAndStaleness(backpropagatedParametersStorage: BackpropagatedParametersStorage, globalStalenessClock: BigInt): Up2DateParametersAndStaleness =
    Up2DateParametersAndStaleness(
      stalenessAwareParameterUpdate(backpropagatedParametersStorage.jacobiansW1, globalStalenessClock),
      stalenessAwareParameterUpdate(backpropagatedParametersStorage.jacobiansB1, globalStalenessClock),
      stalenessAwareParameterUpdate(backpropagatedParametersStorage.jacobiansW2, globalStalenessClock),
      stalenessAwareParameterUpdate(backpropagatedParametersStorage.jacobiansB2, globalStalenessClock),
      globalStalenessClock
    )

  private def stalenessAwareParameterUpdate(jacobians: Seq[ParameterStalenessPair], globalStaleness: BigInt): M = {
    val zeroedJacobian: M = zeroedMatrix(jacobians.head.jacobian.size, jacobians.head.jacobian(0).size)

    Matrices(jacobians.foldLeft(ParameterStalenessPair(zeroedJacobian, 0)) { case (m1: ParameterStalenessPair, m2: ParameterStalenessPair) =>
      sumJacobians(m1, m2, 0.0001f, globalStaleness)
    }.jacobian) / stalenessSynchronizationThreshold.toFloat
  }

  private def sumJacobians(m1: ParameterStalenessPair, m2: ParameterStalenessPair, eta: Float, globalStaleness: BigInt): ParameterStalenessPair =
    ParameterStalenessPair(
      m1.jacobian.zip(m2.jacobian).map { case (m11: V, m21: V) =>
        m11.zip(m21).map { case (m12: Float, m22: Float) =>
          (m12 / (globalStaleness - m1.localStaleness).toFloat + m22 / (globalStaleness - m2.localStaleness).toFloat) * eta
        }
      }, 0
    )

  private def zeroedMatrix(xDimension: Int, yDimension: Int): M =
    (1 to xDimension)
      .map(_ => (for (_ <- 1 to yDimension) yield 0.0f).toVector)
      .toVector

}
