package pl.chaineural.messagesDomains

import akka.actor.ActorRef

import pl.chaineural.dataStructures.B

object InformationExchangeDomain {
  final case class DistributeMiniBatches(miniBatches: B, epochs: Int)
  final case object StartDistributing
  final case class ProvideTrainingDetails(miniBatchSize: Int, featuresSize: Int, hiddenSize: Int, outputSize: Int)
  final case object ProvideAmountOfMiniBatches
  final case class Ready(workerRef: ActorRef)
  final case class Hyperparameters(
    amountOfWorkers: Int,
    synchronizationHyperparameter: Int,
    featuresSize: Int,
    hiddenSize: Int,
    outputSize: Int,
    epochs: Int,
    eta: Double
  )
  final case object PerformChaincode
}
