import { useState } from 'react'
import { useInventario } from '../hooks/useInventario'
import { useProductos }  from '../hooks/useProductos'

function Inventario() {
  const {
    movimientos, resumen,
    loading, registrarEntrada, registrarSalida
  } = useInventario()

  const { productos } = useProductos()

  const [tab, setTab]         = useState('movimientos')  // movimientos | entrada | salida
  const [formE, setFormE]     = useState({ productoId: '', cantidad: '', notas: '' })
  const [formS, setFormS]     = useState({ productoId: '', cantidad: '', notas: '' })
  const [loadingOp, setLoadingOp] = useState(false)

  const handleEntrada = async (e) => {
    e.preventDefault()
    setLoadingOp(true)
    await registrarEntrada({
      productoId: parseInt(formE.productoId),
      cantidad:   parseInt(formE.cantidad),
      notas: formE.notas
    })
    setFormE({ productoId: '', cantidad: '', notas: '' })
    setLoadingOp(false)
    setTab('movimientos')
  }

  const handleSalida = async (e) => {
    e.preventDefault()
    setLoadingOp(true)
    await registrarSalida({
      productoId: parseInt(formS.productoId),
      cantidad:   parseInt(formS.cantidad),
      notas: formS.notas
    })
    setFormS({ productoId: '', cantidad: '', notas: '' })
    setLoadingOp(false)
    setTab('movimientos')
  }

  if (loading) return <div className="page-loading">Cargando inventario…</div>

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>📥 Inventario</h1>
          <p>Control de entradas y salidas</p>
        </div>
        <div className="header-actions">
          <button className="btn-success" onClick={() => setTab('entrada')}>+ Entrada</button>
          <button className="btn-danger-outline" onClick={() => setTab('salida')}>- Salida</button>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="stats-grid stats-grid-4">
          <div className="stat-card">
            <div className="stat-icon">📥</div>
            <div className="stat-info">
              <h3>{resumen.entradasHoy ?? 0}</h3>
              <p>Entradas hoy</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📤</div>
            <div className="stat-info">
              <h3>{resumen.salidasHoy ?? 0}</h3>
              <p>Salidas hoy</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{resumen.movimientosHoy ?? 0}</h3>
              <p>Movimientos hoy</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <h3>{movimientos.length}</h3>
              <p>Total registros</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab==='movimientos'?'active':''}`}
          onClick={() => setTab('movimientos')}>📋 Movimientos</button>
        <button className={`tab ${tab==='entrada'?'active':''}`}
          onClick={() => setTab('entrada')}>📥 Registrar entrada</button>
        <button className={`tab ${tab==='salida'?'active':''}`}
          onClick={() => setTab('salida')}>📤 Registrar salida</button>
      </div>

      {/* Tabla de movimientos */}
      {tab === 'movimientos' && (
        movimientos.length === 0
          ? <p className="empty-msg">No hay movimientos registrados.</p>
          : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Notas</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map(m => (
                    <tr key={m.id}>
                      <td>{m.id}</td>
                      <td>
                        <span className={`badge ${m.tipo === 'entrada' ? 'badge-success' : 'badge-danger'}`}>
                          {m.tipo === 'entrada' ? '📥 Entrada' : '📤 Salida'}
                        </span>
                      </td>
                      <td>{productos.find(p=>p.id===m.productoId)?.nombre ?? m.productoId}</td>
                      <td>{m.cantidad}</td>
                      <td>{m.notas || '—'}</td>
                      <td>{new Date(m.fecha).toLocaleString('es-CR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}

      {/* Formulario Entrada */}
      {tab === 'entrada' && (
        <div className="form-card">
          <h2>📥 Registrar entrada de inventario</h2>
          <form onSubmit={handleEntrada} className="modal-form">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Producto *</label>
                <select required value={formE.productoId}
                  onChange={e => setFormE({...formE, productoId: e.target.value})}>
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Cantidad *</label>
                <input required type="number" min="1" value={formE.cantidad}
                  onChange={e => setFormE({...formE, cantidad: e.target.value})} />
              </div>
              <div className="form-group form-full">
                <label>Notas</label>
                <textarea rows={2} value={formE.notas}
                  onChange={e => setFormE({...formE, notas: e.target.value})}
                  placeholder="Proveedor, motivo, etc." />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setTab('movimientos')}>Cancelar</button>
              <button type="submit" className="btn-success" disabled={loadingOp}>
                {loadingOp ? 'Registrando…' : '✅ Registrar entrada'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario Salida */}
      {tab === 'salida' && (
        <div className="form-card">
          <h2>📤 Registrar salida de inventario</h2>
          <form onSubmit={handleSalida} className="modal-form">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Producto *</label>
                <select required value={formS.productoId}
                  onChange={e => setFormS({...formS, productoId: e.target.value})}>
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Cantidad *</label>
                <input required type="number" min="1" value={formS.cantidad}
                  onChange={e => setFormS({...formS, cantidad: e.target.value})} />
              </div>
              <div className="form-group form-full">
                <label>Notas</label>
                <textarea rows={2} value={formS.notas}
                  onChange={e => setFormS({...formS, notas: e.target.value})}
                  placeholder="Motivo de salida, destino, etc." />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setTab('movimientos')}>Cancelar</button>
              <button type="submit" className="btn-danger" disabled={loadingOp}>
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
