package pl.chaineural

import akka.actor.{ActorRef, ActorSystem, Props}

import com.typesafe.config.{Config, ConfigFactory}
import pl.chaineural.dataStructures.B
import pl.chaineural.dataUtils.CustomCharacterDataSeparatedDistributor

import scala.language.postfixOps

object Chaineural {
  def apply(miniBatchSize: Int): Chaineural = {
    new Chaineural(miniBatchSize)
  }
}

class Chaineural(miniBatchSize: Int) {

  import pl.chaineural.actors.{ChaineuralMaster, ChaineuralStalenessWorker, ChaineuralWorker}
  import pl.chaineural.messagesDomains.InformationExchangeDomain._

  val (miniBatches: B, min: Double, max: Double) = CustomCharacterDataSeparatedDistributor("src/main/resources/data/pulsar_stars.csv", ',', miniBatchSize)
  // val (miniBatches: B, min: Double, max: Double) = CustomCharacterDataSeparatedDistributor("src/main/resources/data/xd.csv", ',', miniBatchSize)

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

  def spinUpCluster(hyperparameters: Hyperparameters): Unit = {
    val chaineuralStalenessWorker: ActorRef = createNode(
      "chaineuralStalenessWorker",
      "stalenessWorker",
      2550,
      ChaineuralStalenessWorker.props(
        hyperparameters.amountOfWorkers,
        hyperparameters.synchronizationHyperparameter,
        hyperparameters.eta,
        min,
        max
      )
    )

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
    chaineuralStalenessWorker ! ProvideTrainingDetails(miniBatchSize, hyperparameters.featuresSize, hyperparameters.hiddenSize, hyperparameters.outputSize)

    (1 to hyperparameters.amountOfWorkers).foreach { nWorker =>
      createNode(
        "chaineuralMainWorker",
        "mainWorker",
        2551 + nWorker,
        ChaineuralWorker.props(chaineuralStalenessWorker, 9000 + nWorker, min, max)
      )
    }

    Thread.sleep(10000)

    chaineuralMaster ! DistributeMiniBatches(miniBatches, hyperparameters.epochs)
  }

  def retrieveAmountOfMiniBatches: Int =
    miniBatches.size
}
