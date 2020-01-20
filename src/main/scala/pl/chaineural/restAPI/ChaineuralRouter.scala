package pl.chaineural.restAPI

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import spray.json.DefaultJsonProtocol

import pl.chaineural.messagesDomains.InformationExchangeDomain.Hyperparameters


trait JsonSupport extends SprayJsonSupport with DefaultJsonProtocol {

  import spray.json._

  implicit val printer: PrettyPrinter.type = PrettyPrinter
  implicit val hyperParameterFormat: RootJsonFormat[Hyperparameters] = jsonFormat7(Hyperparameters)
}

object ChaineuralRouter extends JsonSupport {

  import pl.chaineural.Chaineural

  var chaineural: Chaineural = _

  def route: Route =
    miniBatches ~ hyper

  def miniBatches: Route =
    path("amountOfMiniBatches" / IntNumber) { miniBatchSize =>
      get {
        println(s"Gotten mini batch size: $miniBatchSize\n")
        chaineural = Chaineural(miniBatchSize)
        complete(s"${chaineural.retrieveAmountOfMiniBatches}")
      }
    }

  def hyper: Route =
    path("hyper") {
      (post & entity(as[Hyperparameters])) { hyperparameters =>
        println(s"Gotten hyperparameters: $hyperparameters\n")
        chaineural.spinUpCluster(hyperparameters)
        complete(StatusCodes.Created, s"Cluster initialization proceeded")
      }
    }
}
