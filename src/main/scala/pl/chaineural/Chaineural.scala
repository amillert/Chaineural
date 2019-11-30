package pl.chaineural

import akka.actor.{ActorRef, ActorSelection, ActorSystem, Address, Props}
import akka.pattern.pipe
import akka.cluster.Cluster
import akka.cluster.ClusterEvent.{InitialStateAsEvents, MemberEvent, MemberRemoved, MemberUp, UnreachableMember}
import akka.dispatch.{PriorityGenerator, UnboundedPriorityMailbox}
import akka.util.Timeout
import com.typesafe.config.{Config, ConfigFactory}

import scala.concurrent.duration._
import scala.language.postfixOps


object ChaineuralDomain {
  final case class InitializeWorkerNodes(workerNodesCount: Int)
  final case class ProcessExemplarJob(work: Seq[Int], workAggregatorActorRef: ActorRef)
  final case class ResultExemplarJob(work: Seq[Int])
}

class ChaineuralPriorityMailbox(settings: ActorSystem.Settings, config: Config)
  extends UnboundedPriorityMailbox(
    PriorityGenerator {
      case _: MemberEvent => 0
      case _ => 1
    }
  )

object ChaineuralMaster {
  def props: Props =
    Props(new ChaineuralMaster)
}

class ChaineuralMaster extends Actress {

  import context.dispatcher
  implicit val timeout: Timeout = Timeout(3 seconds)

  private val chaineuralCluster: Cluster = Cluster(context.system)
  private var workerNodesUp: Map[Address, ActorRef] = Map()
  private var workerNodesPendingRemoval: Map[Address, ActorRef] = Map()

  override def preStart(): Unit = {
    chaineuralCluster.subscribe(
      self,
      initialStateMode = InitialStateAsEvents,
      classOf[MemberEvent],
      classOf[UnreachableMember]
    )
  }

  override def postStop(): Unit =
    chaineuralCluster.unsubscribe(self)

  override def receive: Receive = handleClusterEvents

  def handleClusterEvents: Receive = {
    case MemberUp(member) =>
      log.info(s"A member with an address: ${member.address} is up")
      if (workerNodesPendingRemoval.contains(member.address)) {
        workerNodesPendingRemoval - member.address
      } else {
        val workerSelection: ActorSelection = context.actorSelection(s"${member.address}")
        workerSelection.resolveOne().map(ref => (member.address, ref)).pipeTo(self)
      }

    case MemberRemoved(member, prevStatus) =>
      log.info(s"A member with an address: ${member.address} has been removed from $prevStatus")
      workerNodesUp = workerNodesUp - member.address

    case UnreachableMember(member) =>
      log.info(s"A member with an address: ${member.address} is unreachable")
      val workerOption: Option[ActorRef] = workerNodesUp get member.address
      workerOption.foreach { workerNodeRef =>
        workerNodesPendingRemoval = workerNodesPendingRemoval + (member.address -> workerNodeRef)
      }

    case m: MemberEvent =>
      log.info(s"Another member event has occurred: $m")
  }
}

class ChaineuralMasterApp(actorName: String, port: Int, workerNodesCount: Int) extends App {

  def createNode(actorName: String, role: String, props: Props): ActorRef = {
    val config: Config = ConfigFactory.parseString(
      s"""
         |akka.cluster.roles = ["$role"]
         |akka.remote.artery.canonical.port = $port
         |""".stripMargin)
      .withFallback(ConfigFactory load "cluster.conf")

    val system: ActorSystem = ActorSystem("ChaineuralMasterSystem", config)
    system.actorOf(props, actorName)
  }

  val chaineuralMasterActor: ActorRef =
    createNode("chaineuralMaster", "master", Props[ChaineuralMaster])
}

object objectUno extends ChaineuralMasterApp("uno", 2551, 8)
object objectDos extends ChaineuralMasterApp("dos", 2552, 14)
object objectTres extends ChaineuralMasterApp("tres", 2553, 5)
