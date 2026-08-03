import { useState, useEffect } from 'react'
import { useProductos }  from '../hooks/useProductos'
import { useCategorias } from '../hooks/useCategorias'

function PencilIcon(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .622.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

function TrashIcon(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

const EMPTY = {
  nombre: '', descripcion: '', precio: '',
  stock: '', stockMinimo: '', categoriaId: '', fechaVencimiento: '', material: ''
}

function Productos() {
  const {
    productos, productosActivos, stockBajo, proximosVencer,
    loading, crearProducto, actualizarProducto,
    eliminarProducto, obtenerProducto, buscarProductos
  } = useProductos()

  const { categorias } = useCategorias()

  const [busqueda, setBusqueda]   = useState('')
  const [tab, setTab]             = useState('lista')
  const [editando, setEditando]   = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [detalleModal, setDetalleModal] = useState(false)
  const [detalleProducto, setDetalleProducto] = useState(null)
  const [filtro, setFiltro]       = useState('todos')
  const [confirmId, setConfirmId] = useState(null)
  const [mensaje, setMensaje]     = useState('')
  const [mensajeTipo, setMensajeTipo] = useState('success')
  const [loadingOp, setLoadingOp] = useState(false)
  const [detalleLoading, setDetalleLoading] = useState(false)

  // ── Filtros ──────────────────────────────────────────
  const listaFiltrada = (() => {
    let lista = busqueda ? buscarProductos(busqueda) : productosActivos
    if (filtro === 'stockBajo')       lista = lista.filter(p => stockBajo.find(s => s.id === p.id))
    if (filtro === 'proximosVencer')  lista = lista.filter(p => proximosVencer.find(v => v.id === p.id))
    return lista
  })()

  // ── Handlers ─────────────────────────────────────────
  const abrirCrear = () => { setForm(EMPTY); setEditando(null); setMensaje(''); setTab('nuevo') }

  const abrirEditar = (p) => {
    setMensaje('')
    setForm({
      nombre: p.nombre, descripcion: p.descripcion ?? '',
      precio: p.precio,
      stock: p.stock, stockMinimo: p.stockMinimo ?? '',
      categoriaId: p.categoriaId ?? '',
      fechaVencimiento: p.fechaVencimiento?.slice(0, 10) ?? '',
      material: p.material ?? ''
    })
    setEditando(p.id)
    setTab('editar')
  }

  const cerrarFormulario = (clearMessage = true) => {
    setEditando(null)
    setForm(EMPTY)
    setTab('lista')
    if (clearMessage) setMensaje('')
  }

  // Auto-limpia mensaje
  useEffect(() => {
    if (!mensaje) return
    const t = setTimeout(() => setMensaje(''), 3000)
    return () => clearTimeout(t)
  }, [mensaje])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
    setLoadingOp(true)

    const data = {
      ...form,
      precio: parseFloat(form.precio),
      stock:  parseInt(form.stock),
      stockMinimo: parseInt(form.stockMinimo || 0),
      categoriaId: form.categoriaId ? parseInt(form.categoriaId) : null,
      fechaVencimiento: form.fechaVencimiento || null,
      material: form.material || null
    }

    try {
      const resultado = editando
        ? await actualizarProducto({ id: editando, ...data })
        : await crearProducto(data)

      if (!resultado.ok) {
        setMensajeTipo('error')
        setMensaje(resultado.message || 'No se pudo guardar el producto.')
        return
      }

      setMensajeTipo('success')
      setMensaje(editando ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.')
      cerrarFormulario(false)
    } finally {
      setLoadingOp(false)
    }
  }

  const renderFormulario = (onSubmit) => (
    <form onSubmit={onSubmit} className="form-container">
      <div className="form-grid">
        <div className="form-group">
          <label>Nombre *</label>
          <input required value={form.nombre}
            onChange={e => setForm({...form, nombre: e.target.value})}
            placeholder="Nombre del producto" />
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
          <label>Material</label>
          <input type="text" value={form.material}
            onChange={e => setForm({...form, material: e.target.value})}
            placeholder="Material del producto" />
        </div>

        <div className="form-group">
          <label>Precio *</label>
          <input required type="number" step="0.01" min="0"
            value={form.precio}
            onChange={e => setForm({...form, precio: e.target.value})}
            placeholder="0.00" />
        </div>

        

        <div className="form-group">
          <label>Stock actual *</label>
          <input required type="number" min="0"
            value={form.stock}
            onChange={e => setForm({...form, stock: e.target.value})}
            placeholder="0" />
        </div>

        <div className="form-group">
          <label>Stock mínimo</label>
          <input type="number" min="0"
            value={form.stockMinimo}
            onChange={e => setForm({...form, stockMinimo: e.target.value})}
            placeholder="0" />
        </div>

        <div className="form-group">
          <label>Fecha de vencimiento</label>
          <input type="date" value={form.fechaVencimiento}
            onChange={e => setForm({...form, fechaVencimiento: e.target.value})} />
        </div>

        <div className="form-group full-width">
          <label>Descripción</label>
          <textarea rows={3} value={form.descripcion}
            onChange={e => setForm({...form, descripcion: e.target.value})}
            placeholder="Descripción del producto..." />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={cerrarFormulario}>✖ Cancelar</button>
        <button type="submit" className="btn-primary" disabled={loadingOp}>
          {loadingOp ? 'Guardando...' : editando ? '✏️ Actualizar producto' : '✅ Registrar producto'}
        </button>
      </div>

      {mensaje && (
        <p className={mensajeTipo === 'success' ? 'message-success' : 'message-error'}>{mensaje}</p>
      )}
    </form>
  )

  const handleEliminar = async (id) => {
    if (!id) return
    const resultado = await eliminarProducto(id)
    if (!resultado.ok) {
      setMensaje(resultado.message || 'No se pudo eliminar el producto.')
      setConfirmId(null)
      return
    }
    setMensaje('Producto eliminado correctamente.')
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
        <button className="btn-primary" onClick={abrirCrear}>➕ Nuevo producto</button>
      </div>

      {mensaje && !['nuevo','editar'].includes(tab) && (
        <div className="message-success-banner">✅ {mensaje}</div>
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

      {/* Tabla (solo en vista lista) */}
      {tab === 'lista' && (
        listaFiltrada.length === 0
        ? <p className="empty-msg">No se encontraron productos.</p>
        : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  
                  <th>Stock</th>
                  <th>Vence</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map(p => (
                  <tr key={p.id} className={stockBajo.find(s=>s.id===p.id) ? 'row-warning' : ''}>
                    <td><strong>{p.nombre}</strong><br/><small>{p.descripcion}</small></td>
                    <td>{categorias.find(c => c.id === p.categoriaId)?.nombre ?? p.categoria_nombre ?? '—'}</td>
                    <td>₡{parseFloat(p.precio).toLocaleString('es-CR')}</td>
                    
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
                    <td className="action-buttons">
                      <button
                        className="btn-icon"
                        title="Ver detalle"
                        aria-label="Ver detalle"
                        onClick={async () => {
                          setDetalleLoading(true)
                          const resultado = await obtenerProducto(p.id)
                          setDetalleLoading(false)
                          setDetalleProducto(resultado.ok ? resultado.data : p)
                          setDetalleModal(true)
                        }}
                      >
                        👁️
                      </button>
                      <button
                        className="btn-edit"
                        title="Editar producto"
                        aria-label="Editar producto"
                        onClick={() => abrirEditar(p)}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        className="btn-edit btn-danger"
                        title="Eliminar producto"
                        aria-label="Eliminar producto"
                        onClick={() => setConfirmId(p.id)}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Formulario Crear / Editar (igual que Clientes) */}
      {tab !== 'lista' && (
        <div className="form-section scrollable-form">
          <h2>{editando ? `✏️ Editar Producto — ${form.nombre || ''}` : '➕ Registrar Nuevo Producto'}</h2>
          {renderFormulario(handleSubmit)}
        </div>
      )}

      {/* Modal Detalle (solo lectura) - modal-card compacto */}
      {detalleModal && (
        <div className="modal-overlay" onClick={() => setDetalleModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">ℹ️</div>
            <h3>Detalle del producto</h3>
            {detalleLoading ? (
              <p className="message-success">Cargando detalle...</p>
            ) : detalleProducto ? (
              <div className="modal-detail-grid">
              <div className="form-group">
                <label>Nombre</label>
                <div className="readonly-field">{detalleProducto.nombre}</div>
              </div>
              <div className="form-group">
                <label>Precio</label>
                <div className="readonly-field">₡{parseFloat(detalleProducto.precio).toLocaleString('es-CR')}</div>
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <div className="readonly-field">
                  {detalleProducto.categoria_nombre ?? categorias.find(c => c.id == detalleProducto.categoriaId)?.nombre ?? '—'}
                </div>
              </div>
              <div className="form-group">
                <label>Stock</label>
                <div className="readonly-field">{detalleProducto.stock}</div>
              </div>
              <div className="form-group">
                <label>Fecha de vencimiento</label>
                <div className="readonly-field">
                  {detalleProducto.fechaVencimiento
                    ? new Date(detalleProducto.fechaVencimiento).toLocaleDateString('es-CR')
                    : '—'}
                </div>
              </div>
              <div className="form-group full-width">
                <label>Material</label>
                <div className="readonly-field">{detalleProducto.material ?? '—'}</div>
              </div>
              <div className="form-group full-width">
                <label>Descripción</label>
                <div className="readonly-field description-field">{detalleProducto.descripcion || '—'}</div>
              </div>
              </div>
            ) : (
              <p className="message-error">No se pudo cargar el detalle del producto.</p>
            )}
            <div className="modal-actions modal-actions-small">
              <button className="btn-secondary" onClick={() => setDetalleModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminar (igual que Clientes) */}
      {confirmId && (() => {
        const producto = productos.find(p => p.id === confirmId)
        return (
          <div className="modal-overlay" onClick={() => setConfirmId(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">⚠️</div>
              <h3>¿Eliminar producto?</h3>
              <p>
                Estás a punto de desactivar a <strong>{producto ? producto.nombre : ''}</strong>.
                <br />Esta acción no se puede deshacer.
              </p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setConfirmId(null)}>Cancelar</button>
                <button className="btn-danger" onClick={() => handleEliminar(confirmId)}>Sí, eliminar</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default Productos
