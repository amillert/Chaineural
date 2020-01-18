package pl.chaineural.dataStructures


object Vectors {
  def apply(vector: V): Vectors = new Vectors(vector)
}

class Vectors(vector: V) {
  def sum(v: V): V =
    vector.zip(v).map { case (vi, vj) => vi + vj }

  def +(v: V): V =
    sum(v)

  def sumValues: Double =
    vector.sum

  def sumValues(v: V): Double =
    v.sum

  def ∑(v: V): Double =
    sumValues(v)

  def subtract(v: V): V =
    vector.zip(v).map { case (vi, vj) => vi - vj }

  def -(v: V): V =
    subtract(v)

  def product(v: V): Double =
    vector.zip(v).foldLeft(0.0) { case (acc, (vi, vj)) =>
      acc + (vi * vj)
    }

  def *(v: V): Double =
    product(v)

  def elementWiseMultiplication(d: Double): V =
    vector.map(_ * d)

  def *(d: Double): V =
    elementWiseMultiplication(d)

  def transpose: M =
    transpose(vector)

  def transpose(v: V): M =
    v.map(vi => Vector(vi))

  def merge(v: V): M =
    vector.zip(v).map { case (vi, vj) =>
      Vector(vi, vj)
    }

  def ++(v: V): M =
    merge(v)
}
