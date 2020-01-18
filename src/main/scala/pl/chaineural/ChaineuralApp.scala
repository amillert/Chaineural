package pl.chaineural

import akka.actor.{ActorRef, ActorSystem, Props}
import com.typesafe.config.{Config, ConfigFactory}

import scala.language.postfixOps


object ChaineuralApp extends App {

  import pl.chaineural.actors.{ChaineuralMaster, ChaineuralStalenessWorker, ChaineuralWorker}
  import pl.chaineural.messagesDomains.InformationExchangeDomain._

  import pl.chaineural.restAPI.ChaineuralHTTPServer

  val chaineuralHTTPServer: ChaineuralHTTPServer.type = ChaineuralHTTPServer
  Thread.sleep(5000)
  val hyperparameters: Hyperparameters = ChaineuralHTTPServer.getHyperparameters

  def createNode(actorName: String, role: String, port: Int, props: Props): ActorRef = {
    val config: Config = ConfigFactory.parseString(
      s"""
         |akka.cluster.roles = ["$role"]
         |akka.remote.artery.canonical.port = $port
         |""".stripMargin)
      .withFallback(ConfigFactory load "cluster.conf")

    val system: ActorSystem = ActorSystem("ChaineuralMasterSystem", config)
    val actor: ActorRef = system.actorOf(props, actorName)
    println(s"Created: $actor, ${actor.path}")
    actor
  }

  val chaineuralStalenessWorker: ActorRef = createNode(
    "chaineuralStalenessWorker",
    "stalenessWorker",
    2550,
    ChaineuralStalenessWorker.props(
      hyperparameters.amountOfWorkers,
      hyperparameters.synchronizationHyperparameter,
      hyperparameters.eta
    )
  )

  // Thread.sleep(2000)

  val chaineuralMaster: ActorRef =
    createNode(
      "chaineuralMaster",
      "master",
      2551,
      ChaineuralMaster.props(
        chaineuralStalenessWorker,
        hyperparameters.outputSize
      )
    )

  chaineuralStalenessWorker ! chaineuralMaster
  chaineuralStalenessWorker ! ProvideTrainingDetails(hyperparameters.sizeOfMiniBatches, hyperparameters.featuresSize, hyperparameters.hiddenSize, hyperparameters.outputSize)

  (1 to hyperparameters.amountOfWorkers).foreach { nWorker =>
    createNode("chaineuralMainWorker", "mainWorker", 2551 + nWorker, ChaineuralWorker.props(chaineuralStalenessWorker))
  }

  // Thread.sleep(10000)

  chaineuralMaster ! DistributeMiniBatches("src/main/resources/data/pulsar_stars.csv", hyperparameters.sizeOfMiniBatches)
}
