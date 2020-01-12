package pl.chaineural

import akka.actor.{ActorRef, Props}

import pl.chaineural.dataStructures.{M, Matrices}


object ChaineuralWorker {
  def props(stalenessWorker: ActorRef): Props =
    Props(new ChaineuralWorker(stalenessWorker))
}

class ChaineuralWorker(stalenessWorker: ActorRef) extends Actress {

  import pl.chaineural.messagesDomains.LearningDomain._
  import pl.chaineural.messagesDomains.ParametersExchangeDomain._
  import pl.chaineural.messagesDomains.InformationExchangeDomain._

  /**
   * Learning rule:
   *   θ -= η * ∇θ / τ
   *
   * Glossary:
   *   η             - learning rate
   *   θ             - generalized parameter
   *   ∇θ            - (∂Loss / ∂θ) local (?) gradient of the parameter
   *   μ             - mini-batch size
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
   *   ∂Loss / ∂Loss = 1
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
      //      log.info("[worker]: Up to date parameters and staleness (initialization)")
      context become processWork(up2DateParametersAndStaleness)
  }

  def processWork(up2DateParametersAndStaleness: Up2DateParametersAndStaleness): Receive = {
    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      // log.info("[worker]: Up to date parameters and staleness (update)")
      // log.info(s"[worker]: ${up2DateParametersAndStaleness.staleness}")
      context become processWork(up2DateParametersAndStaleness)

    case ForwardPass(x: M, y: M) =>
      // log.info(s"forward ${up2DateParametersAndStaleness.w1.flatten.sum}")
      // log.info(s"[worker]: Forward pass")
      // log.info(s"[worker]: The input's shape is (${x.size}, ${x.head.size})")
      // log.info(s"${up2DateParametersAndStaleness.staleness} sum: ${up2DateParametersAndStaleness.w1.flatten.sum}")

      // log.info(s"w1 ${up2DateParametersAndStaleness.w1}")
      // log.info(s"b1 ${up2DateParametersAndStaleness.b1}")
      val z1: Matrices = normalize(Matrices(Matrices(x) ⓧ up2DateParametersAndStaleness.w1) + up2DateParametersAndStaleness.b1)
      // log.info(s"[worker]: Z1 = X (${x.size}, ${x(0).size}) * W1 (${up2DateParametersAndStaleness.w1.size}, ${up2DateParametersAndStaleness.w1(0).size}) + B1 (${up2DateParametersAndStaleness.b1.size}, ${up2DateParametersAndStaleness.b1(0).size}) = Z1 (${z1.matrix().size}, ${z1.matrix()(0).size})")
      // log.info(s"z1 ${z1.matrix}")
      // TODO: normalization


      // val a1: Matrices = normalize(!z1)
      val a1: Matrices = Matrices(!z1)
      // log.info(s"[worker]: A1 = tanh(Z1 (${z1.matrix().size}, ${z1.matrix()(0).size}))")
      // log.info(s"a1 ${a1.matrix}")
      // log.info(s"w2 ${up2DateParametersAndStaleness.w2}")
      // log.info(s"b2 ${up2DateParametersAndStaleness.b2}")
      val z2: Matrices = Matrices(Matrices(a1 ⓧ up2DateParametersAndStaleness.w2) + up2DateParametersAndStaleness.b2)
      // log.info(s"[worker]: Z2 = A1 (${a1.matrix().size}, ${a1.matrix()(0).size}) * W2 (${up2DateParametersAndStaleness.w2.size}, ${up2DateParametersAndStaleness.w2(0).size}) + B2 (${up2DateParametersAndStaleness.b1.size}, ${up2DateParametersAndStaleness.b2(0).size}) = Z2 (${z2.matrix().size}, ${z2.matrix()(0).size})")
      // log.info(s"z2 ${z2.matrix}")
      val Loss: Float = 1.0f / y.size * math.pow((Matrices(y) - z2).map(_.sum).sum, 2.0f).toFloat

      log.info(f"[worker]: Loss = $Loss%1.8f")
//      log.info("\n")

      self ! BackwardPass(x, y, z1, a1, z2, sender())

    case BackwardPass(x: M, y: M, z1: Matrices, a1: Matrices, z2: Matrices, chaineuralMaster: ActorRef) =>
      // log.info(s"[worker]: Backward pass")
      // log.info(s"[worker]: y.shape -> (${y.size}, ${y(0).size}) z2.shape -> (${z2.matrix().size}, ${z2.matrix()(0).size})")
      val dLossdZ2: M = Matrices(Matrices(y) - z2) * (-2.0f / y.size)
      // log.info(s"dLossdZ2 ${dLossdZ2}")
      // log.info(s"[worker]: dz2 -> (${z2.matrix().size}, ${z2.matrix()(0).size}) == (${dLossdZ2.size}, ${dLossdZ2(0).size}) == (${up2DateParametersAndStaleness.b2.size}, ${up2DateParametersAndStaleness.b2(0).size})")
      val dLossdW2: M = Matrices(a1.transpose).product(dLossdZ2)
      // log.info(s"dLossdW2 ${dLossdW2}")
      // log.info(s"[worker]: dw2 -> (${up2DateParametersAndStaleness.w2.size}, ${up2DateParametersAndStaleness.w2(0).size}) == (${dLossdW2.size}, ${dLossdW2(0).size})")
      val dLossdA1: M = Matrices(dLossdZ2).product(Matrices(up2DateParametersAndStaleness.w2).transpose)
      // log.info(s"dLossdA1 ${dLossdA1}")
      // log.info(s"[worker]: da1 -> (${a1.matrix().size}, ${a1.matrix()(0).size}) == (${dLossdA1.size}, ${dLossdA1(0).size})")
      // log.info(s"z1: ${z1}")
      val dLossdZ1: M = Matrices(dLossdA1).elementWiseMultiplication(Matrices((1 to z1.matrix().size).map(i => (1 to z1.matrix()(0).size).map(_ => 1.0f).toVector).toVector) - Matrices(!z1).elementWisePow(2))
      // log.info(s"dLossdZ1 ${dLossdZ1}")
      // log.info(s"[worker]: dz1 -> (${z1.matrix().size}, ${z1.matrix()(0).size}) == (${dLossdZ1.size}, ${dLossdZ1(0).size}) == (${up2DateParametersAndStaleness.b1.size}, ${up2DateParametersAndStaleness.b1(0).size})")
      val dLossdW1: M = Matrices(x.transpose).product(dLossdZ1)
      // log.info(s"dLossdW1 ${dLossdW1}")
      // log.info(s"[worker]: dw1 -> (${up2DateParametersAndStaleness.w1.size}, ${up2DateParametersAndStaleness.w1(0).size}) == (${dLossdW1.size}, ${dLossdW1(0).size})")

      def testShapes(jacobian: M, matrix: M, what: String): Boolean = {
        val test = jacobian.size == matrix.size && jacobian(0).size == matrix(0).size
        if (!test) log.info(s"$what -> (${jacobian.size}, ${jacobian(0).size}), (${matrix.size}, ${matrix(0).size})")
        jacobian.size == matrix.size && jacobian(0).size == matrix(0).size
      }

      assert(testShapes(dLossdW1, up2DateParametersAndStaleness.w1, "W1"))
      assert(testShapes(dLossdZ1, up2DateParametersAndStaleness.b1, "B1"))
      assert(testShapes(dLossdW2, up2DateParametersAndStaleness.w2, "W2"))
      assert(testShapes(dLossdZ2, up2DateParametersAndStaleness.b2, "B2"))

//      log.info(s"back ${dLossdW1.flatten.sum}")
//      log.info("\n")

      chaineuralMaster ! Ready(self)
      Thread.sleep(200)

      stalenessWorker ! BackpropagatedParameters(dLossdW1, dLossdZ1, dLossdW2, dLossdZ2, up2DateParametersAndStaleness.staleness)
  }

  def normalize(m: M): Matrices = {
    val mean: Float = m.flatten.sum.toFloat / m.size.toFloat
    val std: Float = math.sqrt(m.map(_.map(x => math.pow(x - mean, 2.toFloat)).sum).sum / m.size.toFloat).toFloat
    Matrices(m.map(_.map(x => (x - mean) / std)))
  }
}
