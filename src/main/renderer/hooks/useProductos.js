import { useState, useEffect, useCallback } from 'react'
import { productosService } from '../services/productos.service'

export function useProductos() {
  const [productos,       setProductos]       = useState([])
  const [stockBajo,       setStockBajo]       = useState([])
  const [proximosVencer,  setProximosVencer]  = useState([])
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)

  // ── Cargar todos ────────────────────────────────────
  const fetchProductos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productosService.getAll()
      setProductos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Cargar alertas ──────────────────────────────────
  const fetchAlertas = useCallback(async () => {
    try {
      const [bajo, vencer] = await Promise.all([
        productosService.getStockBajo(),
        productosService.getProximosVencer(30),
      ])
      setStockBajo(bajo)
      setProximosVencer(vencer)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  // ── Crear ───────────────────────────────────────────
  const crearProducto = useCallback(async (data) => {
    try {
      const nuevo = await productosService.create(data)
      setProductos(prev => [...prev, nuevo])
      return { ok: true, data: nuevo }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  // ── Actualizar ──────────────────────────────────────
  const actualizarProducto = useCallback(async (data) => {
    try {
      const actualizado = await productosService.update(data)
      setProductos(prev =>
        prev.map(p => p.id === actualizado.id ? actualizado : p)
      )
      return { ok: true, data: actualizado }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  // ── Eliminar (lógico) ───────────────────────────────
  const eliminarProducto = useCallback(async (id) => {
    try {
      await productosService.delete(id)
      setProductos(prev =>
        prev.map(p => p.id === id ? { ...p, estado: 'inactivo' } : p)
      )
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  useEffect(() => {
    fetchProductos()
    fetchAlertas()
  }, [fetchProductos, fetchAlertas])

  // ── Filtros locales ─────────────────────────────────
  const productosActivos = productos.filter(p => p.estado === 'activo')

  const buscarProductos = useCallback((query) => {
    if (!query) return productosActivos
    const q = query.toLowerCase()
    return productosActivos.filter(p =>
      p.nombre.toLowerCase().includes(q)          ||
      p.categoria_nombre?.toLowerCase().includes(q)||
      p.color?.toLowerCase().includes(q)          ||
      p.numero_lote?.toLowerCase().includes(q)
    )
  }, [productosActivos])

  return {
    productos,
    productosActivos,
    stockBajo,
    proximosVencer,
    loading,
    error,
    fetchProductos,
    fetchAlertas,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    buscarProductos,
  }
}
