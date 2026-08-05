import { useState, useCallback, useEffect } from 'react'
import { inventarioService } from '../services/inventario.service'

export function useInventario() {
  const [movimientos, setMovimientos] = useState([])
  const [resumen,     setResumen]     = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

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

  const fetchResumenProducto = useCallback(async (producto_id) => {
    try {
      const data = await inventarioService.getResumenProducto(producto_id)
      setResumen(data)
      return data
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const registrarEntrada = useCallback(async (data) => {
    try {
      const mov = await inventarioService.registrarEntrada(data)
      setMovimientos(prev => [mov, ...prev])
      return { ok: true, data: mov }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  const registrarSalida = useCallback(async (data) => {
    try {
      const mov = await inventarioService.registrarSalida(data)
      setMovimientos(prev => [mov, ...prev])
      return { ok: true, data: mov }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  // Carga inicial — sin esto la tabla arrancaba vacía siempre
  useEffect(() => {
    fetchMovimientos()
  }, [fetchMovimientos])

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