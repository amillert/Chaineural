package pl.chaineural.messagesDomains

import pl.chaineural.dataStructures.{M, Matrices}


object LearningDomain {
  final case class ForwardPass(x: M, y: M, amountOfDataMiniBatches: Int, eta: Float)
  final case class BackwardPass(amountOfDataMiniBatches: Int, x: M, y: M, z1: Matrices, a1: Matrices, z2: Matrices, eta: Float)
  final case class BackpropagatedParameters(jacobianW1: M, jacobianB1: M, jacobianW2: M, jacobianB2: M, localStaleness: BigInt)
}
