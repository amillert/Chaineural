package pl.chaineural


class ChaineuralWorker extends Actress {

  import pl.chaineural.ChaineuralDomain._

  override def receive: Receive = {
    case ProcessWork(dataBatch: Seq[Seq[Double]]) =>
      log.info(s"Gotten work of size ${dataBatch.size}")
    case _ =>
  }
}