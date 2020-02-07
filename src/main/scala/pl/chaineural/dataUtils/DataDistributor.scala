package pl.chaineural.dataUtils

import pl.chaineural.dataStructures._

trait DataDistributor {
  implicit val readFile: () => M = read _
  implicit def read(): M
  def splitIntoMiniBatches(implicit readData: () => M): (B, Double, Double)
  def apply(): (B, Double, Double)
}
