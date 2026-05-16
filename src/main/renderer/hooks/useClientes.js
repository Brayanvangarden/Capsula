import { useState, useEffect, useCallback } from 'react'
import { clientesService } from '../services/clientes.service'

export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  // ── Cargar todos ────────────────────────────────────
  const fetchClientes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await clientesService.getAll()
      setClientes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Crear ───────────────────────────────────────────
  const crearCliente = useCallback(async (data) => {
    try {
      const nuevo = await clientesService.create(data)
      setClientes(prev => [...prev, nuevo])
      return { ok: true, data: nuevo }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  // ── Actualizar ──────────────────────────────────────
  const actualizarCliente = useCallback(async (data) => {
    try {
      const actualizado = await clientesService.update(data)
      setClientes(prev =>
        prev.map(c => c.id === actualizado.id ? actualizado : c)
      )
      return { ok: true, data: actualizado }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  // ── Eliminar lógico ─────────────────────────────────
  const eliminarCliente = useCallback(async (id) => {
    try {
      await clientesService.delete(id)
      setClientes(prev =>
        prev.map(c => c.id === id ? { ...c, estado: 'inactivo' } : c)
      )
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  // ── Buscar localmente ───────────────────────────────
  const buscarClientes = useCallback((query) => {
    if (!query) return clientes
    const q = query.toLowerCase()
    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(q)   ||
      c.empresa?.toLowerCase().includes(q) ||
      c.telefono?.includes(q)              ||
      c.correo?.toLowerCase().includes(q)
    )
  }, [clientes])

  // ── Clientes con balance pendiente ─────────────────
  const clientesConDeuda = clientes.filter(c => c.balance_pendiente > 0)

  useEffect(() => { fetchClientes() }, [fetchClientes])

  return {
    clientes,
    clientesConDeuda,
    loading,
    error,
    fetchClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,
  }
}
