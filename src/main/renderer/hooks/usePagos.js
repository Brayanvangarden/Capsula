import { useState, useEffect, useCallback } from 'react'
import { pagosService } from '../services/pagos.service'

export function usePagos(filtrosIniciales = {}) {
  const [pagos,   setPagos]   = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Cargar pagos ────────────────────────────────────
  const fetchPagos = useCallback(async (filtros = filtrosIniciales) => {
    setLoading(true)
    setError(null)
    try {
      const data = await pagosService.getAll(filtros)
      setPagos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Resumen ─────────────────────────────────────────
  const fetchResumen = useCallback(async () => {
    try {
      const data = await pagosService.getResumen()
      setResumen(data)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  // ── Registrar pago ──────────────────────────────────
  const registrarPago = useCallback(async (data) => {
    try {
      const nuevo = await pagosService.create(data)
      setPagos(prev => [nuevo, ...prev])
      return { ok: true, data: nuevo }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  // ── Historial por cliente ───────────────────────────
  const fetchHistorialCliente = useCallback(async (clienteId) => {
    setLoading(true)
    try {
      const data = await pagosService.getHistorialCliente(clienteId)
      setPagos(data)
      return data
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPagos()
    fetchResumen()
  }, [fetchPagos, fetchResumen])

  return {
    pagos,
    resumen,
    loading,
    error,
    fetchPagos,
    fetchResumen,
    registrarPago,
    fetchHistorialCliente,
  }
}
