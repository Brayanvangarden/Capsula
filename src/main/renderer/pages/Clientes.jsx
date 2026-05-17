// src/main/renderer/pages/Clientes.jsx
import { useState, useEffect } from 'react'

const { ipcRenderer } = window.require('electron')

function Clientes() {
  // ─── Estado principal ───────────────────────────────────────
  const [tab, setTab]           = useState('lista')      // 'lista' | 'nuevo' | 'editar'
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loadingOp, setLoadingOp] = useState(false)
  const [clienteEdit, setClienteEdit] = useState(null)

  const formVacio = {
    nombre:    '',
    apellido:  '',
    cedula:    '',
    telefono:  '',
    correo:    '',
    direccion: '',
    notas:     '',
  }

  const [formS, setFormS] = useState(formVacio)

  // ─── Cargar clientes al montar ───────────────────────────────
  useEffect(() => {
    cargarClientes()
  }, [])

  // ─── IPC: obtener todos los clientes ────────────────────────
  const cargarClientes = async () => {
    try {
      const resultado = await ipcRenderer.invoke('clientes:getAll')
      setClientes(resultado || [])
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }

  // ─── IPC: crear cliente ─────────────────────────────────────
  const handleCrear = async (e) => {
    e.preventDefault()
    setLoadingOp(true)
    try {
      await ipcRenderer.invoke('clientes:create', formS)
      setFormS(formVacio)
      setTab('lista')
      await cargarClientes()
    } catch (error) {
      console.error('Error al crear cliente:', error)
    } finally {
      setLoadingOp(false)
    }
  }

  // ─── IPC: actualizar cliente ────────────────────────────────
  const handleActualizar = async (e) => {
    e.preventDefault()
    setLoadingOp(true)
    try {
      await ipcRenderer.invoke('clientes:update', { ...formS, id: clienteEdit.id })
      setFormS(formVacio)
      setClienteEdit(null)
      setTab('lista')
      await cargarClientes()
    } catch (error) {
      console.error('Error al actualizar cliente:', error)
    } finally {
      setLoadingOp(false)
    }
  }

  // ─── IPC: eliminar cliente ──────────────────────────────────
  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este cliente?')
    if (!confirmar) return
    try {
      await ipcRenderer.invoke('clientes:delete', id)
      await cargarClientes()
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
    }
  }

  // ─── Abrir formulario de edición ────────────────────────────
  const abrirEditar = (cliente) => {
    setClienteEdit(cliente)
    setFormS({
      nombre:    cliente.nombre,
      apellido:  cliente.apellido,
      cedula:    cliente.cedula,
      telefono:  cliente.telefono,
      correo:    cliente.correo,
      direccion: cliente.direccion,
      notas:     cliente.notas,
    })
    setTab('editar')
  }

  // ─── Filtro de búsqueda ─────────────────────────────────────
  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.apellido} ${c.cedula} ${c.correo}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  // ─── Formulario reutilizable (crear / editar) ────────────────
  const renderFormulario = (onSubmit) => (
    <form onSubmit={onSubmit} className="form-container">
      <div className="form-grid">

        <div className="form-group">
          <label>Nombre *</label>
          <input
            type="text"
            value={formS.nombre}
            onChange={(e) => setFormS({ ...formS, nombre: e.target.value })}
            placeholder="Nombre del cliente"
            required
          />
        </div>

        <div className="form-group">
          <label>Apellido *</label>
          <input
            type="text"
            value={formS.apellido}
            onChange={(e) => setFormS({ ...formS, apellido: e.target.value })}
            placeholder="Apellido del cliente"
            required
          />
        </div>

        <div className="form-group">
          <label>Cédula / ID</label>
          <input
            type="text"
            value={formS.cedula}
            onChange={(e) => setFormS({ ...formS, cedula: e.target.value })}
            placeholder="Número de identificación"
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            value={formS.telefono}
            onChange={(e) => setFormS({ ...formS, telefono: e.target.value })}
            placeholder="Ej: 8888-8888"
          />
        </div>

        <div className="form-group">
          <label>Correo Electrónico</label>
          <input
            type="email"
            value={formS.correo}
            onChange={(e) => setFormS({ ...formS, correo: e.target.value })}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            value={formS.direccion}
            onChange={(e) => setFormS({ ...formS, direccion: e.target.value })}
            placeholder="Dirección del cliente"
          />
        </div>

        <div className="form-group full-width">
          <label>Notas</label>
          <textarea
            rows={3}
            value={formS.notas}
            onChange={(e) => setFormS({ ...formS, notas: e.target.value })}
            placeholder="Observaciones o información adicional..."
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => { setTab('lista'); setFormS(formVacio); setClienteEdit(null) }}
        >
          ✖ Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loadingOp}
        >
          {loadingOp
            ? 'Guardando...'
            : tab === 'editar' ? '✏️ Actualizar cliente' : '✅ Registrar cliente'}
        </button>
      </div>
    </form>
  )

  // ─── RENDER ─────────────────────────────────────────────────
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👥 Gestión de Clientes</h1>
        <div className="header-actions">
          {tab === 'lista' && (
            <button
              className="btn-primary"
              onClick={() => { setFormS(formVacio); setTab('nuevo') }}
            >
              ➕ Nuevo Cliente
            </button>
          )}
        </div>
      </div>

      {/* ── TAB: LISTA ── */}
      {tab === 'lista' && (
        <div className="list-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, cédula o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {clientesFiltrados.length === 0 ? (
            <p className="empty-state">No se encontraron clientes registrados.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente, index) => (
                  <tr key={cliente.id}>
                    <td>{index + 1}</td>
                    <td>{cliente.nombre} {cliente.apellido}</td>
                    <td>{cliente.cedula || '—'}</td>
                    <td>{cliente.telefono || '—'}</td>
                    <td>{cliente.correo || '—'}</td>
                    <td className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => abrirEditar(cliente)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleEliminar(cliente.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB: NUEVO CLIENTE ── */}
      {tab === 'nuevo' && (
        <div className="form-section">
          <h2>➕ Registrar Nuevo Cliente</h2>
          {renderFormulario(handleCrear)}
        </div>
      )}

      {/* ── TAB: EDITAR CLIENTE ── */}
      {tab === 'editar' && (
        <div className="form-section">
          <h2>✏️ Editar Cliente — {clienteEdit?.nombre} {clienteEdit?.apellido}</h2>
          {renderFormulario(handleActualizar)}
        </div>
      )}
    </div>
  )
}

export default Clientes
