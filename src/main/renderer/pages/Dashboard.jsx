import { useAuth } from "../hooks/useAuth";
import { useProductos } from "../hooks/useProductos";
import { useClientes } from "../hooks/useClientes";
import { useOrdenes } from "../hooks/useOrdenes";
import { usePagos } from "../hooks/usePagos";
import { useInventario } from "../hooks/useInventario";
import "../styles/globals.css";
import "../styles/theme.css";

/* ── Íconos SVG inline (sin dependencias extra) ── */
const IconBox = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 8V20a1 1 0 01-1 1H4a1 1 0 01-1-1V8" />
    <rect x="2" y="3" width="20" height="5" rx="1" />
    <path d="M10 12h4" />
  </svg>
);
const IconUsers = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconClip = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" />
  </svg>
);
const IconCard = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <path d="M1 10h22" />
  </svg>
);
const IconAlert = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);
const IconRefresh = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 4v6h-6M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);
const IconList = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IconChart = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconActivity = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </svg>
);

const STAT_ICONS = {
  box: { icon: <IconBox />, bg: "#eff6ff", color: "#1d4ed8" },
  users: { icon: <IconUsers />, bg: "#f0fdf4", color: "#15803d" },
  clip: { icon: <IconClip />, bg: "#fffbeb", color: "#b45309" },
  card: { icon: <IconCard />, bg: "#f5f3ff", color: "#7c3aed" },
  alert: { icon: <IconAlert />, bg: "#fff1f2", color: "#be123c" },
  refresh: { icon: <IconRefresh />, bg: "#ecfeff", color: "#0e7490" },
};

function StatCard({ type = "box", value, label }) {
  const { icon, bg, color } = STAT_ICONS[type];
  return (
    <div className="stat-card">
      <div className="stat-icon-wrap" style={{ background: bg, color }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}

function AlertaCard({ type, icon, count, label }) {
  return (
    <div className={`alerta alerta-${type}`}>
      <span className="alerta-icon">{icon}</span>
      <div>
        <strong>{count} productos</strong>
        <p>{label}</p>
      </div>
    </div>
  );
}

function EstadoBadge({ value, prefix = "" }) {
  const slug = value?.toLowerCase().replace(/\s+/g, "-") ?? "";
  return <span className={`badge badge-${prefix}${slug}`}>{value}</span>;
}

function moneda(value) {
  return `₡${Number(value ?? 0).toLocaleString("es-CR")}`;
}

function fechaCorta(value) {
  return value ? new Date(value).toLocaleDateString("es-CR") : "—";
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { productos, stockBajo } = useProductos();
  const { clientes, clientesConDeuda } = useClientes();
  const { ordenes, ordenesPendientes, ordenesPorCobrar, fetchOrdenes } =
    useOrdenes();
  const { pagos, fetchPagos, fetchResumen: fetchResumenPagos } = usePagos();
  const { movimientos, fetchMovimientos } = useInventario();

  const pagosPorOrden = pagos.reduce((totales, pago) => {
    if (pago.orden_id) {
      totales[pago.orden_id] =
        (totales[pago.orden_id] ?? 0) + Number(pago.monto);
    }
    return totales;
  }, {});
  const totalPorCobrar =
    ordenesPorCobrar?.reduce(
      (total, orden) =>
        total +
        Math.max(0, Number(orden.total) - (pagosPorOrden[orden.id] ?? 0)),
      0,
    ) ?? 0;
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const cobradoEsteMes = pagos.reduce((total, pago) => {
    return new Date(pago.fecha_pago) >= inicioMes
      ? total + Number(pago.monto)
      : total;
  }, 0);
  const hoy = new Date().toLocaleDateString("en-CA");
  const movimientosHoy = movimientos.filter((movimiento) =>
    String(movimiento.fecha ?? "").startsWith(hoy),
  ).length;
  const hayAlertas =
    stockBajo.length > 0 ||
    clientesConDeuda.length > 0;

  const actualizarDashboard = async () => {
    await Promise.all([
      fetchOrdenes(),
      fetchPagos(),
      fetchResumenPagos(),
      fetchMovimientos(),
    ]);
  };

  const fecha = new Date().toLocaleDateString("es-CR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-welcome">Hola, {user?.nombre} 👋</p>
          <h1>Panel de control</h1>
        </div>
        <div className="dashboard-meta">
          <p>{fecha}</p>
          <div className="dashboard-header-actions">
            <button
              className="btn-refresh"
              onClick={actualizarDashboard}
              title="Actualizar datos"
            >
              <IconRefresh /> Actualizar
            </button>
            <button className="btn-logout" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="dashboard-main-grid">
        {/* Left: alertas + stats */}
        <div className="dashboard-summary">
          {hayAlertas && (
            <div className="alertas-section">
              <h2>Alertas activas</h2>
              <div className="alertas-grid">
                {stockBajo.length > 0 && (
                  <AlertaCard
                    type="warning"
                    icon="📦"
                    count={stockBajo.length}
                    label="con stock bajo"
                  />
                )}
                {clientesConDeuda.length > 0 && (
                  <div className="alerta alerta-info">
                    <span className="alerta-icon">💰</span>
                    <div>
                      <strong>{clientesConDeuda.length} clientes</strong>
                      <p>con deuda pendiente</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="stats-grid">
            <StatCard
              type="box"
              value={productos?.length ?? 0}
              label="Productos activos"
            />
            <StatCard
              type="users"
              value={clientes?.length ?? 0}
              label="Clientes registrados"
            />
            <StatCard
              type="clip"
              value={ordenesPendientes?.length ?? 0}
              label="Órdenes pendientes"
            />
            <StatCard
              type="card"
              value={moneda(cobradoEsteMes)}
              label="Cobrado este mes"
            />
            <StatCard
              type="alert"
              value={moneda(totalPorCobrar)}
              label="Saldo por cobrar"
            />
            <StatCard
              type="refresh"
              value={movimientosHoy}
              label="Movimientos hoy"
            />
          </div>
        </div>

        {/*
        Right: widget / gráfico
        <div className="dashboard-graph-card">
          <div className="widget-card">
            <div className="widget-card-header">
              <div>
                <p>Analítica</p>
                <h2>Próximamente</h2>
              </div>
              <span className="badge badge-info">Nuevo</span>
            </div>
            <div className="widget-card-body">
              <p>
                Aquí podrás visualizar ventas, ingresos y rotación de inventario
                con gráficos interactivos.
              </p>
              <div className="placeholder-chart">
                <span>
                  <IconChart /> &nbsp;Gráficos en desarrollo
                </span>
              </div>
            </div>
          </div>
        </div>
        */}
      </div>

      {/* ── Órdenes recientes ── */}
      <div className="recent-section">
        <div className="section-header">
          <h2>
            <IconList />
            Órdenes recientes
          </h2>
          <button className="btn-link">Ver todas →</button>
        </div>

        {ordenes?.length === 0 ? (
          <p className="empty-msg">No hay órdenes registradas aún.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ordenes?.slice(0, 8).map((orden) => (
                <tr key={orden.id}>
                  <td className="muted">#{orden.id}</td>
                  <td>{orden.cliente_nombre ?? "Sin cliente"}</td>
                  <td style={{ fontWeight: 600 }}>{moneda(orden.total)}</td>
                  <td>
                    <EstadoBadge value={orden.estado_pago} prefix="pago-" />
                  </td>
                  <td className="muted">{fechaCorta(orden.fecha_creacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Actividad reciente (pagos + movimientos) ── */}
      <div className="activity-grid">
        <div className="activity-section">
          <div className="section-header">
            <h2>
              <IconCard />
              Pagos recientes
            </h2>
            <span className="section-count">{pagos.length}</span>
          </div>
          {pagos.length === 0 ? (
            <p className="empty-msg">No hay pagos registrados aún.</p>
          ) : (
            <div className="activity-list">
              {pagos.slice(0, 5).map((pago) => (
                <div className="activity-row" key={pago.id}>
                  <div>
                    <strong>
                      {pago.cliente_nombre ?? "Cliente sin nombre"}
                    </strong>
                    <span>
                      Orden #{pago.orden_id} · {pago.metodo_pago}
                    </span>
                  </div>
                  <div className="activity-value">
                    <strong>{moneda(pago.monto)}</strong>
                    <span>{fechaCorta(pago.fecha_pago)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="activity-section">
          <div className="section-header">
            <h2>
              <IconActivity />
              Movimientos recientes
            </h2>
            <span className="section-count">{movimientos.length}</span>
          </div>
          {movimientos.length === 0 ? (
            <p className="empty-msg">No hay movimientos registrados aún.</p>
          ) : (
            <div className="activity-list">
              {movimientos.slice(0, 5).map((movimiento) => (
                <div className="activity-row" key={movimiento.id}>
                  <div>
                    <strong>
                      {movimiento.producto_nombre ?? "Producto sin nombre"}
                    </strong>
                    <span>
                      {movimiento.observaciones || "Sin observaciones"}
                    </span>
                  </div>
                  <div className="activity-value">
                    <strong className={`movement-${movimiento.tipo}`}>
                      {movimiento.tipo === "entrada" ? "+" : "-"}
                      {movimiento.cantidad}
                    </strong>
                    <span>{fechaCorta(movimiento.fecha)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
