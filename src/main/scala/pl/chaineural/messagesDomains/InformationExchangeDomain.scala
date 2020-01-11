package pl.chaineural.messagesDomains

import akka.actor.ActorRef


object InformationExchangeDomain {
  final case class DistributeDataAmongWorkerNodes(path: String, sizeOfDataBatches: Int)
  final case object StartDistributing
  final case class ProvideTrainingDetails(amountOfMiniBatches: Int, miniBatchSize: Int = 200, featuresSize: Int = 9, hiddenSize: Int = 50, outputSize: Int = 5)
  final case class Ready(workerRef: ActorRef)
}
