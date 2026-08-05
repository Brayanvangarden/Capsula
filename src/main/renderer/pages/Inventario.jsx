import { useState, useMemo } from 'react'
import { useInventario } from '../hooks/useInventario'
import { useProductos } from '../hooks/useProductos'

function ArrowDownIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
    </svg>
  )
}
function ArrowUpIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
    </svg>
  )
}
function AlertIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

const EMPTY_FORM = { producto_id: '', cantidad: '', observaciones: '' }

function Inventario() {
  const {
    movimientos, loading, error,
    fetchMovimientos, registrarEntrada, registrarSalida,
  } = useInventario()
  const { productos } = useProductos()

  const [tab, setTab] = useState('movimientos') // movimientos | entrada | salida
  const [formE, setFormE] = useState(EMPTY_FORM)
  const [formS, setFormS] = useState(EMPTY_FORM)
  const [loadingOp, setLoadingOp] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos') // todos | entrada | salida
  const [filtroProducto, setFiltroProducto] = useState('')

  const productosStockBajo = useMemo(
    () => productos.filter(p => Number(p.cantidad) <= Number(p.stock_minimo ?? 0)),
    [productos]
  )

  const hoy = new Date().toISOString().slice(0, 10)
  const resumenHoy = useMemo(() => {
    const deHoy = movimientos.filter(m => (m.fecha ?? '').slice(0, 10) === hoy)
    return {
      entradas: deHoy.filter(m => m.tipo === 'entrada').length,
      salidas: deHoy.filter(m => m.tipo === 'salida').length,
      total: deHoy.length,
    }
  }, [movimientos, hoy])

  const movimientosFiltrados = movimientos.filter((m) => {
    const coincideTipo = filtroTipo === 'todos' || m.tipo === filtroTipo
    const coincideProducto = !filtroProducto || String(m.producto_id) === filtroProducto
    return coincideTipo && coincideProducto
  })

  const handleEntrada = async (e) => {
    e.preventDefault()
    setLoadingOp(true)
    setMensaje('')
    try {
      const resultado = await registrarEntrada({
        producto_id: parseInt(formE.producto_id),
        cantidad: parseFloat(formE.cantidad),
        observaciones: formE.observaciones,
      })
      if (!resultado.ok) {
        setMensaje(resultado.message || 'No se pudo registrar la entrada.')
        return
      }
      setFormE(EMPTY_FORM)
      setTab('movimientos')
      fetchMovimientos()
    } finally {
      setLoadingOp(false)
    }
  }

  const handleSalida = async (e) => {
    e.preventDefault()
    setLoadingOp(true)
    setMensaje('')
    try {
      const resultado = await registrarSalida({
        producto_id: parseInt(formS.producto_id),
        cantidad: parseFloat(formS.cantidad),
        observaciones: formS.observaciones,
      })
      if (!resultado.ok) {
        setMensaje(resultado.message || 'No se pudo registrar la salida.')
        return
      }
      setFormS(EMPTY_FORM)
      setTab('movimientos')
      fetchMovimientos()
    } finally {
      setLoadingOp(false)
    }
  }

  if (loading) return <div className="page-loading">Cargando inventario…</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📦 Inventario</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => { setMensaje(''); setTab('entrada') }}>
            <ArrowDownIcon /> Entrada
          </button>
          <button className="btn-secondary" onClick={() => { setMensaje(''); setTab('salida') }}>
            <ArrowUpIcon /> Salida
          </button>
        </div>
      </div>

      {error && <p className="message-error">{error}</p>}
      {mensaje && ['entrada', 'salida'].includes(tab) && (
        <p className="message-error">{mensaje}</p>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📥</div>
          <div className="stat-info">
            <h3>{resumenHoy.entradas}</h3>
            <p>Entradas hoy</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-info">
            <h3>{resumenHoy.salidas}</h3>
            <p>Salidas hoy</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <h3>{resumenHoy.total}</h3>
            <p>Movimientos hoy</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{productosStockBajo.length}</h3>
            <p>Productos con stock bajo</p>
          </div>
        </div>
      </div>

      {productosStockBajo.length > 0 && (
        <div className="stock-bajo-alerta">
          <div className="stock-bajo-header">
            <AlertIcon /> Productos con stock bajo o agotado
          </div>
          <div className="stock-bajo-lista">
            {productosStockBajo.map((p) => (
              <span key={p.id} className="pill pill-no">
                {p.nombre} · {p.cantidad}/{p.stock_minimo}
              </span>
            ))}
          </div>
        </div>
      )}

      {tab === 'movimientos' && (
        <div className="list-container">
          <div className="filtros">
            <button
              type="button"
              className={`btn-filtro ${filtroTipo === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltroTipo('todos')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`btn-filtro ${filtroTipo === 'entrada' ? 'active' : ''}`}
              onClick={() => setFiltroTipo('entrada')}
            >
              Entradas
            </button>
            <button
              type="button"
              className={`btn-filtro ${filtroTipo === 'salida' ? 'active' : ''}`}
              onClick={() => setFiltroTipo('salida')}
            >
              Salidas
            </button>

            <select
              className="filtro-select"
              value={filtroProducto}
              onChange={(e) => setFiltroProducto(e.target.value)}
            >
              <option value="">Todos los productos</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {movimientosFiltrados.length === 0 ? (
            <p className="empty-state">No hay movimientos registrados.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Observaciones</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientosFiltrados.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>
                      <span className={`pill ${m.tipo === 'entrada' ? 'pill-si' : 'pill-no'}`}>
                        {m.tipo === 'entrada' ? <ArrowDownIcon width={12} height={12} /> : <ArrowUpIcon width={12} height={12} />}
                        {' '}{m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td>{m.producto_nombre ?? '—'}</td>
                    <td>{m.cantidad}</td>
                    <td>{m.observaciones || '—'}</td>
                    <td>{m.usuario_nombre || '—'}</td>
                    <td>{new Date(m.fecha).toLocaleString('es-CR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'entrada' && (
        <div className="form-section">
          <h2>📥 Registrar entrada de inventario</h2>
          <form onSubmit={handleEntrada} className="form-grid">
            <div className="form-group">
              <label>Producto *</label>
              <select
                required
                value={formE.producto_id}
                onChange={(e) => setFormE({ ...formE, producto_id: e.target.value })}
              >
                <option value="">Seleccionar producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} (stock: {p.cantidad})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad *</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={formE.cantidad}
                onChange={(e) => setFormE({ ...formE, cantidad: e.target.value })}
              />
            </div>
            <div className="form-group full-width">
              <label>Observaciones</label>
              <textarea
                rows={2}
                value={formE.observaciones}
                onChange={(e) => setFormE({ ...formE, observaciones: e.target.value })}
                placeholder="Proveedor, motivo, etc."
              />
            </div>
            <div className="form-actions full-width">
              <button type="button" className="btn-secondary" onClick={() => setTab('movimientos')}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loadingOp}>
                {loadingOp ? 'Registrando…' : '✅ Registrar entrada'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'salida' && (
        <div className="form-section">
          <h2>📤 Registrar salida de inventario</h2>
          <form onSubmit={handleSalida} className="form-grid">
            <div className="form-group">
              <label>Producto *</label>
              <select
                required
                value={formS.producto_id}
                onChange={(e) => setFormS({ ...formS, producto_id: e.target.value })}
              >
                <option value="">Seleccionar producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} (stock: {p.cantidad})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad *</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={formS.cantidad}
                onChange={(e) => setFormS({ ...formS, cantidad: e.target.value })}
              />
            </div>
            <div className="form-group full-width">
              <label>Observaciones</label>
              <textarea
                rows={2}
                value={formS.observaciones}
                onChange={(e) => setFormS({ ...formS, observaciones: e.target.value })}
                placeholder="Motivo de salida, destino, etc."
              />
            </div>
            <div className="form-actions full-width">
              <button type="button" className="btn-secondary" onClick={() => setTab('movimientos')}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loadingOp}>
                {loadingOp ? 'Registrando…' : '✅ Registrar salida'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Inventario