package pl.chaineural.messagesDomains

import akka.actor.ActorRef


object InformationExchangeDomain {
  final case class DistributeMiniBatches(path: String, sizeOfDataBatches: Int)
  final case object StartDistributing
  final case class ProvideTrainingDetails(miniBatchSize: Int, featuresSize: Int, hiddenSize: Int, outputSize: Int)
  final case class Ready(workerRef: ActorRef)
  final case class Hyperparameters(
    amountOfWorkers: Int,
    synchronizationHyperparameter: Int,
    sizeOfMiniBatches: Int,
    featuresSize: Int,
    hiddenSize: Int,
    outputSize: Int,
    eta: Double
  )
}
