package pl.chaineural.dataUtils

import scala.io.BufferedSource


object CustomCharacterDataSeparatedDistributor {
  def apply(path: String, separator: Char, workerNodesUpCount: Int): Seq[Seq[Seq[Double]]] =
    new CustomCharacterDataSeparatedDistributor(path, separator, workerNodesUpCount)()
}

class CustomCharacterDataSeparatedDistributor(path: String, separator: Char, workerNodesUpCount: Int)
  extends DataDistributor {
//  override implicit val readFile: () => Seq[Seq[Double]] = read _

  override def read(): Seq[Seq[Double]] = {
    val buffer: BufferedSource = scala.io.Source.fromFile(path)
    buffer.getLines.map(_.split(",").toSeq.map(_.toDouble)).toSeq
  }

  override def splitIntoBatches(implicit readData: () => Seq[Seq[Double]]): Seq[Seq[Seq[Double]]] = {
    val data = readData()
    data.zipWithIndex.groupBy(_._2 % workerNodesUpCount).values.map(_.map(_._1)).toSeq
  }

  override def apply(): Seq[Seq[Seq[Double]]] = splitIntoBatches
}