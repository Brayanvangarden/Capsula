import { useClientes } from "../hooks/useClientes";
import { useState, useEffect } from "react";

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
  );
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
  );
}
const EMPTY_FORM = {
  nombre: "",
  apellido: "",
  cedula: "",
  telefono: "",
  correo: "",
  direccion: "",
  notas: "",
};

function Clientes() {
  const {
    clientes,
    loading,
    error,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,
  } = useClientes();

  const [tab, setTab] = useState("lista");
  const [form, setForm] = useState(EMPTY_FORM);
  const [clienteEdit, setClienteEdit] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [loadingOp, setLoadingOp] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [clienteToDelete, setClienteToDelete] = useState(null);

  const clientesFiltrados = buscarClientes(busqueda);

  const abrirNuevo = () => {
    setClienteEdit(null);
    setForm(EMPTY_FORM);
    setMensaje("");
    setTab("nuevo");
  };

  const abrirEditar = (cliente) => {
    setClienteEdit(cliente);
    setForm({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      cedula: cliente.cedula || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || "",
      direccion: cliente.direccion || "",
      notas: cliente.notas || "",
    });
    setMensaje("");
    setTab("editar");
  };

  const cerrarFormulario = () => {
    setClienteEdit(null);
    setForm(EMPTY_FORM);
    setTab("lista");
  };

  // Autolimpia el mensaje de éxito/error después de unos segundos
  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => setMensaje(""), 3000);
    return () => clearTimeout(timer);
  }, [mensaje]);
  const handleCrear = async (event) => {
    event.preventDefault();
    setMensaje("");
    setLoadingOp(true);
    try {
      const resultado = await crearCliente(form);
      if (!resultado.ok) {
        setMensaje(resultado.message || "No se pudo crear el cliente.");
        return;
      }
      setMensaje("Cliente creado correctamente.");
      cerrarFormulario();
    } finally {
      setLoadingOp(false);
    }
  };

  const handleActualizar = async (event) => {
    event.preventDefault();
    setMensaje("");
    setLoadingOp(true);
    try {
      const resultado = await actualizarCliente({
        id: clienteEdit.id,
        ...form,
      });
      if (!resultado.ok) {
        setMensaje(resultado.message || "No se pudo actualizar el cliente.");
        return;
      }
      setMensaje("Cliente actualizado correctamente.");
      cerrarFormulario();
    } finally {
      setLoadingOp(false);
    }
  };

  const handleEliminar = async () => {
    if (!clienteToDelete) return;

    const resultado = await eliminarCliente(clienteToDelete.id);
    if (!resultado.ok) {
      setMensaje(resultado.message || "No se pudo eliminar el cliente.");
      setClienteToDelete(null);
      return;
    }

    setMensaje("Cliente eliminado correctamente.");
    setClienteToDelete(null);
  };

  const renderFormulario = (onSubmit) => (
    <form onSubmit={onSubmit} className="form-container">
      <div className="form-grid">
        <div className="form-group">
          <label>Nombre *</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Nombre del cliente"
            required
          />
        </div>

        <div className="form-group">
          <label>Apellido *</label>
          <input
            type="text"
            value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            placeholder="Apellido del cliente"
            required
          />
        </div>

        <div className="form-group">
          <label>Cédula / ID</label>
          <input
            type="text"
            value={form.cedula}
            onChange={(e) => setForm({ ...form, cedula: e.target.value })}
            placeholder="Número de identificación"
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="Ej: 8888-8888"
          />
        </div>

        <div className="form-group">
          <label>Correo Electrónico</label>
          <input
            type="email"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            placeholder="Dirección del cliente"
          />
        </div>

        <div className="form-group full-width">
          <label>Notas</label>
          <textarea
            rows={3}
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            placeholder="Observaciones o información adicional..."
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={cerrarFormulario}
        >
          ✖ Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loadingOp}>
          {loadingOp
            ? "Guardando..."
            : tab === "editar"
              ? "✏️ Actualizar cliente"
              : "✅ Registrar cliente"}
        </button>
      </div>

      {mensaje && ["nuevo", "editar"].includes(tab) && (
        <p className="message-success">{mensaje}</p>
      )}
    </form>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👥 Gestión de Clientes</h1>
        <div className="header-actions">
          {tab === "lista" && (
            <button className="btn-primary" onClick={abrirNuevo}>
              ➕ Nuevo Cliente
            </button>
          )}
        </div>
      </div>

      {error && <p className="message-error">{error}</p>}

      {mensaje && !["nuevo", "editar"].includes(tab) && (
        <div className="message-success-banner">✅ {mensaje}</div>
      )}

      {tab === "lista" && (
        <div className="list-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                type="button"
                className="search-bar-clear"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {clientesFiltrados.length === 0 ? (
            <p className="empty-state">
              No se encontraron clientes registrados.
            </p>
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
                    <td>
                      {cliente.nombre} {cliente.apellido}
                    </td>
                    <td>{(cliente.cedula ?? "").toString().trim() || "—"}</td>
                    <td>{cliente.telefono || "—"}</td>
                    <td>{cliente.correo || "—"}</td>
                    <td className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => abrirEditar(cliente)}
                        aria-label="Editar cliente"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => setClienteToDelete(cliente)}
                        aria-label="Eliminar cliente"
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
      )}

      {clienteToDelete && (
        <div className="modal-overlay" onClick={() => setClienteToDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3>¿Eliminar cliente?</h3>
            <p>
              Estás a punto de desactivar a{" "}
              <strong>
                {clienteToDelete.nombre} {clienteToDelete.apellido}
              </strong>
              .
              <br />
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setClienteToDelete(null)}
              >
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleEliminar}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "nuevo" && (
        <div className="form-section scrollable-form">
          <h2>➕ Registrar Nuevo Cliente</h2>
          {renderFormulario(handleCrear)}
        </div>
      )}

      {tab === "editar" && (
        <div className="form-section scrollable-form">
          <h2>
            ✏️ Editar Cliente — {clienteEdit?.nombre} {clienteEdit?.apellido}
          </h2>
          {renderFormulario(handleActualizar)}
        </div>
      )}
    </div>
  );
}

export default Clientes;
