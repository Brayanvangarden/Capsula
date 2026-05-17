import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const { login, loading, error } = useAuth()
  const [form, setForm] = useState({ usuario: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login({ usuario: form.usuario, password: form.password })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-form-wrapper login-only">
          <div className="login-header">
            <div>
              <h2>Inicia sesión</h2>
              <p className="login-subtitle">Usa tu usuario y contraseña para acceder.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="usuario">Usuario</label>
              <input
                id="usuario"
                type="text"
                name="usuario"
                value={form.usuario}
                onChange={handleChange}
                placeholder="admin"
                required
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-login">
              {loading ? 'Iniciando sesión...' : 'Continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
