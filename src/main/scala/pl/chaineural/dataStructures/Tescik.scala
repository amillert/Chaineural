package pl.chaineural.dataStructures

import scala.annotation.tailrec


//object Tescik {
//  import pl.chaineural.dataStructures.Matrices
//  val m = Matrice
//}

object Xd extends App {
  def merge(m: M, v: V): M = {
    m.zip(v).map { case (mi, vi) =>
      mi ++ Vector(vi)
    }
  }

  // def vecMerge(vi: Vector[Float], vj: Vector[Float]): Vector[Vector[Float]] = {
  //   merge(vecTrans(vi), vj)
  // }

  def vecMerge(vi: Vector[Vector[Float]], vj: Vector[Float]): Vector[Vector[Float]] = {
    merge(vi, vj)
  }

  def vecTrans(v: Vector[Float]): Vector[Vector[Float]] =
    v.map(vi => Vector(vi))

  def reverseRows(m: Vector[Vector[Float]]): Vector[Vector[Float]] = {
    @scala.annotation.tailrec
    def reverseRowTailRec(m: Vector[Vector[Float]], acc: Vector[Vector[Float]]): Vector[Vector[Float]] = {
      if (m.isEmpty) acc
      else reverseRowTailRec(m.tail, acc :+ m.head.reverse)
    }

    reverseRowTailRec(m, Vector())
  } // m.map(mi => mi.reverse)

  def tranzol(m: M): M = {
    @tailrec
    def tranzolTR(m: M, acc: M): M = {
      if (m.isEmpty) acc
      else if (acc.isEmpty)
        tranzolTR(m.tail, vecTrans(m.head))
      else
        tranzolTR(m.tail, vecMerge(acc, m.head))
    }

    tranzolTR(m, Vector())
  }

  def vecProduct(vi: V, vj: V): Float = {
    vi.zip(vj).foldLeft(0.0f) { case (acc, (vii, vjj)) =>
      acc + (vii * vjj)
    }
  }

  def rowColumnsProduct(row: V, m: M): V = {
    @tailrec
    def rowCol(row: V, m: M, acc: V): V = {
      if (m.isEmpty) acc
      else {
        rowCol(row, m.tail, acc :+ vecProduct(row, m.head))
      }
    }
    rowCol(row, tranzol(m), Vector())
  }

  def matrixProduct(mi: M, mj: M): M = {
    @tailrec
    def matProdTR(mi: M, mj: M, acc: M): M= {
      if (mi.isEmpty) acc
      else {
        println()
        println(acc)
        println()
        matProdTR(mi.tail, mj, acc :+ rowColumnsProduct(mi.head, mj))
      }
    }
    matProdTR(mi, mj, Vector())
  }

  //  val v: Vector[Float] = Vector(1,2,3)
  //  val vt: Vector[Vector[Float]] = vecTrans(v)
  //  println(vt)

  val m: Vector[Vector[Float]] = Vector(Vector(1, 2, 3), Vector(4, 5, 6), Vector(7, 8, 9))

  // val mt: Vector[Vector[Vector[Float]]] = matTrans(m)
  val mt: Vector[Vector[Float]] = tranzol(m)
//  println(mt)
  // // (m(0), m(1), m(2)).zipped.toList


  /**
   * 1 2 3
   * 4 5 6
   * 7 8 9
   *
   * 1 4 7
   * 2 5 8
   * 3 6 9
   */

//  val mi: M = Vector(Vector(1,2,3), Vector(4,5,6))
//  val mj: M = Vector(Vector(7,8), Vector(9,10), Vector(11,12))
//  println(mi)
//  println(mj)
//
//  println()
//  println(mi(0))
//  println(mj)
//  println(rowColumnsProduct(mi(0), mj))

//  println(matrixProduct(mi, mj))

  val mi: Matrices = Matrices(Vector(Vector(1,2,3), Vector(4,5,6)))
  val mj: M = Vector(Vector(7,8), Vector(9,10), Vector(11,12))

  println(mi.product(mj))
}