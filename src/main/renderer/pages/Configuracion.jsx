import { useEffect, useState } from 'react'

const DEFAULT_CONFIG = {
  negocio: '',
  moneda: 'CRC',
  tema: 'light',
  notificaciones: true,
}

function Configuracion() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const raw = window.localStorage.getItem('capsulas-config')
    if (raw) {
      try {
        setConfig(JSON.parse(raw))
      } catch (error) {
        console.warn('No se pudo leer la configuración local:', error)
      }
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('theme-dark', config.tema === 'dark')
  }, [config.tema])

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setMensaje('')
  }

  const guardarConfiguracion = (event) => {
    event.preventDefault()
    window.localStorage.setItem('capsulas-config', JSON.stringify(config))
    setMensaje('Configuración guardada correctamente.')
  }

  const restaurarPredeterminados = () => {
    window.localStorage.removeItem('capsulas-config')
    setConfig(DEFAULT_CONFIG)
    setMensaje('Valores predeterminados restaurados.')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>⚙️ Configuración</h1>
          <p>Personaliza los ajustes del sistema para tu negocio y guarda tus preferencias.</p>
        </div>
        <div className="status-pill">Tema activo: {config.tema === 'dark' ? 'Oscuro' : 'Claro'}</div>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Resumen de la configuración</h2>
              <p>Datos guardados en tu navegador para una experiencia rápida.</p>
            </div>
          </div>

          <ul className="settings-summary">
            <li>
              <strong>Negocio:</strong> {config.negocio || 'No definido'}
            </li>
            <li>
              <strong>Moneda:</strong> {config.moneda}
            </li>
            <li>
              <strong>Tema:</strong> {config.tema === 'dark' ? 'Oscuro' : 'Claro'}
            </li>
            <li>
              <strong>Alertas:</strong> {config.notificaciones ? 'Activadas' : 'Desactivadas'}
            </li>
          </ul>
        </section>

        <form className="settings-form" onSubmit={guardarConfiguracion}>
          <section className="settings-section">
            <h2>Datos del negocio</h2>
            <p className="field-description">Define el nombre y moneda por defecto para tu catálogo.</p>

            <div className="form-group">
              <label>Nombre del negocio</label>
              <input
                type="text"
                value={config.negocio}
                placeholder="Mi empresa"
                onChange={(e) => handleChange('negocio', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Moneda principal</label>
              <select
                value={config.moneda}
                onChange={(e) => handleChange('moneda', e.target.value)}
              >
                <option value="CRC">Colón (CRC)</option>
                <option value="USD">Dólar (USD)</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h2>Preferencias de visualización</h2>
            <p className="field-description">Ajusta el tema y la forma en que recibes alertas.</p>

            <div className="form-group">
              <label>Tema</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="tema"
                    value="light"
                    checked={config.tema === 'light'}
                    onChange={() => handleChange('tema', 'light')}
                  />
                  Claro
                </label>
                <label>
                  <input
                    type="radio"
                    name="tema"
                    value="dark"
                    checked={config.tema === 'dark'}
                    onChange={() => handleChange('tema', 'dark')}
                  />
                  Oscuro
                </label>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.notificaciones}
                  onChange={(e) => handleChange('notificaciones', e.target.checked)}
                />
                &nbsp; Activar notificaciones de alertas
              </label>
            </div>
          </section>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={restaurarPredeterminados}>
              Restaurar valores predeterminados
            </button>
            <button type="submit" className="btn-primary">
              Guardar configuración
            </button>
          </div>

          {mensaje && <p className="message-success">{mensaje}</p>}
        </form>
      </div>
    </div>
  )
}

export default Configuracion
