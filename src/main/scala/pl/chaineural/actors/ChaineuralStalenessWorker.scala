package pl.chaineural.actors

import akka.actor.{ActorRef, Props}
import pl.chaineural.dataStructures.{M, Matrices}

import scala.util.Random


object ChaineuralStalenessWorker {
  def props(amountOfWorkers: Int, synchronizationHyperparameter: Int, eta: Double, min: Double, max: Double): Props =
    Props(new ChaineuralStalenessWorker(amountOfWorkers, synchronizationHyperparameter, eta, min, max))
}

class ChaineuralStalenessWorker(amountOfWorkers: Int, synchronizationHyperparameter: Int, eta: Double, min: Double, max: Double) extends Actress {

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
//      log.info("got info about master")
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
        // BackpropagatedParametersStorage(
        //   Seq(ParameterStalenessPair(randomizedMatrix(trainingDetails.featuresSize, trainingDetails.hiddenSize), 0)),
        //   Seq(ParameterStalenessPair(randomizedMatrix(trainingDetails.miniBatchSize, trainingDetails.hiddenSize), 0)),
        //   Seq(ParameterStalenessPair(randomizedMatrix(trainingDetails.hiddenSize, trainingDetails.outputSize), 0)),
        //   Seq(ParameterStalenessPair(randomizedMatrix(trainingDetails.miniBatchSize, trainingDetails.outputSize), 0))
        // )
      )
  }

  def broadcastAndTrackStaleness(chaineuralMaster: ActorRef,
    receivedBackpropagatedParametersCounter: BigInt,
    globalStalenessClock: BigInt,
    up2DateParametersAndStaleness: Up2DateParametersAndStaleness,
    backpropagatedParametersStorage: BackpropagatedParametersStorage): Receive = {

    case OrderInitialParametersAndStaleness(workerRef) => {
      // it could probably be refactored cause it's being called only for initialization
//      log.info(s"Order up2 date parameters in the staleness worker")
      //      log.info("[staleness worker]: Providing up to date parameters")
      //      log.info(s"[staleness]: ${up2DateParametersAndStaleness.staleness}")
      // println(s"Initially staleness is: ${up2DateParametersAndStaleness.staleness}")
      workerRef ! up2DateParametersAndStaleness
    }

    case backpropagatedParameters: BackpropagatedParameters =>
      // TODO: this part is responsible for sending master worker ref
      chaineuralMaster ! sender()

      val updatedReceivedBackpropagatedParametersCount: BigInt = receivedBackpropagatedParametersCounter + 1
//      log.info(s"Gotten gradients: $updatedReceivedBackpropagatedParametersCount")

      val updatedBackpropagatedParametersStorage: BackpropagatedParametersStorage =
        updateBackpropagatedParametersStorage(backpropagatedParameters, backpropagatedParametersStorage)

      if (updatedReceivedBackpropagatedParametersCount % stalenessSynchronizationThreshold == 0) {
//        log.info(s"Time for an update: $updatedReceivedBackpropagatedParametersCount")
        val updatedGlobalStalenessClock: BigInt = globalStalenessClock + 1
        val updatedUp2DateParametersAndStaleness: Up2DateParametersAndStaleness =
          calculateUp2DateParametersAndStaleness(updatedBackpropagatedParametersStorage, updatedGlobalStalenessClock)

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
      generateRandomizedθ(trainingDetails.featuresSize, trainingDetails.hiddenSize),
      generateRandomizedθ(trainingDetails.miniBatchSize, trainingDetails.hiddenSize),
      generateRandomizedθ(trainingDetails.hiddenSize, trainingDetails.outputSize),
      generateRandomizedθ(trainingDetails.miniBatchSize, trainingDetails.outputSize),
      0
    )

  private def generateRandomizedθ(xDimension: Int, yDimension: Int): M = {
    // normalizeCustom(
      (1 to xDimension)
      .map(_ => (for (_ <- 1 to yDimension) yield (math.sqrt(2.0 / yDimension) * Random.nextDouble)).toVector)
      .toVector
    // ).matrix
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
//     val zeroedJacobian: M = zeroedMatrix(jacobians.head.jacobian.size, jacobians.head.jacobian(0).size)

    println(s"amount of backpropagated ${jacobians.size} while updating")
    Matrices(normalizeCustom(
      // jacobians.foldLeft(ParameterStalenessPair(zeroedJacobian, globalStaleness)) {
      // jacobians.tail.foldLeft(jacobians.head) {
      jacobians.foldLeft(
        ParameterStalenessPair(
          zeroedMatrix(jacobians.head.jacobian.size, jacobians.head.jacobian(0).size),
          // it's because in reduce the first one will always be the reduced value
          globalStaleness + 1)) { case (m1, m2) =>
        sumJacobians(m1, m2, globalStaleness)
      }.jacobian
    ) / (jacobians.size / stalenessSynchronizationThreshold)).matrix
  }

  private def sumJacobians(
    mAccumulator: ParameterStalenessPair,
    m: ParameterStalenessPair,
    globalStaleness: BigInt): ParameterStalenessPair = {

    val mStaleness: Double = (globalStaleness - m.localStaleness).toDouble

    // way too big differences between staleness
//    println(s"staleness: $globalStaleness 1st: ${m.localStaleness} 2nd: $mStaleness")

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

  // private def randomizedMatrix(xDimension: Int, yDimension: Int): M =
  //   // normalizeCustom(
  //     (1 to xDimension)
  //       .map(_ => (for (_ <- 1 to yDimension) yield Random.nextDouble).toVector)
  //       .toVector
  //   // ).matrix

  private def zeroedMatrix(xDimension: Int, yDimension: Int): M =
    (1 to xDimension)
      .map(_ => (for (_ <- 1 to yDimension) yield 0.0).toVector)
      .toVector

  def normalizeCustom(m: M): Matrices = {
    // val max: Double = m.flatten.max
    // val min: Double = m.flatten.min
    Matrices(m.map(_.map { x =>
      0.00001 + (0.99999 - 0.00001) * ((x - min) / (max - min))
      // 0.1 + (0.9 - 0.1) * ((x - min) / (max - min))
    }))
  }
  def normalize(m: M): Matrices = {
    // val max: Double = m.flatten.max
    // val min: Double = m.flatten.min
    Matrices(m.map(_.map { x =>
      if (max == min || x == min && min > 0.0) min
      else if (max == min || x == min && min == 0.0) min + 0.00001
      else (x - min) / (max - min)
    }))
    // if (max == min) Matrices(m.map(_.map(_ => 0.5)))
    // Matrices(m.map(_.map(x => (x - min) / (max - min))))
  }
}
