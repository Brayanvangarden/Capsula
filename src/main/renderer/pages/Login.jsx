import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const { login, loading, error } = useAuth()
  const [form, setForm] = useState({ usuario: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login({ usuario: form.usuario, password: form.password })
  }

  return (
    <div style={styles.root}>
      {/* Left panel — decorative */}
      <div style={styles.panel}>
        <div style={styles.panelInner}>
          <div style={styles.logo}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="rgba(255,255,255,0.15)" />
              <path d="M10 18 L18 10 L26 18 L18 26 Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
              <circle cx="18" cy="18" r="3" fill="white" />
            </svg>
            <span style={styles.logoText}>MiApp</span>
          </div>

          <div style={styles.panelContent}>
            <blockquote style={styles.quote}>
              "Accede de forma segura y administra todo desde un solo lugar."
            </blockquote>
            <div style={styles.dots}>
              <span style={{ ...styles.dot, opacity: 1 }} />
              <span style={styles.dot} />
              <span style={styles.dot} />
            </div>
          </div>

          {/* Decorative circles */}
          <div style={styles.circle1} />
          <div style={styles.circle2} />
        </div>
      </div>

      {/* Right panel — form */}
      <div style={styles.formSide}>
        <div style={styles.formCard}>
          {/* Mobile logo */}
          <div style={styles.mobileLogo}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#1a1a2e" />
              <path d="M10 18 L18 10 L26 18 L18 26 Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
              <circle cx="18" cy="18" r="3" fill="white" />
            </svg>
            <span style={styles.mobileLogoText}>MiApp</span>
          </div>

          <header style={styles.header}>
            <h1 style={styles.title}>Bienvenido de vuelta</h1>
            <p style={styles.subtitle}>Ingresa tus credenciales para continuar</p>
          </header>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Usuario */}
            <div style={styles.fieldGroup}>
              <label htmlFor="usuario" style={styles.label}>Usuario</label>
              <div style={styles.inputWrapper}>
                <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 0114 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  id="usuario"
                  type="text"
                  name="usuario"
                  value={form.usuario}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  required
                  autoFocus
                  autoComplete="username"
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, styles.input)}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={styles.fieldGroup}>
              <label htmlFor="password" style={styles.label}>Contraseña</label>
              <div style={styles.inputWrapper}>
                <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="9" width="14" height="10" rx="2" strokeLinejoin="round" />
                  <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, styles.input)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                      <path d="M3 10s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" strokeLinejoin="round" />
                      <circle cx="10" cy="10" r="2" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                      <path d="M2 2l16 16M7.5 7.6A5 5 0 0115 10c0 .5-.07 1-.2 1.4M9.4 14.8A7 7 0 013 10c.6-1.4 1.6-2.7 2.8-3.7" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorBox} role="alert">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 00-1 1v.5a1 1 0 002 0V11a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.btn, ...styles.btnDisabled } : styles.btn}
            >
              {loading ? (
                <>
                  <svg style={styles.spinner} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
                  </svg>
                  Iniciando sesión...
                </>
              ) : 'Iniciar sesión'}
            </button>
          </form>

          <p style={styles.footer}>
            ¿Problemas para acceder?{' '}
            <a href="#" style={styles.link}>Contacta soporte</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .login-panel { display: none !important; }
          .login-form-side { width: 100% !important; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f4f0',
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
  },

  // Left decorative panel
  panel: {
    width: '45%',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },
  panelInner: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '40px',
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoText: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '-0.3px',
  },
  panelContent: {
    marginBottom: '60px',
  },
  quote: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '22px',
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: '-0.3px',
    margin: '0 0 32px 0',
    fontStyle: 'normal',
  },
  dots: {
    display: 'flex',
    gap: '8px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'white',
    opacity: 0.3,
  },
  circle1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.08)',
    top: '-80px',
    right: '-80px',
  },
  circle2: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.06)',
    bottom: '60px',
    right: '-40px',
  },

  // Right form side
  formSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  },
  formCard: {
    width: '100%',
    maxWidth: '400px',
  },
  mobileLogo: {
    display: 'none',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '32px',
  },
  mobileLogoText: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1a1a2e',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#0d0d1a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.5',
  },

  // Form
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    letterSpacing: '0.01em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    width: '17px',
    height: '17px',
    color: '#9ca3af',
    pointerEvents: 'none',
    flexShrink: 0,
  },
  input: {
    width: '100%',
    padding: '11px 40px 11px 38px',
    fontSize: '14px',
    color: '#0d0d1a',
    background: 'white',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  inputFocus: {
    width: '100%',
    padding: '11px 40px 11px 38px',
    fontSize: '14px',
    color: '#0d0d1a',
    background: 'white',
    border: '1.5px solid #0f3460',
    borderRadius: '10px',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 0 0 3px rgba(15,52,96,0.1)',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },

  // Error
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#b91c1c',
  },

  // Button
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '13px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'opacity 0.15s ease, transform 0.1s ease',
    marginTop: '4px',
  },
  btnDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  spinner: {
    animation: 'spin 0.8s linear infinite',
  },

  // Footer
  footer: {
    marginTop: '28px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#6b7280',
  },
  link: {
    color: '#0f3460',
    fontWeight: '500',
    textDecoration: 'none',
  },
}

export default Login
