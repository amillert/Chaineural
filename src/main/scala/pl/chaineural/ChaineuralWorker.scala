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
   *  ⚪   θ -= η * ∇θ / τ
   *
   * Glossary:
   *  ⚪  η             - learning rate
   *  ⚪  θ             - generalized parameter
   *  ⚪  ∇θ            - (∂Loss / ∂θ) local (?) gradient of the parameter
   *  ⚪  μ             - total amount of mini-batches
   *  ⚪  τ             - staleness of parameters in current run
   *
   * Forward pass:
   *  ⚪  Z1            = X @ W1 + B1
   *  ⚪  A1            = tanh(Z1)
   *  ⚪  Z2            = A1 @ W2 + B2
   *  ⚪  Loss          = 1 / μ * ∑ (Z2 - Y) ** 2
   *
   *  ⚪  Loss          = 1 / μ * ∑ (tang(X @ W1 + B1) @ W2 + B2 - Y) ** 2
   *
   * Backward pass based on abstract computational graph:
   *  ⚪  ∂Loss / ∂Loss = 1.0
   *  ⚪  ∂Loss / ∂Z2   = 2 / μ * ∑ (Z2 - Y)
   *  ⚪  ∂Loss / ∂A1   = ∂Loss / ∂Z2 * A1
   *  ⚪  ∂Loss / ∂W2   =
   *  ⚪  ∂Loss / ∂B2   =
   *  ⚪  ∂Loss / ∂Z1   =
   *  ⚪  ∂Loss / ∂W1   =
   *  ⚪  ∂Loss / ∂B1   =
   */

  /**
   * Loss(mini batch) = 1/mini batches * sum{i=1}^{l} (yhat{i} - y{i})^{2}
   */

  override def receive: Receive = initializeWeights

  def initializeWeights: Receive = {
    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      processWork(up2DateParametersAndStaleness)
  }

  def processWork(up2DateParametersAndStaleness: Up2DateParametersAndStaleness): Receive = {
    case Up2DateParametersAndStaleness =>
      processWork(up2DateParametersAndStaleness)

    case ForwardPass(X: M, Y: V) =>
      log.info(s"Gotten work of size ${X.size}")
      log.info(s"input shape: ${X.size}, ${X.head.size}")

      val θZ1: Matrices = Matrices(Matrices(Matrices(X) ⓧ up2DateParametersAndStaleness.θW1) + up2DateParametersAndStaleness.θB1)
      // val θA1: M = tanh(θZ1)
      val θA1: Matrices = θZ1
      val θZ2: Vectors = Vectors(Matrices(Matrices(θA1 ⓧ up2DateParametersAndStaleness.θW2) + up2DateParametersAndStaleness.θB2) squeeze)
      val Loss: Float = 1.0f / amountOfWorkers.toFloat * math.pow(Vectors(θZ2 - Y).sumValues, 2.0f).toFloat

      self ! BackwardPass(θZ1, θA1, θZ2, Loss)

    case BackwardPass(θZ1: Matrices, θA1: Matrices, θZ2: Vectors, Loss: Float) =>
      val dθLoss: Float = 1.0f
      val JacobianθZ2: M = Vector(Vector())
      val JacobianθB2: M = Vector(Vector())
      val JacobianθA1: M = Vector(Vector())
      val JacobianθW2: M = Vector(Vector())
      val JacobianθZ1: M = Vector(Vector())
      val JacobianθW1: M = Vector(Vector())
      val JacobianθB1: M = Vector(Vector())

      stalenessWorker ! BackPropagatedParameters(JacobianθW1, JacobianθB1, JacobianθW2, JacobianθB2)

    case _ =>
  }
}
