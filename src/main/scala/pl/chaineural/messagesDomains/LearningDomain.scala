package pl.chaineural.messagesDomains

import akka.actor.ActorRef
import pl.chaineural.dataStructures.{M, Matrices}


object LearningDomain {
  final case class ForwardPass(x: M, y: M, epoch: Int, miniBatch: Int)
  final case class ProvideMiniBatch(x: M, y: M, workerRef: ActorRef, amountOfDataMiniBatches: Int)
  final case class BackwardPass(x: M, y: M, z1: Matrices, a1: Matrices, z2: Matrices, chaineuralMaster: ActorRef)
  final case class BackpropagatedParameters(jacobianW1: M, jacobianB1: M, jacobianW2: M, jacobianB2: M, localStaleness: BigInt)
}
