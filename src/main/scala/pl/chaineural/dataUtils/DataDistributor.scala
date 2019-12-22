package pl.chaineural.dataUtils


trait DataDistributor {
  implicit val readFile: () => Seq[Seq[Double]] = read _
  implicit def read(): Seq[Seq[Double]]
  def splitIntoBatches(implicit readData: () => Seq[Seq[Double]]): Seq[Seq[Seq[Double]]]
  def apply(): Seq[Seq[Seq[Double]]]
}
