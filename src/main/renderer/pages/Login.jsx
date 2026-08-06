import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const {
    login,
    requestPasswordReset,
    resetPassword,
    loading,
    error,
  } = useAuth()

  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState({ usuario: '', password: '' })
  const [resetForm, setResetForm] = useState({ usuarioOrCorreo: '', code: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [debugCode, setDebugCode] = useState(null)

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
    setFeedback('')
    setDebugCode(null)
  }

  const handleResetChange = (e) => {
    setResetForm({ ...resetForm, [e.target.name]: e.target.value })
    setFeedback('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login({ usuario: loginForm.usuario, password: loginForm.password })
  }

  const handleShowForgot = (e) => {
    e.preventDefault()
    setMode('forgot')
    setFeedback('')
    setDebugCode(null)
  }

  const handleCancelRecover = (e) => {
    e.preventDefault()
    setMode('login')
    setFeedback('')
    setDebugCode(null)
    setResetForm({ usuarioOrCorreo: '', code: '', password: '' })
  }

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setFeedback('')
    setDebugCode(null)

    if (!resetForm.usuarioOrCorreo.trim()) {
      setFeedback('Ingresa tu usuario o correo para recibir el código.')
      return
    }

    const result = await requestPasswordReset(resetForm.usuarioOrCorreo.trim())
    if (!result.ok) {
      setFeedback(result.message)
      if (result.debugCode) setDebugCode(result.debugCode)
      return
    }

    setMode('confirm')
    setFeedback('Código enviado. Revisa tu correo y completa el formulario.')
    setDebugCode(result.debugCode)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setFeedback('')

    if (!resetForm.usuarioOrCorreo.trim() || !resetForm.code.trim() || !resetForm.password.trim()) {
      setFeedback('Completa todos los campos para restablecer la contraseña.')
      return
    }

    const result = await resetPassword({
      usuarioOrCorreo: resetForm.usuarioOrCorreo.trim(),
      code: resetForm.code.trim(),
      password: resetForm.password.trim(),
    })

    if (!result.ok) {
      setFeedback(result.message)
      return
    }

    setFeedback(result.message)
    setMode('login')
    setLoginForm({ usuario: resetForm.usuarioOrCorreo.trim(), password: '' })
    setResetForm({ usuarioOrCorreo: '', code: '', password: '' })
  }

  const currentTitle = mode === 'login'
    ? 'Bienvenido de vuelta'
    : mode === 'forgot'
      ? 'Recuperar contraseña'
      : 'Código de recuperación'

  const currentSubtitle = mode === 'login'
    ? 'Ingresa tus credenciales para continuar'
    : mode === 'forgot'
      ? 'Te enviaremos un código seguro a tu correo o usuario registrado'
      : 'Introduce el código y crea una nueva contraseña'

  return (
    <div style={styles.root}>
      {/* Left panel — decorative */}
      <div className="login-panel" style={styles.panel}>
        <div style={styles.panelInner}>
          <div className="capsule-hero-wrap">
            <div className="capsule-hero" title="Pásame el mouse por encima ✨">
              <div className="capsule-top" />
              <div className="capsule-bottom" />
              <div className="capsule-seam" />
              <div className="capsule-particle p1" />
              <div className="capsule-particle p2" />
              <div className="capsule-particle p3" />
              <div className="capsule-particle p4" />
            </div>
            <span style={styles.logoText}>Cápsulas</span>
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
      <div className="login-form-side" style={styles.formSide}>
        <div style={styles.formCard}>
          {/* Mobile logo */}
          <div style={styles.mobileLogo}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#0f766e" />
              <path d="M10 18 L18 10 L26 18 L18 26 Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
              <circle cx="18" cy="18" r="3" fill="white" />
            </svg>
            <span style={styles.mobileLogoText}>MiApp</span>
          </div>

          <header style={styles.header}>
            <h1 style={styles.title}>{currentTitle}</h1>
            <p style={styles.subtitle}>{currentSubtitle}</p>
          </header>

          <form onSubmit={mode === 'login' ? handleSubmit : mode === 'forgot' ? handleRequestReset : handleResetPassword} style={styles.form}>
            {mode === 'login' && (
              <>
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
                      value={loginForm.usuario}
                      onChange={handleLoginChange}
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
                      value={loginForm.password}
                      onChange={handleLoginChange}
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
              </>
            )}

            {(mode === 'forgot' || mode === 'confirm') && (
              <>
                <div style={styles.fieldGroup}>
                  <label htmlFor="usuarioOrCorreo" style={styles.label}>Usuario o correo</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 8.5C3 6.57 4.57 5 6.5 5h7c1.93 0 3.5 1.57 3.5 3.5v3c0 1.93-1.57 3.5-3.5 3.5h-7C4.57 15 3 13.43 3 11.5v-3z" />
                      <path d="M3 8.5l7 4 7-4" />
                    </svg>
                    <input
                      id="usuarioOrCorreo"
                      type="text"
                      name="usuarioOrCorreo"
                      value={resetForm.usuarioOrCorreo}
                      onChange={handleResetChange}
                      placeholder="Usuario o correo"
                      required
                      autoFocus
                      style={styles.input}
                      onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                      onBlur={e => Object.assign(e.target.style, styles.input)}
                    />
                  </div>
                </div>

                {mode === 'confirm' && (
                  <>
                    <div style={styles.fieldGroup}>
                      <label htmlFor="code" style={styles.label}>Código temporal</label>
                      <div style={styles.inputWrapper}>
                        <input
                          id="code"
                          type="text"
                          name="code"
                          value={resetForm.code}
                          onChange={handleResetChange}
                          placeholder="123456"
                          required
                          style={styles.input}
                          onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                          onBlur={e => Object.assign(e.target.style, styles.input)}
                        />
                      </div>
                    </div>

                    <div style={styles.fieldGroup}>
                      <label htmlFor="password" style={styles.label}>Nueva contraseña</label>
                      <div style={styles.inputWrapper}>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={resetForm.password}
                          onChange={handleResetChange}
                          placeholder="••••••••"
                          required
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
                  </>
                )}
              </>
            )}

            {/* Error */}
            {error && (
              <div style={styles.errorBox} role="alert">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 00-1 1v.5a1 1 0 002 0V11a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {feedback && (
              <div style={styles.feedbackBox} role="status">
                {feedback}
                {debugCode && import.meta.env.DEV && (
                  <div style={styles.debugInfo}>
                    🛠️ Solo desarrollo — Código temporal: {debugCode}
                  </div>
                )}
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
                  {mode === 'login' ? 'Iniciando sesión...' : mode === 'forgot' ? 'Enviando código...' : 'Restableciendo...' }
                </>
              ) : (
                mode === 'login' ? 'Iniciar sesión' : mode === 'forgot' ? 'Enviar código' : 'Restablecer contraseña'
              )}
            </button>
          </form>

          <p style={styles.footer}>
            {mode === 'login' ? (
              <>
                ¿Olvidaste tu contraseña?{' '}
                <button type="button" onClick={handleShowForgot} style={styles.linkButton}>Recuperarla</button>
              </>
            ) : (
              <button type="button" onClick={handleCancelRecover} style={styles.linkButton}>Volver al inicio de sesión</button>
            )}
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

        /* ── Cápsula animada ─────────────────────────── */
        .capsule-hero-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 22px;
        }

        @keyframes capsuleFloat {
          0%, 100% { transform: rotate(-14deg) translateY(0); }
          50%      { transform: rotate(-14deg) translateY(-10px); }
        }

        .capsule-hero {
          position: relative;
          width: 108px;
          height: 270px;
          transform: rotate(-14deg);
          filter: drop-shadow(0 22px 28px rgba(3, 20, 18, 0.45));
          animation: capsuleFloat 4.5s ease-in-out infinite;
          cursor: pointer;
        }

        .capsule-hero:hover {
          animation-play-state: paused;
        }

        .capsule-top,
        .capsule-bottom {
          position: absolute;
          left: 0;
          width: 100%;
          height: 50%;
          transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .capsule-top {
          top: 0;
          border-radius: 54px 54px 6px 6px;
          background: linear-gradient(160deg, #5eead4 0%, #0f766e 75%);
          box-shadow:
            inset -10px -10px 18px rgba(0, 0, 0, 0.18),
            inset 8px 8px 14px rgba(255, 255, 255, 0.28);
        }

        .capsule-bottom {
          bottom: 0;
          border-radius: 6px 6px 54px 54px;
          background: linear-gradient(160deg, #fda4af 0%, #fb7185 75%);
          box-shadow:
            inset -10px -10px 18px rgba(0, 0, 0, 0.18),
            inset 8px 8px 14px rgba(255, 255, 255, 0.28);
        }

        .capsule-seam {
          position: absolute;
          top: 50%;
          left: -6%;
          width: 112%;
          height: 4px;
          background: rgba(0, 0, 0, 0.22);
          transform: translateY(-50%);
          border-radius: 999px;
          transition: opacity 0.3s ease;
        }

        .capsule-particle {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.3);
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .capsule-particle.p1 { background: #fde68a; }
        .capsule-particle.p2 { background: #fca5a5; }
        .capsule-particle.p3 { background: #99f6e4; }
        .capsule-particle.p4 { background: #c4b5fd; }

        .capsule-hero:hover .capsule-top {
          transform: translateY(-36px) rotate(-3deg);
        }
        .capsule-hero:hover .capsule-bottom {
          transform: translateY(36px) rotate(3deg);
        }
        .capsule-hero:hover .capsule-seam {
          opacity: 0;
        }
        .capsule-hero:hover .capsule-particle {
          opacity: 1;
        }
        .capsule-hero:hover .capsule-particle.p1 {
          transform: translate(-160%, -20%) scale(1);
          transition-delay: 0.04s;
        }
        .capsule-hero:hover .capsule-particle.p2 {
          transform: translate(60%, 10%) scale(1);
          transition-delay: 0.1s;
        }
        .capsule-hero:hover .capsule-particle.p3 {
          transform: translate(-40%, 90%) scale(1);
          transition-delay: 0.16s;
        }
        .capsule-hero:hover .capsule-particle.p4 {
          transform: translate(80%, 70%) scale(1);
          transition-delay: 0.22s;
        }
      `}</style>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f4faf9',
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
  },

  // Left decorative panel
  panel: {
    width: '45%',
    background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #075985 100%)',
    display: 'flex',
    alignItems: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },
  panelInner: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '56px',
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
    marginBottom: '0',
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
    background: '#fb7185',
    opacity: 0.35,
  },
  circle1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.1)',
    top: '-80px',
    right: '-80px',
  },
  circle2: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    border: '1px solid rgba(251,113,133,0.18)',
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
    color: '#0f766e',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#0c2a27',
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
    color: '#0c2a27',
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
    color: '#0c2a27',
    background: 'white',
    border: '1.5px solid #0f766e',
    borderRadius: '10px',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 0 0 3px rgba(15,118,110,0.12)',
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
    background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 100%)',
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
    color: '#0f766e',
    fontWeight: '500',
    textDecoration: 'none',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#0f766e',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
  },
  feedbackBox: {
    padding: '12px 14px',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    color: '#0c2a27',
    fontSize: '13px',
  },
  debugInfo: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#334155',
  },
}

export default Login
