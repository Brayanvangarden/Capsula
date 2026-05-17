import { useState } from 'react'
import { useUsuarios } from '../hooks/useUsuarios'

const EMPTY = {
  nombre: '',
  usuario: '',
  password: '',
  rol: 'vendedor',
  estado: 'activo',
}

function Usuarios() {
  const {
    usuarios,
    admins,
    vendedores,
    activos,
    loading,
    error,
    fetchUsuarios,
    crearUsuario,
    actualizarUsuario,
    cambiarPassword,
    toggleEstado,
  } = useUsuarios()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [passwordState, setPasswordState] = useState({ abierto: false, id: null, password: '' })
  const [mensaje, setMensaje] = useState('')

  const abrirCrear = () => {
    setEditandoId(null)
    setForm(EMPTY)
    setMensaje('')
    setModalAbierto(true)
  }

  const abrirEditar = (usuario) => {
    setEditandoId(usuario.id)
    setForm({
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      password: '',
      rol: usuario.rol,
      estado: usuario.estado,
    })
    setMensaje('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEditandoId(null)
    setForm(EMPTY)
    setMensaje('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMensaje('')

    if (!form.nombre.trim() || !form.usuario.trim() || !form.rol) {
      setMensaje('Completa nombre, usuario y rol.')
      return
    }

    if (editandoId) {
      const resultado = await actualizarUsuario({
        id: editandoId,
        nombre: form.nombre.trim(),
        usuario: form.usuario.trim(),
        rol: form.rol,
        estado: form.estado,
      })

      if (!resultado.ok) {
        setMensaje(resultado.message || 'No se pudo actualizar el usuario.')
        return
      }

      setMensaje('Usuario actualizado correctamente.')
      cerrarModal()
      return
    }

    if (!form.password.trim()) {
      setMensaje('Ingresa una contraseña para el nuevo usuario.')
      return
    }

    const resultado = await crearUsuario({
      nombre: form.nombre.trim(),
      usuario: form.usuario.trim(),
      password: form.password,
      rol: form.rol,
      estado: form.estado,
    })

    if (!resultado.ok) {
      setMensaje(resultado.message || 'No se pudo crear el usuario.')
      return
    }

    setMensaje('Usuario creado correctamente.')
    cerrarModal()
  }

  const abrirCambioPassword = (usuarioId) => {
    setPasswordState({ abierto: true, id: usuarioId, password: '' })
    setMensaje('')
  }

  const cerrarPasswordModal = () => {
    setPasswordState({ abierto: false, id: null, password: '' })
    setMensaje('')
  }

  const handleCambioPassword = async (event) => {
    event.preventDefault()
    setMensaje('')

    if (!passwordState.password.trim() || passwordState.password.length < 4) {
      setMensaje('Ingresa una contraseña válida (mínimo 4 caracteres).')
      return
    }

    const resultado = await cambiarPassword(passwordState.id, passwordState.password)
    if (!resultado.ok) {
      setMensaje(resultado.message || 'No se pudo cambiar la contraseña.')
      return
    }

    setMensaje('Contraseña actualizada correctamente.')
    cerrarPasswordModal()
  }

  const handleToggleEstado = async (usuarioId) => {
    const resultado = await toggleEstado(usuarioId)
    if (!resultado.ok) {
      setMensaje(resultado.message || 'No se pudo cambiar el estado del usuario.')
      return
    }

    setMensaje(`Usuario ${resultado.data.estado} correctamente.`)
  }

  if (loading) {
    return <div className="page-loading">Cargando usuarios…</div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>👥 Usuarios</h1>
          <p>{usuarios.length} usuarios registrados</p>
        </div>
        <button className="btn-primary" type="button" onClick={abrirCrear}>
          + Nuevo usuario
        </button>
      </div>

      <div className="alertas-row">
        <div className="card-card">
          <strong>{usuarios.length}</strong>
          <p>Total de usuarios</p>
        </div>
        <div className="card-card">
          <strong>{admins.length}</strong>
          <p>Administradores</p>
        </div>
        <div className="card-card">
          <strong>{vendedores.length}</strong>
          <p>Vendedores</p>
        </div>
        <div className="card-card">
          <strong>{activos.length}</strong>
          <p>Activos</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.usuario}</td>
                <td>{usuario.rol}</td>
                <td>
                  <span className={`badge badge-${usuario.estado === 'activo' ? 'success' : 'danger'}`}>
                    {usuario.estado}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn-secondary" type="button" onClick={() => abrirEditar(usuario)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => abrirCambioPassword(usuario.id)}>
                    🔑 Contraseña
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => handleToggleEstado(usuario.id)}>
                    {usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editandoId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <button className="modal-close" type="button" onClick={cerrarModal}>
                ✕
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Usuario *</label>
                <input
                  value={form.usuario}
                  onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                  required
                />
              </div>

              {!editandoId && (
                <div className="form-group">
                  <label>Contraseña *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <option value="admin">admin</option>
                  <option value="vendedor">vendedor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  <option value="activo">activo</option>
                  <option value="inactivo">inactivo</option>
                </select>
              </div>

              {mensaje && <p className="message-success">{mensaje}</p>}

              <div className="modal-footer">
                <button className="btn-secondary" type="button" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button className="btn-primary" type="submit">
                  {editandoId ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordState.abierto && (
        <div className="modal-overlay" onClick={cerrarPasswordModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar contraseña</h2>
              <button className="modal-close" type="button" onClick={cerrarPasswordModal}>
                ✕
              </button>
            </div>
            <form className="modal-form" onSubmit={handleCambioPassword}>
              <div className="form-group">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={passwordState.password}
                  onChange={(e) => setPasswordState({ ...passwordState, password: e.target.value })}
                  required
                />
              </div>
              {mensaje && <p className="message-success">{mensaje}</p>}
              <div className="modal-footer">
                <button className="btn-secondary" type="button" onClick={cerrarPasswordModal}>
                  Cancelar
                </button>
                <button className="btn-primary" type="submit">
                  Guardar contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios
