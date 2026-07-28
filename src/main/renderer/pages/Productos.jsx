import { useState } from 'react'
import { useProductos }  from '../hooks/useProductos'
import { useCategorias } from '../hooks/useCategorias'

const EMPTY = {
  nombre: '', descripcion: '', precio: '', costo: '',
  stock: '', stockMinimo: '', categoriaId: '', fechaVencimiento: ''
}

function Productos() {
  const {
    productos, stockBajo, proximosVencer,
    loading, crearProducto, actualizarProducto,
    eliminarProducto, buscarProductos
  } = useProductos()

  const { categorias } = useCategorias()

  const [busqueda, setBusqueda]   = useState('')
  const [modal, setModal]         = useState(false)
  const [editando, setEditando]   = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [filtro, setFiltro]       = useState('todos')
  const [confirmId, setConfirmId] = useState(null)
  const [mensaje, setMensaje]     = useState('')
  const [mensajeTipo, setMensajeTipo] = useState('success')

  // ── Filtros ──────────────────────────────────────────
  const listaFiltrada = (() => {
    let lista = busqueda ? buscarProductos(busqueda) : productos
    if (filtro === 'stockBajo')       lista = lista.filter(p => stockBajo.find(s => s.id === p.id))
    if (filtro === 'proximosVencer')  lista = lista.filter(p => proximosVencer.find(v => v.id === p.id))
    return lista
  })()

  // ── Handlers ─────────────────────────────────────────
  const abrirCrear = () => { setForm(EMPTY); setEditando(null); setMensaje(''); setModal(true) }

  const abrirEditar = (p) => {
    setMensaje('')
    setForm({
      nombre: p.nombre, descripcion: p.descripcion ?? '',
      precio: p.precio, costo: p.costo ?? '',
      stock: p.stock, stockMinimo: p.stockMinimo ?? '',
      categoriaId: p.categoriaId ?? '',
      fechaVencimiento: p.fechaVencimiento?.slice(0, 10) ?? ''
    })
    setEditando(p.id)
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')

    const data = {
      ...form,
      precio: parseFloat(form.precio),
      costo:  parseFloat(form.costo  || 0),
      stock:  parseInt(form.stock),
      stockMinimo: parseInt(form.stockMinimo || 0),
      categoriaId: form.categoriaId ? parseInt(form.categoriaId) : null,
      fechaVencimiento: form.fechaVencimiento || null
    }

    const resultado = editando
      ? await actualizarProducto({ id: editando, ...data })
      : await crearProducto(data)

    if (!resultado.ok) {
      setMensajeTipo('error')
      setMensaje(resultado.message || 'No se pudo guardar el producto.')
      return
    }

    setMensajeTipo('success')
    setMensaje(editando ? 'Producto actualizado correctamente.' : 'Producto guardado correctamente.')
    setModal(false)
  }

  const handleEliminar = async (id) => {
    await eliminarProducto(id)
    setConfirmId(null)
  }

  if (loading) return <div className="page-loading">Cargando productos…</div>

  return (
    <div className="page">

      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1>📦 Productos</h1>
          <p>{productos.length} productos registrados</p>
        </div>
        <button className="btn-primary" onClick={abrirCrear}>+ Nuevo producto</button>
      </div>

      {mensaje && (
        <p className={mensajeTipo === 'success' ? 'message-success' : 'message-error'}>
          {mensaje}
        </p>
      )}

      {/* Alertas rápidas */}
      {(stockBajo.length > 0 || proximosVencer.length > 0) && (
        <div className="alertas-row">
          {stockBajo.length > 0 && (
            <div className="alerta alerta-warning" onClick={() => setFiltro('stockBajo')}>
              ⚠️ <strong>{stockBajo.length}</strong> con stock bajo
            </div>
          )}
          {proximosVencer.length > 0 && (
            <div className="alerta alerta-danger" onClick={() => setFiltro('proximosVencer')}>
              ⏰ <strong>{proximosVencer.length}</strong> próximos a vencer
            </div>
          )}
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="toolbar">
        <input
          type="text" placeholder="🔍 Buscar productos…"
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setFiltro('todos') }}
          className="search-input"
        />
        <div className="filtros">
          {['todos','stockBajo','proximosVencer'].map(f => (
            <button
              key={f}
              className={`btn-filtro ${filtro === f ? 'active' : ''}`}
              onClick={() => { setFiltro(f); setBusqueda('') }}
            >
              { f === 'todos' ? 'Todos'
              : f === 'stockBajo' ? '⚠️ Stock bajo'
              : '⏰ Próximos a vencer' }
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {listaFiltrada.length === 0
        ? <p className="empty-msg">No se encontraron productos.</p>
        : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Costo</th>
                  <th>Stock</th>
                  <th>Vence</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map(p => (
                  <tr key={p.id} className={stockBajo.find(s=>s.id===p.id) ? 'row-warning' : ''}>
                    <td><strong>{p.nombre}</strong><br/><small>{p.descripcion}</small></td>
                    <td>{categorias.find(c=>c.id===p.categoriaId)?.nombre ?? '—'}</td>
                    <td>₡{parseFloat(p.precio).toLocaleString('es-CR')}</td>
                    <td>{p.costo ? `₡${parseFloat(p.costo).toLocaleString('es-CR')}` : '—'}</td>
                    <td>
                      <span className={`badge ${p.stock <= (p.stockMinimo||0) ? 'badge-danger' : 'badge-success'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      {p.fechaVencimiento
                        ? new Date(p.fechaVencimiento).toLocaleDateString('es-CR')
                        : '—'}
                    </td>
                    <td className="actions">
                      <button className="btn-icon" onClick={() => abrirEditar(p)}>✏️</button>
                      <button className="btn-icon btn-danger" onClick={() => setConfirmId(p.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      {/* Modal Crear / Editar */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input required value={form.nombre}
                    onChange={e => setForm({...form, nombre: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select value={form.categoriaId}
                    onChange={e => setForm({...form, categoriaId: e.target.value})}>
                    <option value="">Sin categoría</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Precio *</label>
                  <input required type="number" step="0.01" min="0"
                    value={form.precio}
                    onChange={e => setForm({...form, precio: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Costo</label>
                  <input type="number" step="0.01" min="0"
                    value={form.costo}
                    onChange={e => setForm({...form, costo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Stock actual *</label>
                  <input required type="number" min="0"
                    value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Stock mínimo</label>
                  <input type="number" min="0"
                    value={form.stockMinimo}
                    onChange={e => setForm({...form, stockMinimo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Fecha de vencimiento</label>
                  <input type="date" value={form.fechaVencimiento}
                    onChange={e => setForm({...form, fechaVencimiento: e.target.value})} />
                </div>
                <div className="form-group form-full">
                  <label>Descripción</label>
                  <textarea rows={2} value={form.descripcion}
                    onChange={e => setForm({...form, descripcion: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editando ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
      {confirmId && (
        <div className="modal-overlay" onClick={() => setConfirmId(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar producto?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setConfirmId(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleEliminar(confirmId)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Productos
