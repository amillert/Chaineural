package pl.chaineural.restAPI

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer
import spray.json.DefaultJsonProtocol

import scala.concurrent.{ExecutionContextExecutor, Future}
import scala.language.postfixOps
import scala.util.{Failure, Success}

import pl.chaineural.messagesDomains.InformationExchangeDomain.Hyperparameters


trait JsonSupport extends SprayJsonSupport with DefaultJsonProtocol {

  import spray.json._

  implicit val printer: PrettyPrinter.type = PrettyPrinter
  implicit val hyperParameterFormat: RootJsonFormat[Hyperparameters] = jsonFormat7(Hyperparameters)
}

object ChaineuralHTTPServer {
  class HyperRoutes extends JsonSupport {
    def route(): Route = {
      path("init") {
        post {
          entity(as[Hyperparameters]) { hyperparamters =>
            println(s"Creating hyperparameters = $hyperparamters")
            setHyperparameters(hyperparamters)
            complete(StatusCodes.Created, s"Created hyperparameters: $hyperparameters, creating cluster")
          }
        }
      }
    }
  }

  implicit val httpSystem: ActorSystem = ActorSystem("rest-api")
  implicit val materializer: ActorMaterializer = ActorMaterializer()
  implicit val ec: ExecutionContextExecutor = httpSystem.dispatcher

  var hyperparameters: Hyperparameters = _
  val host = "localhost"
  val port = 8080
  val hyperRoutes: Route = new HyperRoutes().route()
  val routes: Route =  hyperRoutes

  val httpServerFuture: Future[Http.ServerBinding] = Http().bindAndHandle(routes, host, port)
  httpServerFuture onComplete {
    case Success(binding) =>
      println(s"Akka Http Server is UP and is bound to ${binding.localAddress}")
      println("Please kindly provide hyperparameters now!")

    case Failure(e) =>
      println(s"Akka Http server failed to start", e)
      httpSystem.terminate()
  }

  def getHyperparameters: Hyperparameters =
    this.hyperparameters

  def setHyperparameters(hyper: Hyperparameters): Unit =
    this.hyperparameters = hyper
}
