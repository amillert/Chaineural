package pl.chaineural.messagesDomains

import akka.actor.ActorRef

import pl.chaineural.dataStructures.M


object ParametersExchangeDomain {
  final case class OrderUp2DateParametersAndStaleness(workerRef: ActorRef)
  final case class Up2DateParametersAndStaleness(w1: M, b1: M, w2: M, b2: M, staleness: BigInt)
  final case object BroadcastParameters2Workers
}
