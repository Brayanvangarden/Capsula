import { useState } from 'react'
import { useCategorias } from '../hooks/useCategorias'

const EMPTY = { nombre: '', descripcion: '' }

function Categorias() {
  const {
    categorias, categoriasActivas,
    loading, crearCategoria, actualizarCategoria, eliminarCategoria
  } = useCategorias()

  const [modal, setModal]         = useState(false)
  const [editando, setEditando]   = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [confirmId, setConfirmId] = useState(null)
  const [soloActivas, setSoloActivas] = useState(false)

  const lista = soloActivas ? categoriasActivas : categorias

  const abrirCrear = () => { setForm(EMPTY); setEditando(null); setModal(true) }

  const abrirEditar = (c) => {
    setForm({ nombre: c.nombre, descripcion: c.descripcion ?? '' })
    setEditando(c.id)
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editando) await actualizarCategoria(editando, form)
    else          await crearCategoria(form)
    setModal(false)
  }

  if (loading) return <div className="page-loading">Cargando categorías…</div>

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>🗂️ Categoría

          </h1>
          <p>{categorias.length} categorías registradas</p>
        </div>
        <button className="btn-primary" onClick={abrirCrear}>+ Nueva categoría</button>
      </div>

      <div className="toolbar">
        <label className="toggle-label">
          <input type="checkbox" checked={soloActivas}
            onChange={e => setSoloActivas(e.target.checked)} />
          &nbsp; Solo activas
        </label>
      </div>

      {lista.length === 0
        ? <p className="empty-msg">No hay categorías aún.</p>
        : (
          <div className="cards-grid">
            {lista.map(c => (
              <div key={c.id} className="category-card">
                <div className="category-card-body">
                  <h3>{c.nombre}</h3>
                  <p>{c.descripcion || 'Sin descripción'}</p>
                  <span className={`badge ${c.activa ? 'badge-success' : 'badge-muted'}`}>
                    {c.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="category-card-actions">
                  <button className="btn-icon" onClick={() => abrirEditar(c)}>✏️</button>
                  <button className="btn-icon btn-danger" onClick={() => setConfirmId(c.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre *</label>
                <input required value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea rows={3} value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editando ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmId && (
        <div className="modal-overlay" onClick={() => setConfirmId(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar categoría?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setConfirmId(null)}>Cancelar</button>
              <button className="btn-danger"
                onClick={async () => { await eliminarCategoria(confirmId); setConfirmId(null) }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categorias
