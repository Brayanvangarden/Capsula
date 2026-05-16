import { useState, useCallback } from 'react'
import { inventarioService } from '../services/inventario.service'

export function useInventario() {
  const [movimientos, setMovimientos] = useState([])
  const [resumen,     setResumen]     = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  // ── Cargar movimientos con filtros ──────────────────
  const fetchMovimientos = useCallback(async (filtros = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await inventarioService.getMovimientos(filtros)
      setMovimientos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Resumen por producto ────────────────────────────
  const fetchResumenProducto = useCallback(async (producto_id) => {
    try {
      const data = await inventarioService.getResumenProducto(producto_id)
      setResumen(data)
      return data
    } catch (err) {
      setError(err.message)
    }
  }, [])

  // ── Registrar entrada ───────────────────────────────
  const registrarEntrada = useCallback(async (data) => {
    try {
      const mov = await inventarioService.registrarEntrada(data)
      setMovimientos(prev => [mov, ...prev])
      return { ok: true, data: mov }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  // ── Registrar salida ────────────────────────────────
  const registrarSalida = useCallback(async (data) => {
    try {
      const mov = await inventarioService.registrarSalida(data)
      setMovimientos(prev => [mov, ...prev])
      return { ok: true, data: mov }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  return {
    movimientos,
    resumen,
    loading,
    error,
    fetchMovimientos,
    fetchResumenProducto,
    registrarEntrada,
    registrarSalida,
  }
}
