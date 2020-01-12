package pl.chaineural.mailbox

import akka.actor.ActorSystem
import akka.cluster.ClusterEvent.MemberEvent
import akka.dispatch.{PriorityGenerator, UnboundedStablePriorityMailbox}
import com.typesafe.config.Config

import pl.chaineural.messagesDomains.LearningDomain._
import pl.chaineural.messagesDomains.ParametersExchangeDomain._


class WorkerPriorityMailbox(settings: ActorSystem.Settings, config: Config)
  extends UnboundedStablePriorityMailbox(
    PriorityGenerator {
      case Up2DateParametersAndStaleness => 1
      case BackwardPass => 0
      case ForwardPass => 2
      case _ => 5
    }
  )

class StalenessWorkerPriorityMailbox(settings: ActorSystem.Settings, config: Config)
  extends UnboundedStablePriorityMailbox(
    PriorityGenerator {
      case OrderInitialParametersAndStaleness => 1
      case Up2DateParametersAndStaleness => 0
      case BackpropagatedParameters => 1
      case _ => 5
    }
  )

class ChaineuralMasterPriorityMailbox(settings: ActorSystem.Settings, config: Config)
  extends UnboundedStablePriorityMailbox(
    PriorityGenerator {
      case _: MemberEvent => 0
      case _ => 5
    }
  )

