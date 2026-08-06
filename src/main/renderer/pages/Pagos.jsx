import { useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePagos } from "../hooks/usePagos";
import { useClientes } from "../hooks/useClientes";
import { useOrdenes } from "../hooks/useOrdenes";

const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "sinpe", label: "Sinpe" },
  { value: "otro", label: "Otro" },
];

function Pagos() {
  const { user } = useAuth();
  const { pagos, resumen, loading, error, registrarPago } = usePagos();
  const { clientes } = useClientes();
  const { ordenes } = useOrdenes();

  const [form, setForm] = useState({
    clienteId: "",
    ordenId: "",
    monto: "",
    metodoPago: "efectivo",
    notas: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [mensajeTipo, setMensajeTipo] = useState("success");
  const [busqueda, setBusqueda] = useState("");

  const clienteSeleccionado = useMemo(
    () =>
      clientes.find((cliente) => String(cliente.id) === String(form.clienteId)),
    [clientes, form.clienteId],
  );

  const ordenesCliente = useMemo(() => {
    if (!form.clienteId) return [];
    return ordenes.filter(
      (orden) =>
        String(orden.cliente_id) === String(form.clienteId) &&
        orden.estado_pago !== "pagado",
    );
  }, [form.clienteId, ordenes]);

  const ordenSeleccionada = useMemo(
    () =>
      ordenesCliente.find((orden) => String(orden.id) === String(form.ordenId)),
    [ordenesCliente, form.ordenId],
  );

  const pagosOrdenSeleccionada = useMemo(() => {
    if (!ordenSeleccionada) return [];
    return pagos.filter(
      (pago) => String(pago.orden_id) === String(ordenSeleccionada.id),
    );
  }, [pagos, ordenSeleccionada]);

  const saldoOrdenRestante = useMemo(() => {
    if (!ordenSeleccionada) return null;
    const totalPagado = pagosOrdenSeleccionada.reduce(
      (acc, pago) => acc + Number(pago.monto),
      0,
    );
    return Number(ordenSeleccionada.total) - totalPagado;
  }, [ordenSeleccionada, pagosOrdenSeleccionada]);

  const pagosFiltrados = useMemo(() => {
    if (!busqueda) return pagos;
    const q = busqueda.toLowerCase();
    return pagos.filter(
      (pago) =>
        String(pago.id).includes(q) ||
        pago.cliente_nombre?.toLowerCase().includes(q) ||
        pago.metodo_pago?.toLowerCase().includes(q) ||
        String(pago.orden_id).includes(q),
    );
  }, [pagos, busqueda]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje("");

    const monto = Number(form.monto);
    if (!form.clienteId || !monto || monto <= 0) {
      setMensajeTipo("error");
      setMensaje("Selecciona un cliente y escribe un monto válido.");
      return;
    }

    if (ordenSeleccionada && monto > saldoOrdenRestante) {
      setMensajeTipo("error");
      setMensaje(
        `El monto no puede ser mayor al saldo pendiente de la orden (₡${Number(
          saldoOrdenRestante,
        ).toLocaleString("es-CR")}).`,
      );
      return;
    }

    const resultado = await registrarPago({
      cliente_id: Number(form.clienteId),
      orden_id: form.ordenId ? Number(form.ordenId) : null,
      monto,
      metodo_pago: form.metodoPago,
      notas: form.notas,
      usuario_id: user?.id,
    });

    if (!resultado.ok) {
      setMensajeTipo("error");
      setMensaje(resultado.message || "No se pudo registrar el pago.");
      return;
    }

    setMensajeTipo("success");
    setMensaje("Pago registrado correctamente.");
    setForm({
      clienteId: "",
      ordenId: "",
      monto: "",
      metodoPago: "efectivo",
      notas: "",
    });
  };

  if (loading) {
    return <div className="page-loading">Cargando pagos…</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>💳 Pagos</h1>
          <p>{pagos.length} pagos registrados</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <h3>{resumen?.total_pagos ?? 0}</h3>
            <p>Pagos totales</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div>
            <h3>
              ₡{Number(resumen?.total_recaudado ?? 0).toLocaleString("es-CR")}
            </h3>
            <p>Total recaudado</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div>
            <h3>₡{Number(resumen?.efectivo ?? 0).toLocaleString("es-CR")}</h3>
            <p>Efectivo</p>
          </div>
        </div>
      </div>

      <div className="panel-row">
        <form className="panel-card" onSubmit={handleSubmit}>
          <h2>Registrar pago</h2>

          <div className="form-group">
            <label>Cliente *</label>
            <select
              value={form.clienteId}
              onChange={(e) =>
                setForm({ ...form, clienteId: e.target.value, ordenId: "" })
              }
              required
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}{" "}
                  {cliente.empresa ? `- ${cliente.empresa}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Orden (opcional)</label>
            <select
              value={form.ordenId}
              onChange={(e) => setForm({ ...form, ordenId: e.target.value })}
            >
              <option value="">Sin orden</option>
              {ordenesCliente.map((orden) => (
                <option key={orden.id} value={orden.id}>
                  #{orden.id} — ₡{Number(orden.total).toLocaleString("es-CR")} —{" "}
                  {orden.estado_pago}
                </option>
              ))}
            </select>
            {ordenSeleccionada && (
              <p className="field-help">
                Saldo pendiente: ₡
                {Number(saldoOrdenRestante).toLocaleString("es-CR")}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Monto *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Método de pago</label>
            <select
              value={form.metodoPago}
              onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
            >
              {METODOS_PAGO.map((metodo) => (
                <option key={metodo.value} value={metodo.value}>
                  {metodo.label}
                </option>
              ))}
            </select>
          </div>

          {clienteSeleccionado?.balance_pendiente != null && (
            <div className="form-note">
              Balance pendiente del cliente: ₡
              {Number(clienteSeleccionado.balance_pendiente).toLocaleString(
                "es-CR",
              )}
            </div>
          )}

          <div className="form-group">
            <label>Notas</label>
            <textarea
              rows={3}
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </div>

          {mensaje && (
            <p
              className={
                mensajeTipo === "error" ? "message-error" : "message-success"
              }
            >
              {mensaje}
            </p>
          )}

          <button className="btn-primary" type="submit">
            Registrar pago
          </button>
        </form>

        <div className="panel-card panel-table">
          <div className="toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Buscar pagos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {pagosFiltrados.length === 0 ? (
            <p className="empty-msg">No hay pagos registrados.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Orden</th>
                    <th>Monto</th>
                    <th>Método</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.map((pago) => (
                    <tr key={pago.id}>
                      <td>{pago.id}</td>
                      <td>{pago.cliente_nombre}</td>
                      <td>{pago.orden_id ?? "—"}</td>
                      <td>₡{Number(pago.monto).toLocaleString("es-CR")}</td>
                      <td>{pago.metodo_pago}</td>
                      <td>
                        {pago.fecha_pago
                          ? new Date(pago.fecha_pago).toLocaleDateString(
                              "es-CR",
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {error && <p className="message-error">{error}</p>}
    </div>
  );
}

export default Pagos;
