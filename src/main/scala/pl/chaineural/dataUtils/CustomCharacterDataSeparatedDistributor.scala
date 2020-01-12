package pl.chaineural.dataUtils

import pl.chaineural.dataStructures._

import scala.io.BufferedSource


object CustomCharacterDataSeparatedDistributor {
  def apply(path: String, separator: Char, sizeOfDataBatches: Int): B =
    new CustomCharacterDataSeparatedDistributor(path, separator, sizeOfDataBatches)()
}

class CustomCharacterDataSeparatedDistributor(path: String, separator: Char, sizeOfDataBatches: Int)
  extends DataDistributor {

  override def read(): M = {
    val buffer: BufferedSource = scala.io.Source.fromFile(path)
    buffer.getLines.map(_.split(",").toVector.map(_.toFloat)).toVector
  }

  private def normalize(data: M): M = {
    val mean: Float = data.flatten.sum.toFloat / data.size.toFloat
    val std: Float = math.sqrt(data.map(_.map(x => math.pow(x - mean, 2.toFloat)).sum).sum / data.size.toFloat).toFloat
    data.map(_.map(x => (x - mean) / std))
  }

  override def splitIntoBatches(implicit readData: () => M): B = {
    val data = normalize(readData())
    // data.zipWithIndex.groupBy(_._2 % sizeOfDataBatches).values.map(_.map(_._1)).toVector
    data.sliding(sizeOfDataBatches, sizeOfDataBatches).toVector
  }

  override def apply(): B = splitIntoBatches
}