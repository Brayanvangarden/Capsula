import { useCallback }    from 'react'
import { useNavigate }    from 'react-router-dom'
import { useAuthStore }   from '../store/auth.store'
import { authService }    from '../services/auth.service'

export function useAuth() {
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore()
  const navigate = useNavigate()

  // ── Login ───────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    try {
      const userData = await authService.login(
        credentials.usuario,
        credentials.password
      )
      setUser(userData)
      navigate('/')
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }, [setUser, navigate])

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
  }
}
