package pl.chaineural

import akka.actor.{ActorRef, Props}


object ChaineuralWorker {
  def props(stalenessWorker: ActorRef, amountOfWorkers: Int): Props =
    Props(new ChaineuralWorker(stalenessWorker, amountOfWorkers))
}

class ChaineuralWorker(stalenessWorker: ActorRef, amountOfWorkers: Int) extends Actress {

  import pl.chaineural.ChaineuralDomain._
  import pl.chaineural.dataStructures._

  /**
   * Learning rule:
   *   θ -= η * ∇θ / τ
   *
   * Glossary:
   *   η             - learning rate
   *   θ             - generalized parameter
   *   ∇θ            - (∂Loss / ∂θ) local (?) gradient of the parameter
   *   μ             - total amount of mini-batches
   *   τ             - staleness of parameters in current run
   *
   * Forward pass:
   *   Z1            = X @ W1 + B1
   *   A1            = tanh(Z1)
   *   Z2            = A1 @ W2 + B2
   *   Loss          = 1 / μ * ∑ (Z2 - Y) ** 2 =
   *                   1 / μ * ∑ (tanh(X @ W1 + B1) @ W2 + B2 - Y) ** 2
   *
   * Backward pass based on abstract computational graph:
   *   ∂Loss / ∂Loss = 1.0
   *   ∂Loss / ∂Z2   = ∂Loss / ∂Z2 * Z2 =
   *                   2 / μ * ∑ (Z2 - Y) * Z2
   *   ∂Loss / ∂B2   = ∂Loss / ∂Z2 * Z2 =
   *                   2 / μ * ∑ (Z2 - Y) * Z2
   *   ∂Loss / ∂W2   = ∂Loss / ∂Z2 * A1 =
   *                   2 / μ * ∑ (Z2 - Y) * A1
   *   ∂Loss / ∂A1   = ∂Loss / ∂Z2 * W2
   *                   2 / μ * ∑ (Z2 - Y) * W2
   *   ∂Loss / ∂Z1   = ∂Loss / ∂Z2 * ∂Z2 / ∂A1 * Z1 =
   *                   [2 / μ * ∑ (Z2 - Y)] * [1 - tanh**2(Z1)] * Z1
   *   ∂Loss / ∂B1   = ∂Loss / ∂Z2 * ∂Z2 / ∂A1 * Z1 =
   *                   [2 / μ * ∑ (Z2 - Y)] * [1 - tanh**2(Z1)] * Z1
   *   ∂Loss / ∂W1   = ∂Loss / ∂Z2 * ∂Z2 / ∂A1 * X =
   *                   [2 / μ * ∑ (Z2 - Y)] * [1 - tanh**2(Z1)] * X
   */

  override def receive: Receive = initializeWeights

  def initializeWeights: Receive = {
    /**
     * Duplicated with the processWork receive handler,
     * but for now (due to the state initialization) let's leave it as is.
     */
    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      log.info("[worker]: Up to date parameters and staleness (initialization)")
      context become processWork(up2DateParametersAndStaleness)
  }

  def processWork(up2DateParametersAndStaleness: Up2DateParametersAndStaleness): Receive = {
    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      log.info("[worker]: Up to date parameters and staleness (update)")
      context become processWork(up2DateParametersAndStaleness)

    case ForwardPass(x: M, y: V) =>
      log.info(s"[worker]: Forward pass")
      log.info(s"[worker]: The input's shape is (${x.size}, ${x.head.size})")

      val θZ1: Matrices = Matrices(Matrices(Matrices(x) ⓧ up2DateParametersAndStaleness.θW1) + up2DateParametersAndStaleness.θB1)
      val θA1: Matrices = Matrices(!θZ1)
      val θZ2: Vectors = Vectors(Matrices(Matrices(θA1 ⓧ up2DateParametersAndStaleness.θW2) + up2DateParametersAndStaleness.θB2).squeeze())
      val Loss: Float = 1.0f / amountOfWorkers.toFloat * math.pow(Vectors(θZ2 - y).sumValues, 2.0f).toFloat

      log.info(f"[worker]: Loss = $Loss%1.8f")

      self ! BackwardPass(up2DateParametersAndStaleness.amountOfMiniBatches, x, y, θZ1, θA1, θZ2, Loss)

    case BackwardPass(amountOfMiniBatches: Int, X: M, Y: V, zθ1: Matrices, aθ1: Matrices, zθ2: Vectors, loss: Float) =>
      log.info(s"[worker]: Backward pass")
      val dθLoss: Float = 1.0f
      val dLossdθZ2: Float = 2.0f / amountOfMiniBatches * Vectors(zθ2 - Y).sumValues
      val JacobianθZ2: V = zθ2 * dLossdθZ2
      val JacobianθB2: V = JacobianθZ2 // this one needs to be expanded into matrix
      val JacobianθW2: M = aθ1 * dLossdθZ2
      val tmp: M = Matrices(!zθ1).elementWisePow(2)
      val dθZ2dθA1: Float = Matrices(Matrices(tmp).ones) - (Matrices(!zθ1).elementWisePow(2))
      val JacobianθZ1: M = zθ1 * (dLossdθZ2 * dθZ2dθA1)
      val JacobianθB1: M = JacobianθZ1
      val JacobianθW1: M = Matrices(X) * (dLossdθZ2 * dθZ2dθA1)

      assert(testShapes(JacobianθW1, up2DateParametersAndStaleness.θW1))
      assert(testShapes(JacobianθB1, up2DateParametersAndStaleness.θB1))
      assert(testShapes(JacobianθW2, up2DateParametersAndStaleness.θW2))
      assert(testShapes(JacobianθB2, up2DateParametersAndStaleness.θB2))

      stalenessWorker ! BackPropagatedParameters(JacobianθW1, JacobianθB1, JacobianθW2, JacobianθB2)

    case _ =>
  }

  def testShapes(jacobian: M, matrix: M): Boolean =
    jacobian.size == matrix.size && jacobian(0).size == matrix(0).size
}
