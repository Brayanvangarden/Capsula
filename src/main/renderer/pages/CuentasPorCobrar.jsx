import { useEffect, useMemo, useState } from "react";
import { cuentasPorCobrarService } from "../services/cuentasPorCobrar.service";

const ESTADOS = {
  al_dia: "Al día",
  pendiente: "Pendiente",
  morosa: "Morosa",
};

const moneda = (valor) => `₡${Number(valor ?? 0).toLocaleString("es-CR")}`;
const fecha = (valor) =>
  valor ? new Date(valor).toLocaleDateString("es-CR") : "—";
const mesActual = () => new Date().toISOString().slice(0, 7);
const nombreMes = (mes) => {
  if (!mes) return "Todos los movimientos";
  return new Date(`${mes}-01T12:00:00`).toLocaleDateString("es-CR", {
    month: "long",
    year: "numeric",
  });
};
const escaparHtml = (valor) =>
  String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function CuentasPorCobrar() {
  const [clientes, setClientes] = useState([]);
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual());
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const cargarClientes = async () => {
    setCargando(true);
    setError("");
    try {
      setClientes(await cuentasPorCobrarService.getResumen());
    } catch (err) {
      setError(err.message || "No se pudieron cargar las cuentas por cobrar.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return clientes;
    return clientes.filter(
      (cliente) =>
        cliente.nombre?.toLowerCase().includes(termino) ||
        cliente.empresa?.toLowerCase().includes(termino),
    );
  }, [clientes, busqueda]);

  const seleccionarCliente = async (cliente) => {
    setClienteSeleccionado(cliente);
    setEstadoCuenta(null);
    setCargandoDetalle(true);
    setError("");
    try {
      setEstadoCuenta(
        await cuentasPorCobrarService.getEstadoCuenta(
          cliente.id,
          mesSeleccionado,
        ),
      );
    } catch (err) {
      setError(err.message || "No se pudo cargar el estado de cuenta.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cambiarMes = async (mes) => {
    setMesSeleccionado(mes);
    if (!clienteSeleccionado) return;

    setCargandoDetalle(true);
    try {
      setEstadoCuenta(
        await cuentasPorCobrarService.getEstadoCuenta(
          clienteSeleccionado.id,
          mes,
        ),
      );
    } catch (err) {
      setError(err.message || "No se pudo cargar el estado de cuenta.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const descargarEstadoCuenta = () => {
    if (!estadoCuenta || !clienteSeleccionado) return;

    const formatoUsd = (valor) =>
      `$${Number(valor ?? 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const fechaLarga = (valor) =>
      valor
        ? new Date(valor).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "—";

    const movimientos = estadoCuenta.movimientos ?? [];
    const fechaInicio = movimientos.length
      ? fechaLarga(movimientos[0].fecha)
      : "—";
    const fechaFin = movimientos.length
      ? fechaLarga(movimientos[movimientos.length - 1].fecha)
      : "—";

    const documentoDe = (movimiento) => {
      if (movimiento.numero_factura) return movimiento.numero_factura;
      if (movimiento.tipo === "pago") {
        return `P${String(movimiento.pago_id).padStart(4, "0")}`;
      }
      return String(movimiento.orden_id).padStart(4, "0");
    };

    const filas = movimientos
      .map((movimiento) => {
        const esOrden = movimiento.tipo === "venta";
        return `
        <tr>
          <td>${escaparHtml(fechaLarga(movimiento.fecha))}</td>
          <td>${escaparHtml(documentoDe(movimiento))}</td>
          <td>${esOrden ? "Orden" : "Pago"}</td>
          <td class="charge">${esOrden ? formatoUsd(movimiento.monto) : "0"}</td>
          <td class="payment">${!esOrden ? formatoUsd(Math.abs(movimiento.monto)) : "0"}</td>
          <td>${formatoUsd(movimiento.saldo)}</td>
        </tr>`;
      })
      .join("");

    const html = `
    <html><head><meta charset="UTF-8"><style>
      body { font-family: Arial, sans-serif; color: #111827; }
      .header-row { width: 100%; }
      .logo { font-size: 22px; font-weight: bold; letter-spacing: 0.5px; }
      .company-info { font-size: 11px; color: #374151; margin-top: 4px; }
      .statement-title { font-size: 24px; font-weight: bold; text-align: right; }
      .period { text-align: center; font-size: 12px; margin: 10px 0; }
      .account-row { margin: 18px 0 10px; }
      .account-label { font-weight: bold; font-size: 12px; }
      .account-value { color: #4b5563; margin-left: 20px; }
      .activity-banner {
        background: #ffffff;
        border: 2px solid #111827;
        text-align: center;
        font-weight: bold;
        font-size: 15px;
        letter-spacing: 1px;
        padding: 8px 0;
        margin: 14px 0;
      }
      table { border-collapse: collapse; width: 100%; margin-top: 10px; }
      th {
        background: #ffffff;
        border-bottom: 2px solid #111827;
        text-align: center;
        font-size: 12px;
        padding: 8px;
      }
      td {
        border-bottom: 1px solid #e5e7eb;
        padding: 6px 8px;
        font-size: 12px;
      }
      td:first-child { text-align: left; }
      .charge, .payment { text-align: right; }
      td:last-child { text-align: right; }
    </style></head><body>
      <table class="header-row"><tr>
        <td style="width:60%">
          <div class="logo">LOGICAPS</div>
          <div class="company-info">
            NATUR VITALIA LLC<br/>
            7980 W 25th Ct. Hialeah, FL 33016<br/>
            Tel. (754) 209-3195 / (954) 889-4019
          </div>
        </td>
        <td style="width:40%"><div class="statement-title">Account Statement</div></td>
      </tr></table>

      <div class="period">
        Statement Period: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>${escaparHtml(fechaInicio)} to ${escaparHtml(fechaFin)}</strong>
      </div>

      <div class="account-row">
        <span class="account-label">ACCOUNT</span>
        <span class="account-value">${escaparHtml(clienteSeleccionado.nombre)}</span>
      </div>

      <div class="activity-banner">ACCOUNT ACTIVITY</div>

      <table>
        <thead>
          <tr>
            <th>DATE</th>
            <th>DOCUMENT</th>
            <th>TRANSACTION</th>
            <th>CHARGE</th>
            <th>PAYMENT</th>
            <th>BALANCE</th>
          </tr>
        </thead>
        <tbody>
          ${filas || '<tr><td colspan="6" style="text-align:center">Sin movimientos en el período</td></tr>'}
        </tbody>
      </table>
    </body></html>`;

    const blob = new Blob(["\ufeff", html], {
      type: "application/vnd.ms-excel",
    });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `account-statement-${clienteSeleccionado.nombre.replace(/[^a-z0-9]+/gi, "-")}-${mesSeleccionado || "general"}.xls`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  };

  const resumen = useMemo(
    () => ({
      pendiente: clientes.filter((cliente) => cliente.estado === "pendiente")
        .length,
      morosa: clientes.filter((cliente) => cliente.estado === "morosa").length,
      saldo: clientes.reduce(
        (total, cliente) => total + Number(cliente.saldo_pendiente),
        0,
      ),
    }),
    [clientes],
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>💼 Cuentas por Cobrar</h1>
          <p>Control de ventas a crédito, pagos y saldos pendientes</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={cargarClientes}
        >
          Actualizar
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <h3>{clientes.length}</h3>
            <p>Clientes con crédito</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <h3>{resumen.pendiente}</h3>
            <p>Cuentas pendientes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div>
            <h3>{resumen.morosa}</h3>
            <p>Cuentas morosas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <h3>{moneda(resumen.saldo)}</h3>
            <p>Saldo por cobrar</p>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="page-loading">Cargando cuentas por cobrar...</div>
      ) : (
        <div className="panel-row">
          <section className="panel-card">
            <div className="section-heading">
              <div>
                <h2>Clientes</h2>
                <p>Selecciona un cliente para ver sus movimientos.</p>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="buscar-cuenta">Buscar cliente</label>
              <input
                id="buscar-cuenta"
                type="search"
                placeholder="Nombre o empresa"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </div>
            {clientesFiltrados.length === 0 ? (
              <p className="empty-msg">No hay cuentas por cobrar.</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Ventas</th>
                      <th>Pagado</th>
                      <th>Saldo</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente) => (
                      <tr
                        key={cliente.id}
                        className={
                          clienteSeleccionado?.id === cliente.id
                            ? "row-selected"
                            : ""
                        }
                        onClick={() => seleccionarCliente(cliente)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <strong>{cliente.nombre}</strong>
                          {cliente.empresa && <small>{cliente.empresa}</small>}
                        </td>
                        <td>{moneda(cliente.total_ventas_credito)}</td>
                        <td>{moneda(cliente.total_pagado)}</td>
                        <td>{moneda(cliente.saldo_pendiente)}</td>
                        <td>
                          <span
                            className={`status-badge status-${cliente.estado}`}
                          >
                            {ESTADOS[cliente.estado]}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-action-outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              seleccionarCliente(cliente);
                            }}
                          >
                            Estado de cuenta
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel-card">
            <div className="section-heading">
              <div>
                <h2>Estado de cuenta</h2>
                <p>
                  {clienteSeleccionado
                    ? `${clienteSeleccionado.nombre} · movimientos cronológicos`
                    : "Selecciona un cliente"}
                </p>
              </div>
            </div>
            {!clienteSeleccionado ? (
              <p className="empty-msg">Selecciona un cliente de la lista.</p>
            ) : cargandoDetalle ? (
              <div className="page-loading">Cargando estado de cuenta...</div>
            ) : (
              <>
                <div className="detail-grid">
                  <div className="form-group">
                    <label htmlFor="mes-estado-cuenta">Mes del estado</label>
                    <input
                      id="mes-estado-cuenta"
                      type="month"
                      value={mesSeleccionado}
                      onChange={(event) => cambiarMes(event.target.value)}
                    />
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Saldo inicial</span>
                    <strong>{moneda(estadoCuenta?.saldo_inicial)}</strong>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ventas del mes</span>
                    <strong>{moneda(estadoCuenta?.ventas_del_mes)}</strong>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Pagos del mes</span>
                    <strong>{moneda(estadoCuenta?.pagos_del_mes)}</strong>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Saldo al cierre</span>
                    <strong>{moneda(estadoCuenta?.saldo_al_cierre)}</strong>
                  </div>
                </div>
                <div className="section-heading">
                  <p>Período: {nombreMes(mesSeleccionado)}</p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={descargarEstadoCuenta}
                  >
                    Descargar Excel
                  </button>
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Factura</th>
                        <th>Descripción</th>
                        <th>Monto</th>
                        <th>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(estadoCuenta?.movimientos ?? []).map((movimiento) => (
                        <tr key={movimiento.clave}>
                          <td>{fecha(movimiento.fecha)}</td>
                          <td>{movimiento.numero_factura || "Sin factura"}</td>
                          <td>{movimiento.descripcion}</td>
                          <td
                            className={
                              movimiento.tipo === "pago"
                                ? "amount-positive"
                                : "amount-negative"
                            }
                          >
                            {movimiento.tipo === "pago" ? "-" : "+"}
                            {moneda(Math.abs(movimiento.monto))}
                          </td>
                          <td>{moneda(movimiento.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {error && <p className="message-error">{error}</p>}
    </div>
  );
}

export default CuentasPorCobrar;
