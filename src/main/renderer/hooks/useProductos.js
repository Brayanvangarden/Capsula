import { useState, useEffect, useCallback } from 'react'
import { productosService } from '../services/productos.service'
import { useAuthStore } from '../store/auth.store'

export function useProductos() {
  const { user } = useAuthStore()
  const [productos,       setProductos]       = useState([])
  const [stockBajo,       setStockBajo]       = useState([])
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
      const bajo = await productosService.getStockBajo()
      setStockBajo(bajo)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  // ── Crear ───────────────────────────────────────────
  const crearProducto = useCallback(async (data) => {
    try {
      const nuevo = await productosService.create({ ...data, usuario_id: user?.id ?? null })
      setProductos(prev => [...prev, nuevo])
      return { ok: true, data: nuevo }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [user?.id])

  // ── Actualizar ──────────────────────────────────────
  const actualizarProducto = useCallback(async (data) => {
    try {
      const actualizado = await productosService.update({ ...data, usuario_id: user?.id ?? null })
      setProductos(prev =>
        prev.map(p => p.id === actualizado.id ? actualizado : p)
      )
      return { ok: true, data: actualizado }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [user?.id])

  // ── Eliminar (lógico) ───────────────────────────────
  const eliminarProducto = useCallback(async (id) => {
    try {
      await productosService.delete(id, user?.id ?? null)
      setProductos(prev =>
        prev.map(p => p.id === id ? { ...p, estado: 'inactivo' } : p)
      )
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [user?.id])

  const obtenerProducto = useCallback(async (id) => {
    try {
      const producto = await productosService.getById(id)
      return { ok: true, data: producto }
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
      p.numero_lote?.toLowerCase().includes(q)    ||
      p.sku?.toLowerCase().includes(q)
    )
  }, [productosActivos])

  return {
    productos,
    productosActivos,
    stockBajo,
    loading,
    error,
    fetchProductos,
    fetchAlertas,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProducto,
    buscarProductos,
  }
}
