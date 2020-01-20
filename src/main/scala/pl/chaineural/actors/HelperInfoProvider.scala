package pl.chaineural.actors

import akka.actor.{ActorRef, Props}


object HelperInfoProvider {
  def props(chaineuralMaster: ActorRef): Props =
    Props(new HelperInfoProvider(chaineuralMaster))
}

class HelperInfoProvider(chaineuralMaster: ActorRef) extends Actress {
  import pl.chaineural.messagesDomains.InformationExchangeDomain.ProvideAmountOfMiniBatches

  override def receive: Receive = {
    case ProvideAmountOfMiniBatches =>
      chaineuralMaster ! ProvideAmountOfMiniBatches
  }
}
