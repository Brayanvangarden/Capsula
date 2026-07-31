import { useClientes } from "../hooks/useClientes";
import { clientesService } from "../services/clientes.service";
import { useState, useEffect, useRef } from "react";

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

function EyeIcon(props) {
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
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
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
function UploadIcon(props) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function DownloadIcon(props) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
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
  tiene_descuento: false,
  descuento_porcentaje: 0,
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
  const [clienteDetalle, setClienteDetalle] = useState(null);
  const [filtroDescuento, setFiltroDescuento] = useState("todos");
  const clientesFiltrados = buscarClientes(busqueda).filter((c) => {
    if (filtroDescuento === "con") return c.tiene_descuento;
    if (filtroDescuento === "sin") return !c.tiene_descuento;
    return true;
  });
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
      tiene_descuento: cliente.tiene_descuento || false,
      descuento_porcentaje: cliente.descuento_porcentaje ?? 0,
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

  const exportarCSV = () => {
    const columnas = [
      "Nombre",
      "Apellido",
      "Empresa",
      "Cédula",
      "Teléfono",
      "Correo",
      "Dirección",
      "Balance pendiente",
      "Tiene descuento",
      "Descuento porcentaje",
      "Estado",
      "Notas",
    ];

    const escapar = (valor) => {
      const texto = String(valor ?? "");
      if (/[";\n]/.test(texto)) {
        return `"${texto.replace(/"/g, '""')}"`;
      }
      return texto;
    };

    const filas = clientesFiltrados.map((c) =>
      [
        c.nombre,
        c.apellido,
        c.empresa,
        c.cedula,
        c.telefono,
        c.correo,
        c.direccion,
        c.balance_pendiente,
        c.tiene_descuento ? "true" : "false",
        c.descuento_porcentaje,
        c.estado,
        c.notas,
      ]
        .map(escapar)
        .join(";"),
    );

    const contenido = "\uFEFF" + [columnas.join(";"), ...filas].join("\r\n");

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const fecha = new Date().toISOString().slice(0, 10);

    const link = document.createElement("a");
    link.href = url;
    link.download = `clientes_${fecha}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const inputImportRef = useRef(null);

  const parsearCSV = (texto) => {
    const limpio = texto.replace(/^\uFEFF/, "");
    const lineas = limpio.split(/\r\n|\n/).filter((l) => l.trim() !== "");
    if (lineas.length < 2) return [];

    const parsearLinea = (linea) => {
      const campos = [];
      let actual = "";
      let entreComillas = false;
      for (let i = 0; i < linea.length; i++) {
        const char = linea[i];
        if (char === '"') {
          if (entreComillas && linea[i + 1] === '"') {
            actual += '"';
            i++;
          } else {
            entreComillas = !entreComillas;
          }
        } else if (char === ";" && !entreComillas) {
          campos.push(actual);
          actual = "";
        } else {
          actual += char;
        }
      }
      campos.push(actual);
      return campos;
    };

    const filas = lineas.slice(1).map((linea) => {
      const [
        nombre,
        apellido,
        empresa,
        cedula,
        telefono,
        correo,
        direccion,
        balance_pendiente,
        tiene_descuento,
        descuento_porcentaje,
        estado,
        notas,
      ] = parsearLinea(linea);
      return {
        nombre,
        apellido,
        empresa,
        cedula,
        telefono,
        correo,
        direccion,
        balance_pendiente,
        tiene_descuento: tiene_descuento === "true",
        descuento_porcentaje,
        estado,
        notas,
      };
    });

    return filas;
  };

  const handleImportarCSV = async (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    setLoadingOp(true);
    setMensaje("");
    try {
      const texto = await archivo.text();
      const filas = parsearCSV(texto);

      if (filas.length === 0) {
        setMensaje("El archivo no tiene datos para importar.");
        return;
      }

      const resultado = await clientesService.importBulk(filas);
      setMensaje(
        `Importación completa: ${resultado.creados} creados, ${resultado.fallidos} fallidos.` +
          (resultado.errores.length ? ` Ver consola para detalles.` : ""),
      );
      if (resultado.errores.length) console.warn(resultado.errores);

      // refresca la lista
      window.location.reload(); // opción simple; ver nota abajo
    } catch (err) {
      setMensaje(err.message || "No se pudo importar el archivo.");
    } finally {
      setLoadingOp(false);
      event.target.value = "";
    }
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

        <div className="form-group full-width descuento-toggle">
          <label className="checkbox-inline" htmlFor="tiene_descuento">
            <input
              id="tiene_descuento"
              type="checkbox"
              checked={form.tiene_descuento}
              onChange={(e) =>
                setForm({ ...form, tiene_descuento: e.target.checked })
              }
            />
            <span>Aplica descuento</span>
          </label>
        </div>

        {form.tiene_descuento && (
          <div className="form-group">
            <label>Porcentaje de descuento (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={form.descuento_porcentaje}
              onChange={(e) =>
                setForm({ ...form, descuento_porcentaje: e.target.value })
              }
              placeholder="Ej: 5"
            />
          </div>
        )}
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
            <>
              <input
                ref={inputImportRef}
                type="file"
                accept=".csv"
                onChange={handleImportarCSV}
                style={{ display: "none" }}
              />
              <button
                className="btn-secondary"
                onClick={() => inputImportRef.current?.click()}
              >
                <UploadIcon /> Importar CSV
              </button>
              <button className="btn-secondary" onClick={exportarCSV}>
                <DownloadIcon /> Exportar CSV
              </button>
              <button className="btn-primary" onClick={abrirNuevo}>
                ➕ Nuevo Cliente
              </button>
            </>
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

          <div className="filtros">
            <button
              type="button"
              className={`btn-filtro ${filtroDescuento === "todos" ? "active" : ""}`}
              onClick={() => setFiltroDescuento("todos")}
            >
              Todos
            </button>
            <button
              type="button"
              className={`btn-filtro ${filtroDescuento === "con" ? "active" : ""}`}
              onClick={() => setFiltroDescuento("con")}
            >
              Con descuento
            </button>
            <button
              type="button"
              className={`btn-filtro ${filtroDescuento === "sin" ? "active" : ""}`}
              onClick={() => setFiltroDescuento("sin")}
            >
              Sin descuento
            </button>
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
                  <th>Descuento</th>
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
                    <td>
                      {cliente.tiene_descuento ? (
                        <span className="pill pill-si">
                          Sí · {cliente.descuento_porcentaje}%
                        </span>
                      ) : (
                        <span className="pill pill-no">No</span>
                      )}
                    </td>
                    <td className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => setClienteDetalle(cliente)}
                        aria-label="Ver detalles"
                      >
                        <EyeIcon />
                      </button>
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
      {clienteDetalle && (
        <div className="modal-overlay" onClick={() => setClienteDetalle(null)}>
          <div
            className="modal-card modal-detalle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {clienteDetalle.nombre} {clienteDetalle.apellido}
              </h2>
              <button
                className="modal-close"
                onClick={() => setClienteDetalle(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-row">
                <span className="detail-label">Empresa</span>
                <span className="detail-value">
                  {clienteDetalle.empresa || "—"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cédula / ID</span>
                <span className="detail-value">
                  {clienteDetalle.cedula || "—"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Teléfono</span>
                <span className="detail-value">
                  {clienteDetalle.telefono || "—"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Correo</span>
                <span className="detail-value">
                  {clienteDetalle.correo || "—"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dirección</span>
                <span className="detail-value">
                  {clienteDetalle.direccion || "—"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Balance pendiente</span>
                <span className="detail-value">
                  ₡
                  {Number(clienteDetalle.balance_pendiente ?? 0).toLocaleString(
                    "es-CR",
                  )}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Descuento</span>
                <span className="detail-value">
                  {clienteDetalle.tiene_descuento
                    ? `${clienteDetalle.descuento_porcentaje}%`
                    : "Sin descuento"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estado</span>
                <span className={`badge badge-${clienteDetalle.estado}`}>
                  {clienteDetalle.estado}
                </span>
              </div>
              {clienteDetalle.notas && (
                <div className="detail-row detail-row-full">
                  <span className="detail-label">Notas</span>
                  <span className="detail-value">{clienteDetalle.notas}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setClienteDetalle(null)}
              >
                Cerrar
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setClienteDetalle(null);
                  abrirEditar(clienteDetalle);
                }}
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
      {clienteToDelete && (
        <div className="modal-overlay" onClick={() => setClienteToDelete(null)}>
          <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-confirm-icon">
              <TrashIcon width={26} height={26} />
            </div>

            <h3>¿Eliminar cliente?</h3>
            <p>
              Estás a punto de desactivar a{" "}
              <span className="modal-confirm-name">
                {clienteToDelete.nombre} {clienteToDelete.apellido}
              </span>
              . Esta acción no se puede deshacer.
            </p>

            <div className="modal-confirm-actions">
              <button
                className="btn-secondary"
                onClick={() => setClienteToDelete(null)}
              >
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
