import { useState, useEffect } from 'react'
import { useCategorias } from '../hooks/useCategorias'

function TagIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  )
}

function PencilIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .622.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

function TrashIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

const EMPTY = { nombre: '', descripcion: '', estado: 'activo' }

function Categorias() {
  const {
    categorias, categoriasActivas,
    loading, crearCategoria, actualizarCategoria, eliminarCategoria
  } = useCategorias()

  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirmCategoria, setConfirmCategoria] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todas') // todas | activas | inactivas
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // Autolimpia el mensaje después de unos segundos
  useEffect(() => {
    if (!mensaje) return
    const timer = setTimeout(() => setMensaje(''), 3000)
    return () => clearTimeout(timer)
  }, [mensaje])

  const base = filtroEstado === 'activas' ? categoriasActivas : categorias

  const lista = base.filter((c) => {
    const coincideBusqueda =
      !busqueda ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.descripcion ?? '').toLowerCase().includes(busqueda.toLowerCase())

    const coincideEstado =
      filtroEstado !== 'inactivas' || c.estado === 'inactivo'

    return coincideBusqueda && coincideEstado
  })

  const abrirCrear = () => {
    setForm(EMPTY)
    setEditando(null)
    setMensaje('')
    setModal(true)
  }

  const abrirEditar = (c) => {
    setForm({
      nombre: c.nombre,
      descripcion: c.descripcion ?? '',
      estado: c.estado ?? 'activo',
    })
    setEditando(c.id)
    setMensaje('')
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const resultado = editando
        ? await actualizarCategoria({ id: editando, ...form })
        : await crearCategoria(form)

      if (!resultado.ok) {
        setMensaje(resultado.message || 'No se pudo guardar la categoría.')
        return
      }

      setMensaje(editando ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.')
      setModal(false)
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async () => {
    if (!confirmCategoria) return
    const resultado = await eliminarCategoria(confirmCategoria.id)
    if (!resultado.ok) {
      setMensaje(resultado.message || 'No se pudo desactivar la categoría.')
      setConfirmCategoria(null)
      return
    }
    setMensaje('Categoría desactivada correctamente.')
    setConfirmCategoria(null)
  }

  if (loading) return <div className="page-loading">Cargando categorías…</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🗂️ Categorías</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={abrirCrear}>
            + Nueva categoría
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="message-success-banner">✅ {mensaje}</div>
      )}

      <div className="list-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button
              type="button"
              className="search-bar-clear"
              onClick={() => setBusqueda('')}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filtros">
          <button
            type="button"
            className={`btn-filtro ${filtroEstado === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('todas')}
          >
            Todas
          </button>
          <button
            type="button"
            className={`btn-filtro ${filtroEstado === 'activas' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('activas')}
          >
            Activas
          </button>
          <button
            type="button"
            className={`btn-filtro ${filtroEstado === 'inactivas' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('inactivas')}
          >
            Inactivas
          </button>
        </div>

        {lista.length === 0 ? (
          <p className="empty-state">No se encontraron categorías.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c, index) => (
                <tr key={c.id}>
                  <td>{index + 1}</td>
                  <td>
                    <span className="categoria-nombre">
                      <TagIcon width={15} height={15} />
                      {c.nombre}
                    </span>
                  </td>
                  <td>{c.descripcion || '—'}</td>
                  <td>
                    <span className={`pill ${c.estado === 'activo' ? 'pill-si' : 'pill-no'}`}>
                      {c.estado === 'activo' ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => abrirEditar(c)}
                      aria-label="Editar categoría"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => setConfirmCategoria(c)}
                      aria-label="Eliminar categoría"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Cápsulas Vegetales"
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción opcional..."
                />
              </div>

              {/* Solo tiene sentido cambiar el estado al editar; al crear siempre nace activa */}
              {editando && (
                <div className="form-group">
                  <label>Estado</label>
                  <div className="estado-toggle">
                    <button
                      type="button"
                      className={`estado-toggle-btn ${form.estado === 'activo' ? 'active-si' : ''}`}
                      onClick={() => setForm({ ...form, estado: 'activo' })}
                    >
                      Activa
                    </button>
                    <button
                      type="button"
                      className={`estado-toggle-btn ${form.estado === 'inactivo' ? 'active-no' : ''}`}
                      onClick={() => setForm({ ...form, estado: 'inactivo' })}
                    >
                      Inactiva
                    </button>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={guardando}>
                  {guardando
                    ? 'Guardando...'
                    : editando ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmCategoria && (
        <div className="modal-overlay" onClick={() => setConfirmCategoria(null)}>
          <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-confirm-icon">
              <TrashIcon width={26} height={26} />
            </div>
            <h3>¿Eliminar categoría?</h3>
            <p>
              Estás a punto de desactivar{' '}
              <span className="modal-confirm-name">{confirmCategoria.nombre}</span>.
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirmCategoria(null)}>
                Cancelar
              </button>
              <button className="btn-confirm-danger" onClick={handleEliminar}>
                <TrashIcon width={15} height={15} />
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categorias