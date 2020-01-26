package pl.chaineural.dataUtils

import pl.chaineural.dataStructures._

import scala.io.BufferedSource

object CustomCharacterDataSeparatedDistributor {
  def apply(path: String, separator: Char, sizeOfDataBatches: Int): (B, Double, Double) =
    new CustomCharacterDataSeparatedDistributor(path, separator, sizeOfDataBatches)()
}

class CustomCharacterDataSeparatedDistributor(path: String, separator: Char, sizeOfDataBatches: Int)
  extends DataDistributor {

  override def read(): M = {
    val buffer: BufferedSource = scala.io.Source.fromFile(path)
    buffer.getLines.map(_.split(separator).toVector.map(_.toDouble)).toVector
  }

  def normalizeCustom(data: M): (M, Double, Double) = {
    val max: Double = data.flatten.max
    val min: Double = data.flatten.min
    (data.map(_.zipWithIndex.map { case (x, index) =>
      if (index == data.head.size - 1) x
      else
        0.00001 + (0.99999 - 0.00001) * ((x - min) / (max - min))
    }), min, max)
  }

  def normalize(data: M): M = {
    val max: Double = data.flatten.max
    val min: Double = data.flatten.min
    data.map(_.zipWithIndex.map { case (x, index) =>
      if (index == data.head.size - 1) x
      else {  // think about if needed
        if (max == min || x == min && min > 0.0) min
        else if (max == min || x == min && min == 0.0) min + 0.00001
        else (x - min) / (max - min)
      }
    })
  }

  override def splitIntoBatches(implicit readData: () => M): (B, Double, Double) = {
    val (data, min, max) = normalizeCustom(readData())
    (data.sliding(sizeOfDataBatches, sizeOfDataBatches).toVector, min, max)
  }

  override def apply(): (B, Double, Double) = splitIntoBatches
}