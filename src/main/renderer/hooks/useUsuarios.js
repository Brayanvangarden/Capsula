import { useState, useEffect, useCallback } from 'react'
import { usuariosService } from '../services/usuarios.service'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await usuariosService.getAll()
      setUsuarios(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const crearUsuario = useCallback(async (data) => {
    try {
      const nuevo = await usuariosService.create(data)
      setUsuarios(prev => [...prev, nuevo])
      return { ok: true, data: nuevo }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  const actualizarUsuario = useCallback(async (data) => {
    try {
      const actualizado = await usuariosService.update(data)
      setUsuarios(prev =>
        prev.map(u => u.id === actualizado.id ? actualizado : u)
      )
      return { ok: true, data: actualizado }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  const cambiarPassword = useCallback(async (id, password) => {
    try {
      await usuariosService.changePassword(id, password)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  const toggleEstado = useCallback(async (id) => {
    try {
      const actualizado = await usuariosService.toggleEstado(id)
      setUsuarios(prev =>
        prev.map(u => u.id === id ? actualizado : u)
      )
      return { ok: true, data: actualizado }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  useEffect(() => { fetchUsuarios() }, [fetchUsuarios])

  const admins    = usuarios.filter(u => u.rol    === 'admin')
  const vendedores = usuarios.filter(u => u.rol   === 'vendedor')
  const activos   = usuarios.filter(u => u.estado === 'activo')

  return {
    usuarios,
    admins,
    vendedores,
    activos,
    loading,
    error,
    fetchUsuarios,
    crearUsuario,
    actualizarUsuario,
    cambiarPassword,
    toggleEstado,
  }
}
