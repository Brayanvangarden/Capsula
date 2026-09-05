import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePagos } from "../hooks/usePagos";
import { useClientes } from "../hooks/useClientes";
import { useOrdenes } from "../hooks/useOrdenes";
import Factura from "../components/Factura";
import { facturasService } from "../services/facturas.service";

const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "cheque", label: "Cheque" },
  { value: "datafono", label: "Datafono" },
  { value: "zelle", label: "Zelle" },
];

const formatOrdenNumero = (id) =>
  `N.º ${String(Number(id ?? 0)).padStart(4, "0")}`;

function Pagos() {
  const { user } = useAuth();
  const { pagos, resumen, loading, error, registrarPago } = usePagos();
  const { clientes, fetchClientes } = useClientes();
  const { ordenes, fetchOrdenes } = useOrdenes();

  const [form, setForm] = useState({
    clienteId: "",
    ordenId: "",
    monto: "",
    tipoPago: "abono",
    metodoPago: "efectivo",
    referenciaDatafono: "",
    notas: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [mensajeTipo, setMensajeTipo] = useState("success");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaOrden, setBusquedaOrden] = useState("");
  const [facturasPorPago, setFacturasPorPago] = useState({});
  const [facturaReciente, setFacturaReciente] = useState(null);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [cargandoFacturaId, setCargandoFacturaId] = useState(null);

  const limpiarPantalla = () => {
    setForm({
      clienteId: "",
      ordenId: "",
      monto: "",
      tipoPago: "abono",
      metodoPago: "efectivo",
      referenciaDatafono: "",
      notas: "",
    });
    setBusqueda("");
    setBusquedaOrden("");
    setMensaje("");
    setMensajeTipo("success");
    setFacturaReciente(null);
    setFacturaSeleccionada(null);
  };

  const abrirFactura = async (pago) => {
    if (!pago.orden_id) return;
    setCargandoFacturaId(pago.id);
    try {
      const factura =
        facturasPorPago[pago.id] ??
        (await facturasService.getByPagoId(pago.id));
      if (!factura) {
        setMensajeTipo("error");
        setMensaje(
          "La factura estará disponible cuando el pago complete totalmente la orden.",
        );
        return;
      }
      setFacturasPorPago((prev) => ({ ...prev, [pago.id]: factura }));
      setFacturaSeleccionada(factura);
    } catch (err) {
      setMensajeTipo("error");
      setMensaje(err.message || "No se pudo cargar la factura.");
    } finally {
      setCargandoFacturaId(null);
    }
  };

  useEffect(() => {
    let activo = true;
    const cargarFacturas = async () => {
      const resultados = await Promise.all(
        pagos.map(async (pago) => [
          pago.id,
          await facturasService.getByPagoId(pago.id),
        ]),
      );
      if (activo) setFacturasPorPago(Object.fromEntries(resultados));
    };
    cargarFacturas().catch(() => {
      if (activo) setFacturasPorPago({});
    });
    return () => {
      activo = false;
    };
  }, [pagos]);

  const ordenesPendientes = useMemo(
    () =>
      ordenes
        .map((orden) => {
          const totalPagado = pagos
            .filter((pago) => String(pago.orden_id) === String(orden.id))
            .reduce((total, pago) => total + Number(pago.monto), 0);
          return {
            ...orden,
            totalPagado,
            saldoPendiente: Math.max(0, Number(orden.total) - totalPagado),
          };
        })
        .filter((orden) => orden.saldoPendiente > 0.005),
    [ordenes, pagos],
  );

  const ordenSeleccionada = useMemo(
    () =>
      ordenesPendientes.find(
        (orden) => String(orden.id) === String(form.ordenId),
      ),
    [ordenesPendientes, form.ordenId],
  );

  const saldoOrdenRestante = ordenSeleccionada?.saldoPendiente ?? null;

  const clienteSeleccionado = useMemo(
    () =>
      clientes.find((cliente) => String(cliente.id) === String(form.clienteId)),
    [clientes, form.clienteId],
  );

  const ordenesCliente = useMemo(() => {
    if (!form.clienteId) return [];
    return ordenesPendientes.filter(
      (orden) => String(orden.cliente_id) === String(form.clienteId),
    );
  }, [form.clienteId, ordenesPendientes]);

  const ordenesFiltradasBusqueda = useMemo(() => {
    const q = busquedaOrden.trim().toLowerCase();
    if (!q) return [];
    return ordenesPendientes.filter(
      (orden) =>
        String(orden.id).includes(q) ||
        orden.cliente_nombre?.toLowerCase().includes(q) ||
        orden.cliente_empresa?.toLowerCase().includes(q),
    );
  }, [busquedaOrden, ordenesPendientes]);

  const seleccionarOrden = (orden) => {
    setForm({
      ...form,
      clienteId: String(orden.cliente_id),
      ordenId: String(orden.id),
      monto:
        form.tipoPago === "pago_total" ? String(orden.saldoPendiente) : "",
      referenciaDatafono: "",
    });
    setBusquedaOrden("");
    setMensaje("");
  };

  const limpiarOrdenSeleccionada = () => {
    setForm({ ...form, ordenId: "", monto: "", referenciaDatafono: "" });
  };

  const cambiarTipoPago = (tipoPago) => {
    setForm({
      ...form,
      tipoPago,
      monto:
        tipoPago === "pago_total" && saldoOrdenRestante != null
          ? String(saldoOrdenRestante)
          : "",
    });
  };

  // ── Indicador en vivo: cuánto queda mientras se escribe el monto ──
  const previsualizacion = useMemo(() => {
    if (saldoOrdenRestante == null) return null;
    const monto = Number(form.monto);
    if (!monto || monto <= 0) return null;

    if (monto > saldoOrdenRestante + 0.005) {
      return { tipo: "error", texto: "El monto supera el saldo pendiente." };
    }

    const restante = saldoOrdenRestante - monto;
    if (restante <= 0.005) {
      return {
        tipo: "completo",
        texto: "Este pago deja la orden completamente saldada.",
      };
    }
    return {
      tipo: "abono",
      texto: `Es un abono. Después de este pago quedarán ₡${restante.toLocaleString("es-CR")} pendientes.`,
    };
  }, [form.monto, saldoOrdenRestante]);

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
    if (!form.clienteId || !form.ordenId || !monto || monto <= 0) {
      setMensajeTipo("error");
      setMensaje("Selecciona una orden y escribe un monto válido.");
      return;
    }

    if (
      form.tipoPago === "pago_total" &&
      Math.abs(monto - Number(saldoOrdenRestante)) > 0.005
    ) {
      setMensajeTipo("error");
      setMensaje("El pago total debe cubrir todo el saldo pendiente.");
      return;
    }

    if (monto > saldoOrdenRestante + 0.005) {
      setMensajeTipo("error");
      setMensaje(
        `El monto no puede ser mayor al saldo pendiente de la orden (₡${Number(
          saldoOrdenRestante,
        ).toLocaleString("es-CR")}).`,
      );
      return;
    }

    const referenciaDatafono =
      form.metodoPago === "datafono" ? form.referenciaDatafono.trim() : "";
    const notasPayload = [
      form.notas?.trim(),
      referenciaDatafono ? `Referencia Datafono: ${referenciaDatafono}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const resultado = await registrarPago({
      cliente_id: Number(form.clienteId),
      orden_id: Number(form.ordenId),
      monto,
      tipo_pago: form.tipoPago,
      metodo_pago: form.metodoPago,
      notas: notasPayload,
      usuario_id: user?.id,
    });

    if (!resultado.ok) {
      setMensajeTipo("error");
      setMensaje(resultado.message || "No se pudo registrar el pago.");
      return;
    }

    setMensajeTipo("success");
    const saldoRestante = Math.max(0, saldoOrdenRestante - monto);
    setFacturaReciente(null);
    setFacturaSeleccionada(null);
    setMensaje(
      saldoRestante > 0.005
        ? `Abono registrado. Saldo restante: ₡${saldoRestante.toLocaleString("es-CR")}`
        : "Pago registrado. La orden quedó pagada.",
    );
    if (resultado.data?.id) {
      try {
        const factura = await facturasService.getByPagoId(resultado.data.id);
        setFacturaReciente(factura);
        setFacturaSeleccionada(factura);
        setFacturasPorPago((prev) => ({
          ...prev,
          [resultado.data.id]: factura,
        }));
      } catch {
        setFacturaReciente(null);
        setFacturaSeleccionada(null);
      }
    }
    await Promise.all([fetchOrdenes(), fetchClientes()]);
    setForm({
      clienteId: "",
      ordenId: "",
      monto: "",
      tipoPago: "abono",
      metodoPago: "efectivo",
      referenciaDatafono: "",
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
          <div className="pago-form-header">
            <h2>Registrar pago</h2>
            <button
              type="button"
              className="btn-secondary"
              onClick={limpiarPantalla}
            >
              Limpiar
            </button>
          </div>

          {/* ── Paso 1: Buscar orden (protagonista) ─────────────── */}
          {!ordenSeleccionada ? (
            <div className="pago-buscador">
              <label className="pago-buscador-label">
                Número de orden o nombre del cliente
              </label>
              <div className="search-bar">
                <input
                  type="text"
                  autoFocus
                  placeholder="Ej: 12, o Andrea Solís..."
                  value={busquedaOrden}
                  onChange={(e) => setBusquedaOrden(e.target.value)}
                />
                {busquedaOrden && (
                  <button
                    type="button"
                    className="search-bar-clear"
                    onClick={() => setBusquedaOrden("")}
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>

              {busquedaOrden && (
                <div className="pago-resultados">
                  {ordenesFiltradasBusqueda.length === 0 ? (
                    <p className="field-help">
                      No se encontró ninguna orden pendiente con eso.
                    </p>
                  ) : (
                    ordenesFiltradasBusqueda.map((orden) => (
                      <button
                        type="button"
                        key={orden.id}
                        className="pago-resultado-item"
                        onClick={() => seleccionarOrden(orden)}
                      >
                        <span className="pago-resultado-orden">
                          {formatOrdenNumero(orden.id)} — {orden.cliente_nombre}
                        </span>
                        <span className="pill pill-warn">
                          Faltan ₡{orden.saldoPendiente.toLocaleString("es-CR")}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {!busquedaOrden && (
                <details className="pago-alt-camino">
                  <summary>O elegir por cliente en vez de por orden</summary>
                  <div className="form-group">
                    <select
                      value={form.clienteId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          clienteId: e.target.value,
                          ordenId: "",
                        })
                      }
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

                  {form.clienteId && ordenesCliente.length === 0 && (
                    <p className="field-help">
                      Este cliente no tiene órdenes pendientes de pago.
                    </p>
                  )}

                  {ordenesCliente.length > 0 && (
                    <div className="pago-resultados">
                      {ordenesCliente.map((orden) => (
                        <button
                          type="button"
                          key={orden.id}
                          className="pago-resultado-item"
                          onClick={() => seleccionarOrden(orden)}
                        >
                          <span className="pago-resultado-orden">
                            {formatOrdenNumero(orden.id)}
                          </span>
                          <span className="pill pill-warn">
                            Faltan ₡
                            {orden.saldoPendiente.toLocaleString("es-CR")}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </details>
              )}
            </div>
          ) : (
            <>
              {/* ── Paso 2: Orden seleccionada, con sus datos ────── */}
              <div className="pago-orden-card">
                <div className="pago-orden-card-header">
                  <div>
                    <span className="pago-orden-numero">
                      Orden {formatOrdenNumero(ordenSeleccionada.id)}
                    </span>
                    <span className="pago-orden-cliente">
                      {ordenSeleccionada.cliente_nombre}
                      {ordenSeleccionada.cliente_empresa
                        ? ` — ${ordenSeleccionada.cliente_empresa}`
                        : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={limpiarOrdenSeleccionada}
                  >
                    Cambiar orden
                  </button>
                </div>

                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">Total de la orden</span>
                    <span className="detail-value">
                      ₡{Number(ordenSeleccionada.total).toLocaleString("es-CR")}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ya pagado</span>
                    <span className="detail-value">
                      ₡
                      {Number(ordenSeleccionada.totalPagado).toLocaleString(
                        "es-CR",
                      )}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Saldo pendiente</span>
                    <span className="detail-value">
                      ₡{Number(saldoOrdenRestante).toLocaleString("es-CR")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de pago</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="tipoPago"
                      value="pago_total"
                      checked={form.tipoPago === "pago_total"}
                      onChange={() => cambiarTipoPago("pago_total")}
                    />
                    Pago total
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tipoPago"
                      value="abono"
                      checked={form.tipoPago === "abono"}
                      onChange={() => cambiarTipoPago("abono")}
                    />
                    Abono
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Monto a pagar * (máximo ₡
                  {Number(saldoOrdenRestante).toLocaleString("es-CR")})
                </label>
                <input
                  type="number"
                  min="0"
                  max={saldoOrdenRestante ?? undefined}
                  step="0.01"
                  autoFocus
                  value={form.monto}
                  readOnly={form.tipoPago === "pago_total"}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  required
                />
                {form.tipoPago === "abono" && (
                  <button
                    type="button"
                    className="btn-link-inline"
                    onClick={() => cambiarTipoPago("pago_total")}
                  >
                    Usar el saldo completo (₡
                    {Number(saldoOrdenRestante).toLocaleString("es-CR")})
                  </button>
                )}
              </div>

              {previsualizacion && (
                <p
                  className={
                    previsualizacion.tipo === "error"
                      ? "message-error"
                      : previsualizacion.tipo === "completo"
                        ? "message-success"
                        : "form-note"
                  }
                >
                  {previsualizacion.texto}
                </p>
              )}

              <div className="form-group">
                <label>Método de pago</label>
                <select
                  value={form.metodoPago}
                  onChange={(e) => {
                    const metodo = e.target.value;
                    setForm({
                      ...form,
                      metodoPago: metodo,
                      referenciaDatafono:
                        metodo === "datafono" ? form.referenciaDatafono : "",
                    });
                  }}
                >
                  {METODOS_PAGO.map((metodo) => (
                    <option key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.metodoPago === "datafono" && (
                <div className="form-group">
                  <label>Referencia</label>
                  <input
                    type="text"
                    value={form.referenciaDatafono}
                    onChange={(e) =>
                      setForm({ ...form, referenciaDatafono: e.target.value })
                    }
                    placeholder="Número o referencia del datáfono"
                  />
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

              {clienteSeleccionado?.balance_pendiente != null && (
                <div className="form-note">
                  Balance pendiente total del cliente: ₡
                  {Number(clienteSeleccionado.balance_pendiente).toLocaleString(
                    "es-CR",
                  )}
                </div>
              )}
            </>
          )}

          {mensaje && (
            <p
              className={
                mensajeTipo === "error" ? "message-error" : "message-success"
              }
            >
              {mensaje}
            </p>
          )}

          {mensajeTipo === "success" && facturaReciente && (
            <div className="factura-disponible">
              <strong>
                Factura generada: {facturaReciente.numero_factura}
              </strong>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setFacturaSeleccionada(facturaReciente)}
              >
                Ver factura y descargar PDF
              </button>
            </div>
          )}

          <button
            className="btn-primary"
            type="submit"
            disabled={!ordenSeleccionada}
          >
            Registrar pago
          </button>
        </form>

        <div className="panel-card panel-table">
          <div className="toolbar">
            <h2>Órdenes pendientes de pago</h2>
          </div>

          {ordenesPendientes.length === 0 ? (
            <p className="empty-msg">No hay órdenes pendientes de pago.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Pagado</th>
                    <th>Faltante</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesPendientes.map((orden) => (
                    <tr
                      key={orden.id}
                      className={
                        String(orden.id) === String(form.ordenId)
                          ? "row-selected"
                          : ""
                      }
                      onClick={() => seleccionarOrden(orden)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{formatOrdenNumero(orden.id)}</td>
                      <td>{orden.cliente_nombre}</td>
                      <td>₡{Number(orden.total).toLocaleString("es-CR")}</td>
                      <td>
                        ₡{Number(orden.totalPagado).toLocaleString("es-CR")}
                      </td>
                      <td>
                        ₡{Number(orden.saldoPendiente).toLocaleString("es-CR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="toolbar">
            <h2>Historial de pagos</h2>
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
                    <th>Tipo</th>
                    <th>Método</th>
                    <th>Fecha</th>
                    <th>Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.map((pago) => (
                    <tr key={pago.id}>
                      <td>{pago.id}</td>
                      <td>{pago.cliente_nombre}</td>
                      <td>
                        {pago.orden_id ? formatOrdenNumero(pago.orden_id) : "—"}
                      </td>
                      <td>₡{Number(pago.monto).toLocaleString("es-CR")}</td>
                      <td>
                        {pago.tipo_pago === "pago_total"
                          ? "Pago total"
                          : "Abono"}
                      </td>
                      <td>{pago.metodo_pago}</td>
                      <td>
                        {pago.fecha_pago
                          ? new Date(pago.fecha_pago).toLocaleDateString(
                              "es-CR",
                            )
                          : "—"}
                      </td>
                      <td>
                        {pago.orden_id ? (
                          <button
                            type="button"
                            className="btn-action-outline"
                            onClick={() => abrirFactura(pago)}
                            disabled={cargandoFacturaId === pago.id}
                          >
                            {cargandoFacturaId === pago.id
                              ? "Cargando..."
                              : "Generar factura"}
                          </button>
                        ) : (
                          <span className="text-muted">Sin orden asociada</span>
                        )}
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
      <Factura
        factura={facturaSeleccionada}
        onClose={() => setFacturaSeleccionada(null)}
      />
    </div>
  );
}
export default Pagos;
