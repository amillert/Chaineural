package pl.chaineural.actors

import com.typesafe.config.ConfigFactory
import akka.actor.{ActorRef, ActorSystem, Props}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.{HttpMethods, HttpRequest}

import scala.concurrent.ExecutionContextExecutor
import scala.util.Success

import pl.chaineural.dataStructures.{M, Matrices}

object ChaineuralWorker {
  def props(stalenessWorker: ActorRef, organizationPort: Int, min: Double, max: Double): Props =
    Props(new ChaineuralWorker(stalenessWorker, organizationPort, min, max))
}

class ChaineuralWorker(stalenessWorker: ActorRef, organizationPort: Int, min: Double, max: Double) extends Actress {

  import pl.chaineural.messagesDomains.InformationExchangeDomain._
  import pl.chaineural.messagesDomains.LearningDomain._
  import pl.chaineural.messagesDomains.ParametersExchangeDomain._

  private final val address: String = ConfigFactory load "cluster.conf" getString "API-gateway-address"
  implicit val httpSystem: ActorSystem = ActorSystem("rest-api")
  implicit val ec: ExecutionContextExecutor = httpSystem.dispatcher

  override def receive: Receive = initializeWeights

  def initializeWeights: Receive = {
    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      log.info(s"Gotten new params: ${up2DateParametersAndStaleness.staleness}")
      context become processWork(up2DateParametersAndStaleness)
  }

  def processWork(up2DateParametersAndStaleness: Up2DateParametersAndStaleness): Receive = {
    case up2DateParametersAndStaleness: Up2DateParametersAndStaleness =>
      context become processWork(up2DateParametersAndStaleness)

    case ForwardPass(x: M, y: M, epoch: Int, miniBatch: Int) =>

      val startTime: Long = System.nanoTime

      val response: Unit = Http
        .get(httpSystem)
        .singleRequest(
          HttpRequest(
            method = HttpMethods.POST,
            uri = s"http://$address:$organizationPort/api/init-minibatch/epoch$epoch/$miniBatch/${self.hashCode()}"
          )
        )
        .onComplete {
          case Success(x) => x
          case _ =>
        }

      val z1: Matrices = Matrices(Matrices(Matrices(x) ⓧ up2DateParametersAndStaleness.w1) + up2DateParametersAndStaleness.b1)
      val a1: Matrices = Matrices(!z1)
      val z2: Matrices = Matrices(Matrices(a1 ⓧ up2DateParametersAndStaleness.w2) + up2DateParametersAndStaleness.b2)
      // val Loss: Double = 1.0 / y.size * math.pow(normalize((Matrices(y) - normalize(z2.matrix()))).matrix().map(_.sum).sum, 2.0)
      val Loss: Double = crossEntropyLoss(y, normalize(z2.matrix()).matrix())

      println(s"$organizationPort $miniBatch $epoch ${up2DateParametersAndStaleness.staleness}")
      // println(s"Loss for the current epoch: $epoch, miniBatch: $miniBatch is: $Loss, staleness: ${up2DateParametersAndStaleness.staleness}")

      self ! BackwardPass(x, y, z1, a1, z2, Loss, epoch, miniBatch, startTime, sender)

    case BackwardPass(
      x: M,
      y: M,
      z1: Matrices,
      a1: Matrices,
      z2: Matrices,
      loss: Double,
      epoch: Int,
      miniBatch: Int,
      startTime: Long,
      chaineuralMaster: ActorRef) =>

      // val dLossdZ2: M = crossEntropyLossGradient(z2.matrix(), y)
      val dLossdZ2: M = Matrices(Matrices(y) - z2) * (-2.0 / y.size)
      val dLossdW2: M = Matrices(a1.transpose).product(dLossdZ2)
      val dLossdA1: M = Matrices(dLossdZ2).product(Matrices(up2DateParametersAndStaleness.w2).transpose)
      val dLossdZ1: M = Matrices(dLossdA1).elementWiseMultiplication(Matrices((1 to z1.matrix().size).map(i => (1 to z1.matrix()(0).size).map(_ => 1.0).toVector).toVector) - Matrices(!z1).elementWisePow(2))
      val dLossdW1: M = Matrices(x.transpose).product(dLossdZ1)

      assert(testShapes(dLossdW1, up2DateParametersAndStaleness.w1, "W1"))
      assert(testShapes(dLossdZ1, up2DateParametersAndStaleness.b1, "B1"))
      assert(testShapes(dLossdW2, up2DateParametersAndStaleness.w2, "W2"))
      assert(testShapes(dLossdZ2, up2DateParametersAndStaleness.b2, "B2"))

      val endTime: Double = (System.nanoTime - startTime) / 1e9

      chaineuralMaster ! Ready(self)
      stalenessWorker ! BackpropagatedParameters(
        dLossdW1,
        dLossdZ1,
        dLossdW2,
        dLossdZ2,
        up2DateParametersAndStaleness.staleness
      )


      val response: Unit = Http
        .get(httpSystem)
        .singleRequest(
          HttpRequest(
            method = HttpMethods.POST,
            uri = s"http://$address:$organizationPort/api/finish-minibatch/epoch$epoch/$miniBatch/$endTime/$loss"
          )
        )
        .onComplete {
          case Success(x) => x
          case _ =>
        }

      // println(s"$miniBatch, $epoch, $organizationPort, $endTime")
  }

  def normalize(m: M): Matrices =
    Matrices(m.map(_.map { x =>
      0.00001 + (0.99999 - 0.00001) * ((x - min) / (max - min))
    }))

  def crossEntropyLoss(y: M, yPred: M): Double =
    y.zip(yPred).map {
      case (yVec, yPredVec) =>
        yVec.zip(yPredVec).map {
          case (yi, yPredI) =>
            // check if still needed
            if (yPredI <= 0.0 || 1.0 - yPredI <= 0.0 || yPredI.isNaN || yi.isNaN) {
              0.0
            }
            else {
              -(yi * math.log(yPredI) + (1.0 - yi) * math.log(1.0 - yPredI))
            }
        }.sum
    }.sum

  // def crossEntropyLossGradient(z2: M): M =
  //   z2.map(_.map(z2i => -1.0f / (z2i * z2i + z2i)))

  def crossEntropyLossGradient(z2: M, y: M): M =
    z2.zip(y).map { case (z2i, yi) =>
      z2i.zip(yi).map { case (z2ii, yii) =>
        - (yii - z2ii) / (z2ii * (-z2ii + 1))
      }
    }
    // z2.map(_.map(z2i => -1.0f / (z2i * z2i + z2i)))

  def testShapes(jacobian: M, matrix: M, what: String): Boolean = {
    val test = jacobian.size == matrix.size && jacobian(0).size == matrix(0).size
    if (!test) log.info(s"$what -> (" +
      s"${jacobian.size}, ${jacobian(0).size}), (${matrix.size}, ${matrix(0).size})")
    jacobian.size == matrix.size && jacobian(0).size == matrix(0).size
  }
}
