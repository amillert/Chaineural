package pl.chaineural.dataStructures

import scala.annotation.tailrec


object Matrices {
  def apply(matrix: M): Matrices = new Matrices(matrix)
}

class Matrices(matrix: M) {
  def sum(m: M): M = {
    matrix.zip(m).map { case (vi, vj) =>
      Vectors(vi) + vj
    }
  }

  def +(m: M): M =
    sum(m)

  def merge(m: M, v: V): M =
    m.zip(v).map { case (mi, vi) =>
      mi ++ Vector(vi)
    }

  def mergeVector(v: V): M =
    merge(matrix, v)

  def mergeVector(m: M, v: V): M =
    merge(m, v)

  def transpose: M = {
    @tailrec
    def transpose(m: M, acc: M): M = {
      if (m.isEmpty) acc
      else if (acc.isEmpty)
        transpose(m.tail, Vectors(m.head).transpose)
      else
        transpose(m.tail, mergeVector(acc, m.head))
    }

    transpose(matrix, Vector())
  }

  def vectorMatrixProduct(v: V, m: M): V = {
    @tailrec
    def vectorMatrixProduct(v: V, m: M, acc: V): V = {
      if (m.isEmpty) acc
      else {
        vectorMatrixProduct(v, m.tail, acc :+ Vectors(v).product(m.head))
      }
    }

    vectorMatrixProduct(v, Matrices(m).transpose, Vector())
  }

  def product(mi: M, mj: M): M = {
    @tailrec
    def product(mi: M, mj: M, acc: M): M = {
      if (mi.isEmpty) acc
      else
        product(mi.tail, mj, acc :+ vectorMatrixProduct(mi.head, mj))
    }
    product(mi, mj, Vector())
  }

  def product(m: M): M = {
    @tailrec
    def product(mi: M, mj: M, acc: M): M = {
      if (mi.isEmpty) acc
      else
        product(mi.tail, mj, acc :+ vectorMatrixProduct(mi.head, mj))
    }
    product(matrix, m, Vector())
  }
}
