import { useState, useEffect, useCallback } from 'react'
import { categoriasService } from '../services/categorias.service'

export function useCategorias() {
  const [categorias, setCategorias] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  const fetchCategorias = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await categoriasService.getAll()
      setCategorias(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const crearCategoria = useCallback(async (data) => {
    try {
      const nueva = await categoriasService.create(data)
      setCategorias(prev => [...prev, nueva])
      return { ok: true, data: nueva }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  const actualizarCategoria = useCallback(async (data) => {
    try {
      const actualizada = await categoriasService.update(data)
      setCategorias(prev =>
        prev.map(c => c.id === actualizada.id ? actualizada : c)
      )
      return { ok: true, data: actualizada }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  const eliminarCategoria = useCallback(async (id) => {
    try {
      await categoriasService.delete(id)
      setCategorias(prev =>
        prev.map(c => c.id === id ? { ...c, estado: 'inactivo' } : c)
      )
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  const categoriasActivas = categorias.filter(c => c.estado === 'activo')

  useEffect(() => { fetchCategorias() }, [fetchCategorias])

  return {
    categorias,
    categoriasActivas,
    loading,
    error,
    fetchCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  }
}
