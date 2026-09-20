import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUsuarios } from "../hooks/useUsuarios";

function Icon({ children, ...props }) {
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
      {children}
    </svg>
  );
}

function PencilIcon() {
  return (
    <Icon>
      <path d="m4 16 10-10 4 4L8 20l-5 1 1-5Z" />
      <path d="m13 7 4 4" />
    </Icon>
  );
}

function KeyIcon() {
  return (
    <Icon>
      <circle cx="7" cy="15" r="4" />
      <path d="M10 15h10" />
      <path d="m15 10 3 3" />
    </Icon>
  );
}

function PowerIcon() {
  return (
    <Icon>
      <path d="M12 3v10" />
      <path d="M7 6.34a8 8 0 1 0 10 0" />
    </Icon>
  );
}

function TrashIcon() {
  return (
    <Icon>
      <path d="M3 6h18" />
      <path d="M19 6v14H5V6" />
      <path d="M8 6V4h8v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Icon>
  );
}

const EMPTY = {
  nombre: "",
  usuario: "",
  password: "",
  rol: "vendedor",
  estado: "activo",
};

const USUARIOS_POR_PAGINA = 10;

function Usuarios() {
  const { user } = useAuth();
  const {
    usuarios,
    admins,
    vendedores,
    activos,
    loading,
    error,
    crearUsuario,
    actualizarUsuario,
    cambiarPassword,
    toggleEstado,
    eliminarUsuario,
  } = useUsuarios();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [passwordState, setPasswordState] = useState({
    abierto: false,
    id: null,
    password: "",
  });
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto =
      `${usuario.nombre} ${usuario.usuario} ${usuario.rol} ${usuario.estado}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });
  const totalPaginas = Math.max(
    1,
    Math.ceil(usuariosFiltrados.length / USUARIOS_POR_PAGINA),
  );
  const paginaActual = Math.min(pagina, totalPaginas);
  const usuariosVisibles = usuariosFiltrados.slice(
    (paginaActual - 1) * USUARIOS_POR_PAGINA,
    paginaActual * USUARIOS_POR_PAGINA,
  );

  useEffect(() => {
    if (!mensaje) return undefined;
    const timer = setTimeout(() => setMensaje(""), 3000);
    return () => clearTimeout(timer);
  }, [mensaje]);

  useEffect(() => setPagina(1), [busqueda]);
  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  const abrirCrear = () => {
    setEditandoId(null);
    setForm(EMPTY);
    setMensaje("");
    setModalAbierto(true);
  };

  const abrirEditar = (usuario) => {
    setEditandoId(usuario.id);
    setForm({
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      password: "",
      rol: usuario.rol,
      estado: usuario.estado,
    });
    setMensaje("");
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(EMPTY);
    setMensaje("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje("");
    if (!form.nombre.trim() || !form.usuario.trim() || !form.rol) {
      setMensaje("Completa nombre, usuario y rol.");
      return;
    }

    const datos = {
      nombre: form.nombre.trim(),
      usuario: form.usuario.trim(),
      rol: form.rol,
      estado: form.estado,
    };
    const resultado = editandoId
      ? await actualizarUsuario({ id: editandoId, ...datos })
      : form.password.trim()
        ? await crearUsuario({ ...datos, password: form.password })
        : {
            ok: false,
            message: "Ingresa una contrasena para el nuevo usuario.",
          };

    if (!resultado.ok) {
      setMensaje(resultado.message || "No se pudo guardar el usuario.");
      return;
    }
    setMensaje(
      editandoId
        ? "Usuario actualizado correctamente."
        : "Usuario creado correctamente.",
    );
    cerrarModal();
  };

  const abrirCambioPassword = (id) => {
    setPasswordState({ abierto: true, id, password: "" });
    setMensaje("");
  };

  const cerrarPasswordModal = () =>
    setPasswordState({ abierto: false, id: null, password: "" });

  const handleCambioPassword = async (event) => {
    event.preventDefault();
    if (!passwordState.password.trim() || passwordState.password.length < 4) {
      setMensaje("Ingresa una contrasena valida (minimo 4 caracteres).");
      return;
    }
    const resultado = await cambiarPassword(
      passwordState.id,
      passwordState.password,
    );
    if (!resultado.ok) {
      setMensaje(resultado.message || "No se pudo cambiar la contrasena.");
      return;
    }
    cerrarPasswordModal();
    setMensaje("Contrasena actualizada correctamente.");
  };

  const handleToggleEstado = async (id) => {
    const resultado = await toggleEstado(id);
    if (!resultado.ok) {
      setMensaje(
        resultado.message || "No se pudo cambiar el estado del usuario.",
      );
      return;
    }
    setMensaje(`Usuario ${resultado.data.estado} correctamente.`);
  };

  const solicitarEliminar = (usuario) => {
    if (usuario.id === user?.id) {
      setMensaje("No puedes eliminar el usuario con el que estas conectado.");
      return;
    }
    setUsuarioAEliminar(usuario);
  };

  const handleEliminar = async () => {
    if (!usuarioAEliminar) return;
    const resultado = await eliminarUsuario(usuarioAEliminar.id);
    setUsuarioAEliminar(null);
    setMensaje(
      resultado.ok
        ? "Usuario eliminado correctamente."
        : resultado.message || "No se pudo eliminar el usuario.",
    );
  };

  if (loading) return <div className="page-loading">Cargando usuarios...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestion de Usuarios</h1>
          <p>Administra accesos, roles y estados de cada cuenta.</p>
        </div>
        <button className="btn-primary" type="button" onClick={abrirCrear}>
          Nuevo usuario
        </button>
      </div>

      {error && <p className="message-error">{error}</p>}
      {mensaje && <div className="message-success-banner">{mensaje}</div>}

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

      <div className="list-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o rol..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
          {busqueda && (
            <button
              type="button"
              className="search-bar-clear"
              onClick={() => setBusqueda("")}
              aria-label="Limpiar busqueda"
            >
              x
            </button>
          )}
        </div>

        {usuariosFiltrados.length === 0 ? (
          <p className="empty-state">
            No se encontraron usuarios con esa busqueda.
          </p>
        ) : (
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
                {usuariosVisibles.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.usuario}</td>
                    <td>{usuario.rol}</td>
                    <td>
                      <span
                        className={`badge ${usuario.estado === "activo" ? "badge-success" : "badge-danger"}`}
                      >
                        {usuario.estado}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        className="btn-edit"
                        type="button"
                        onClick={() => abrirEditar(usuario)}
                        aria-label="Editar usuario"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        className="btn-view"
                        type="button"
                        onClick={() => abrirCambioPassword(usuario.id)}
                        aria-label="Cambiar contrasena"
                      >
                        <KeyIcon />
                      </button>
                      <button
                        className={
                          usuario.estado === "activo"
                            ? "btn-danger"
                            : "btn-view"
                        }
                        type="button"
                        onClick={() => handleToggleEstado(usuario.id)}
                        aria-label="Cambiar estado"
                      >
                        <PowerIcon />
                      </button>
                      <button
                        className="btn-danger"
                        type="button"
                        onClick={() => solicitarEliminar(usuario)}
                        aria-label="Eliminar usuario"
                        title="Eliminar usuario"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPaginas > 1 && (
              <nav className="pagination" aria-label="Paginacion de usuarios">
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </button>
                {Array.from(
                  { length: totalPaginas },
                  (_, index) => index + 1,
                ).map((numero) => (
                  <button
                    key={numero}
                    type="button"
                    className={`pagination-button ${paginaActual === numero ? "active" : ""}`}
                    onClick={() => setPagina(numero)}
                    aria-current={paginaActual === numero ? "page" : undefined}
                  >
                    {numero}
                  </button>
                ))}
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() =>
                    setPagina((actual) => Math.min(totalPaginas, actual + 1))
                  }
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </button>
              </nav>
            )}
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{editandoId ? "Editar usuario" : "Nuevo usuario"}</h2>
              <button
                className="modal-close"
                type="button"
                onClick={cerrarModal}
              >
                x
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={(event) =>
                    setForm({ ...form, nombre: event.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Usuario *</label>
                <input
                  value={form.usuario}
                  onChange={(event) =>
                    setForm({ ...form, usuario: event.target.value })
                  }
                  required
                />
              </div>
              {!editandoId && (
                <div className="form-group">
                  <label>Contrasena *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Rol</label>
                <select
                  value={form.rol}
                  onChange={(event) =>
                    setForm({ ...form, rol: event.target.value })
                  }
                >
                  <option value="admin">admin</option>
                  <option value="vendedor">vendedor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={form.estado}
                  onChange={(event) =>
                    setForm({ ...form, estado: event.target.value })
                  }
                >
                  <option value="activo">activo</option>
                  <option value="inactivo">inactivo</option>
                </select>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button className="btn-primary" type="submit">
                  {editandoId ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordState.abierto && (
        <div className="modal-overlay" onClick={cerrarPasswordModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar contrasena</h2>
              <button
                className="modal-close"
                type="button"
                onClick={cerrarPasswordModal}
              >
                x
              </button>
            </div>
            <form className="modal-form" onSubmit={handleCambioPassword}>
              <div className="form-group">
                <label>Nueva contrasena</label>
                <input
                  type="password"
                  value={passwordState.password}
                  onChange={(event) =>
                    setPasswordState({
                      ...passwordState,
                      password: event.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={cerrarPasswordModal}
                >
                  Cancelar
                </button>
                <button className="btn-primary" type="submit">
                  Guardar contrasena
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {usuarioAEliminar && (
        <div
          className="modal-overlay"
          onClick={() => setUsuarioAEliminar(null)}
        >
          <div
            className="modal-card modal-card-delete"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-icon">!</div>
            <h3>Eliminar usuario?</h3>
            <p>
              Estas a punto de eliminar permanentemente a{" "}
              <strong className="modal-confirm-name">
                {usuarioAEliminar.nombre}
              </strong>
              .<br />
              Esta accion no se puede deshacer.
            </p>
            <div className="modal-actions modal-actions-compact">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => setUsuarioAEliminar(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-secondary btn-delete-modal"
                type="button"
                onClick={handleEliminar}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
