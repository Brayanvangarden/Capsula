import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { authService } from '../services/auth.service'

export function useAuth() {
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // ── Login ───────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)

    try {
      const userData = await authService.login(
        credentials.usuario,
        credentials.password
      )
      setUser(userData)
      navigate('/')
      return { ok: true }
    } catch (error) {
      setError(error.message)
      return {
        ok: false,
        message: error.message,
        lockedUntil: error.lockedUntil,
        attempts: error.attempts,
      }
    } finally {
      setLoading(false)
    }
  }, [setUser, navigate])

  const requestPasswordReset = useCallback(async (usuarioOrCorreo, smtpConfig = null) => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.requestPasswordReset(usuarioOrCorreo, smtpConfig)
      return result
    } catch (error) {
      setError(error.message)
      return { ok: false, message: error.message, debugCode: error.debugCode }
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (payload) => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.resetPassword(payload)
      return result
    } catch (error) {
      setError(error.message)
      return { ok: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Logout ──────────────────────────────────────────
  const logout = useCallback(() => {
    clearUser()
    navigate('/login', { replace: true })
  }, [clearUser, navigate])

  // ── Verificar permiso por rol ───────────────────────
  const hasRole = useCallback((rol) => {
    if (!user) return false
    if (Array.isArray(rol)) return rol.includes(user.rol)
    return user.rol === rol
  }, [user])

  const isAdmin    = user?.rol === 'admin'
  const isVendedor = user?.rol === 'vendedor'

  return {
    user,
    isAuthenticated,
    isAdmin,
    isVendedor,
    hasRole,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    loading,
    error,
  }
}
