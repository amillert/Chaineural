package pl.chaineural.restAPI

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{as, complete, entity, path, post}
import akka.http.scaladsl.server.Route
import spray.json.DefaultJsonProtocol

import pl.chaineural.messagesDomains.InformationExchangeDomain.Hyperparameters

trait JsonSupport extends SprayJsonSupport with DefaultJsonProtocol {

  import spray.json._

  implicit val printer: PrettyPrinter.type = PrettyPrinter
  implicit val hyperParameterFormat: RootJsonFormat[Hyperparameters] = jsonFormat7(Hyperparameters)
}

class ChaineuralRouter extends JsonSupport {

  import pl.chaineural.Chaineural

  def route(): Route = {
    path("init") {
      (post & entity(as[Hyperparameters])) { hyperparameters =>
        println(s"Creating hyperparameters = $hyperparameters")
        Chaineural.spinUpCluster(hyperparameters)
        complete(StatusCodes.Created, s"Created hyperparameters: $hyperparameters, creating cluster")
      }
    }
  }
}
