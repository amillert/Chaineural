package pl.chaineural.dataUtils

import pl.chaineural.dataStructures._

import scala.io.BufferedSource


object CustomCharacterDataSeparatedDistributor {
  def apply(path: String, separator: Char, workerNodesUpCount: Int): B =
    new CustomCharacterDataSeparatedDistributor(path, separator, workerNodesUpCount)()
}

class CustomCharacterDataSeparatedDistributor(path: String, separator: Char, workerNodesUpCount: Int)
  extends DataDistributor {
//  override implicit val readFile: () => M = read _

  override def read(): M = {
    val buffer: BufferedSource = scala.io.Source.fromFile(path)
    buffer.getLines.map(_.split(",").toVector.map(_.toFloat)).toVector
  }

  override def splitIntoBatches(implicit readData: () => M): B = {
    val data = readData()
    data.zipWithIndex.groupBy(_._2 % workerNodesUpCount).values.map(_.map(_._1)).toVector
  }

  override def apply(): B = splitIntoBatches
}