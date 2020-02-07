package pl.chaineural.actors

import akka.actor.{ActorRef, Props}
import pl.chaineural.dataStructures.{M, Matrices}

import scala.util.Random

object ChaineuralStalenessWorker {
  def props(amountOfWorkers: Int, synchronizationHyperparameter: Int, eta: Double, min: Double, max: Double): Props =
    Props(new ChaineuralStalenessWorker(amountOfWorkers, synchronizationHyperparameter, eta, min, max))
}

class ChaineuralStalenessWorker(
  amountOfWorkers: Int,
  synchronizationHyperparameter: Int,
  eta: Double,
  min: Double,
  max: Double) extends Actress {

  import pl.chaineural.messagesDomains.InformationExchangeDomain._
  import pl.chaineural.messagesDomains.LearningDomain._
  import pl.chaineural.messagesDomains.ParametersExchangeDomain._

  val stalenessSynchronizationThreshold: Int = (amountOfWorkers / synchronizationHyperparameter).floor.toInt

  private case class ParameterStalenessPair(jacobian: M, localStaleness: BigInt)

  private case class BackpropagatedParametersStorage(
    jacobiansW1: Seq[ParameterStalenessPair],
    jacobiansB1: Seq[ParameterStalenessPair],
    jacobiansW2: Seq[ParameterStalenessPair],
    jacobiansB2: Seq[ParameterStalenessPair]
  )

  override def receive: Receive = {
    case chaineuralMaster: ActorRef =>
      context become initializing(chaineuralMaster)
  }

  def initializing(chaineuralMaster: ActorRef): Receive = {
    case trainingDetails: ProvideTrainingDetails =>
      context become broadcastAndTrackStaleness(
        chaineuralMaster,
        0,
        0,
        initializeNeuralNetwork(trainingDetails),
        BackpropagatedParametersStorage(
          Seq(), Seq(), Seq(), Seq()
        )
      )
  }

  def broadcastAndTrackStaleness(chaineuralMaster: ActorRef,
    receivedBackpropagatedParametersCounter: BigInt,
    globalStalenessClock: BigInt,
    up2DateParametersAndStaleness: Up2DateParametersAndStaleness,
    backpropagatedParametersStorage: BackpropagatedParametersStorage): Receive = {

    case OrderInitialParametersAndStaleness(workerRef) =>
      workerRef ! up2DateParametersAndStaleness

    case backpropagatedParameters: BackpropagatedParameters =>
      chaineuralMaster ! sender

      val updatedReceivedBackpropagatedParametersCount: BigInt = receivedBackpropagatedParametersCounter + 1

      val updatedBackpropagatedParametersStorage: BackpropagatedParametersStorage =
        updateBackpropagatedParametersStorage(backpropagatedParameters, backpropagatedParametersStorage)

      // println(s"staleness: ${updatedBackpropagatedParametersStorage.jacobiansB1.size} backpropagated")

      if (updatedReceivedBackpropagatedParametersCount % stalenessSynchronizationThreshold == 0) {
        val updatedGlobalStalenessClock: BigInt = globalStalenessClock + 1
        val updatedUp2DateParametersAndStaleness: Up2DateParametersAndStaleness =
          calculateUp2DateParametersAndStaleness(updatedBackpropagatedParametersStorage, updatedGlobalStalenessClock)

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
      generateRandomizedParameter(trainingDetails.featuresSize, trainingDetails.hiddenSize),
      generateRandomizedParameter(trainingDetails.miniBatchSize, trainingDetails.hiddenSize),
      generateRandomizedParameter(trainingDetails.hiddenSize, trainingDetails.outputSize),
      generateRandomizedParameter(trainingDetails.miniBatchSize, trainingDetails.outputSize),
      0
    )

  private def generateRandomizedParameter(xDim: Int, yDim: Int): M = {
    val dimSum: Double = (xDim + yDim).toDouble
    (1 to xDim)
      .map { _ =>
        (for (_ <- 1 to yDim) yield Random.between(
          -math.sqrt(6) / math.sqrt(dimSum),
          math.sqrt(6) / math.sqrt(dimSum)
        )).toVector
      }.toVector
  }

  private def updateBackpropagatedParametersStorage(
    backpropagatedParameters: BackpropagatedParameters,
    backpropagatedParametersStorage: BackpropagatedParametersStorage): BackpropagatedParametersStorage =

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

  private def calculateUp2DateParametersAndStaleness(
    backpropagatedParametersStorage: BackpropagatedParametersStorage,
    globalStalenessClock: BigInt): Up2DateParametersAndStaleness =

    Up2DateParametersAndStaleness(
      stalenessAwareParameterUpdate(backpropagatedParametersStorage.jacobiansW1, globalStalenessClock),
      stalenessAwareParameterUpdate(backpropagatedParametersStorage.jacobiansB1, globalStalenessClock),
      stalenessAwareParameterUpdate(backpropagatedParametersStorage.jacobiansW2, globalStalenessClock),
      stalenessAwareParameterUpdate(backpropagatedParametersStorage.jacobiansB2, globalStalenessClock),
      globalStalenessClock
    )

  private def stalenessAwareParameterUpdate(jacobians: Seq[ParameterStalenessPair], globalStaleness: BigInt): M = {
    // println(s"staleness: ${globalStaleness + 1}   NEEEW!")
    Matrices(normalizeCustom(
      jacobians.foldLeft(
        ParameterStalenessPair(
          zeroedMatrix(jacobians.head.jacobian.size, jacobians.head.jacobian(0).size),
          // it's because in reduce the first one will always be the reduced value
          globalStaleness + 1)) { case (m1, m2) =>
        sumJacobians(m1, m2, globalStaleness)
      }.jacobian
    ) / (jacobians.size / stalenessSynchronizationThreshold)).matrix()
  }

  private def sumJacobians(
    mAccumulator: ParameterStalenessPair,
    m: ParameterStalenessPair,
    globalStaleness: BigInt): ParameterStalenessPair = {

    val mStaleness: Double = (globalStaleness - m.localStaleness).toDouble
    // println(s"staleness: $mStaleness")

    ParameterStalenessPair(
      // normalizeCustom(
        mAccumulator.jacobian.zip(m.jacobian).map { case (mAcc, mi) =>
          mAcc.zip(mi).map { case (mAcci, mii) =>
            mAcci + (mii / mStaleness * eta)
          }
        }
      // ).matrix
      , m.localStaleness
    )
  }

  private def zeroedMatrix(xDimension: Int, yDimension: Int): M =
    (1 to xDimension)
      .map(_ => (for (_ <- 1 to yDimension) yield 0.0).toVector)
      .toVector

  def normalizeCustom(m: M): Matrices =
    Matrices(m.map(_.map { x =>
      0.00001 + (0.99999 - 0.00001) * ((x - min) / (max - min))
    }))
}
