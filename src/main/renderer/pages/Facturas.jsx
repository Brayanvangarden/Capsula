import { useEffect, useMemo, useState } from "react";
import Factura from "../components/Factura";
import { facturasService } from "../services/facturas.service";
import { generarFacturaPdf } from "../services/facturaPdf.service";

const formatoMoneda = (value) =>
  `₡${Number(value ?? 0).toLocaleString("es-CR")}`;

function Facturas() {
  const [registros, setRegistros] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha_desde: "",
    fecha_hasta: "",
    estado_pago: "",
  });
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [cargandoFacturaId, setCargandoFacturaId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarHistorial = async () => {
    setCargando(true);
    setError("");
    try {
      setRegistros(await facturasService.getHistorial(filtros));
    } catch (err) {
      setError(err.message || "No se pudo cargar el historial de facturas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [filtros.fecha_desde, filtros.fecha_hasta, filtros.estado_pago]);

  const resumen = useMemo(
    () => ({
      total: registros.length,
      pagadas: registros.filter((registro) => registro.estado_pago === "pagado")
        .length,
      pendientes: registros.filter(
        (registro) => registro.estado_pago === "pendiente",
      ).length,
      saldo: registros.reduce(
        (total, registro) => total + Number(registro.saldo),
        0,
      ),
    }),
    [registros],
  );

  const actualizarFiltro = (campo, valor) => {
    setFiltros((actuales) => ({ ...actuales, [campo]: valor }));
  };

  const abrirFactura = async (registro) => {
    if (!registro.factura_id) return;
    setCargandoFacturaId(registro.factura_id);
    try {
      setFacturaSeleccionada(
        await facturasService.getById(registro.factura_id),
      );
    } catch (err) {
      setError(err.message || "No se pudo cargar la factura.");
    } finally {
      setCargandoFacturaId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🧾 Facturas</h1>
          <p>Historial de pagos, abonos y saldos por orden</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={cargarHistorial}
        >
          Actualizar
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🧾</div>
          <div>
            <h3>{resumen.total}</h3>
            <p>Registros recientes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <h3>{resumen.pagadas}</h3>
            <p>Pagadas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <h3>{resumen.pendientes}</h3>
            <p>Pendientes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <h3>{formatoMoneda(resumen.saldo)}</h3>
            <p>Saldo pendiente</p>
          </div>
        </div>
      </div>

      <section className="panel-card">
        <div className="filters-row">
          <div className="form-group">
            <label htmlFor="facturas-desde">Desde</label>
            <input
              id="facturas-desde"
              type="date"
              value={filtros.fecha_desde}
              onChange={(event) =>
                actualizarFiltro("fecha_desde", event.target.value)
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="facturas-hasta">Hasta</label>
            <input
              id="facturas-hasta"
              type="date"
              value={filtros.fecha_hasta}
              onChange={(event) =>
                actualizarFiltro("fecha_hasta", event.target.value)
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="facturas-estado">Estado de pago</label>
            <select
              id="facturas-estado"
              value={filtros.estado_pago}
              onChange={(event) =>
                actualizarFiltro("estado_pago", event.target.value)
              }
            >
              <option value="">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
          <button
            type="button"
            className="btn-link-inline"
            onClick={() =>
              setFiltros({ fecha_desde: "", fecha_hasta: "", estado_pago: "" })
            }
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <div>
            <h2>Movimientos recientes</h2>
            <p>Las órdenes más recientes aparecen primero.</p>
          </div>
        </div>

        {cargando ? (
          <div className="page-loading">Cargando facturas...</div>
        ) : registros.length === 0 ? (
          <p className="empty-msg">
            No hay registros para los filtros seleccionados.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Cliente</th>
                  <th>Orden</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Pagado</th>
                  <th>Saldo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.orden_id}>
                    <td>{registro.numero_factura || "Pendiente"}</td>
                    <td>
                      {registro.cliente_nombre ||
                        registro.cliente_empresa ||
                        "—"}
                    </td>
                    <td>{`N.º ${String(registro.orden_id).padStart(4, "0")}`}</td>
                    <td>
                      {registro.fecha_creacion
                        ? new Date(registro.fecha_creacion).toLocaleDateString(
                            "es-CR",
                          )
                        : "—"}
                    </td>
                    <td>{formatoMoneda(registro.total)}</td>
                    <td>{formatoMoneda(registro.monto_pagado)}</td>
                    <td>{formatoMoneda(registro.saldo)}</td>
                    <td>
                      {registro.factura_id ? (
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-action-outline"
                            onClick={() => abrirFactura(registro)}
                            disabled={cargandoFacturaId === registro.factura_id}
                          >
                            {cargandoFacturaId === registro.factura_id
                              ? "Cargando..."
                              : "Ver factura"}
                          </button>
                          <button
                            type="button"
                            className="btn-link-inline"
                            onClick={async () => {
                              const factura = await facturasService.getById(
                                registro.factura_id,
                              );
                              generarFacturaPdf(factura);
                            }}
                          >
                            Descargar PDF
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">Se genera al pagar</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {error && <p className="message-error">{error}</p>}
      <Factura
        factura={facturaSeleccionada}
        onClose={() => setFacturaSeleccionada(null)}
      />
    </div>
  );
}

export default Facturas;
