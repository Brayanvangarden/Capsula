import { useAuth }       from '../hooks/useAuth'
import { useProductos }  from '../hooks/useProductos'
import { useClientes }   from '../hooks/useClientes'
import { useOrdenes }    from '../hooks/useOrdenes'
import { usePagos }      from '../hooks/usePagos'
import { useInventario } from '../hooks/useInventario'

function Dashboard() {
  const { user }                        = useAuth()
  const { productos, stockBajo, proximosVencer } = useProductos()
  const { clientes, clientesConDeuda }  = useClientes()
  const { ordenes, pendientes, porCobrar } = useOrdenes()
  const { resumen: resumenPagos }       = usePagos()
  const { resumen: resumenInventario }  = useInventario()

  return (
    <div className="dashboard">

      {/* Header de bienvenida */}
      <div className="dashboard-header">
        <h1>👋 Bienvenido, {user?.nombre}</h1>
        <p className="fecha">{new Date().toLocaleDateString('es-CR', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}</p>
      </div>

      {/* ── Alertas ── */}
      {(stockBajo.length > 0 || proximosVencer.length > 0 || clientesConDeuda.length > 0) && (
        <div className="alertas-section">
          <h2>🚨 Alertas</h2>
          <div className="alertas-grid">
            {stockBajo.length > 0 && (
              <div className="alerta alerta-warning">
                <span className="alerta-icon">📦</span>
                <div>
                  <strong>{stockBajo.length} productos</strong>
                  <p>con stock bajo</p>
                </div>
              </div>
            )}
            {proximosVencer.length > 0 && (
              <div className="alerta alerta-danger">
                <span className="alerta-icon">⏰</span>
                <div>
                  <strong>{proximosVencer.length} productos</strong>
                  <p>próximos a vencer</p>
                </div>
              </div>
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

      {/* ── Tarjetas de resumen ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{productos?.length ?? 0}</h3>
            <p>Productos activos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{clientes?.length ?? 0}</h3>
            <p>Clientes registrados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{pendientes?.length ?? 0}</h3>
            <p>Órdenes pendientes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>₡{resumenPagos?.totalMes?.toLocaleString('es-CR') ?? 0}</h3>
            <p>Cobrado este mes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>₡{porCobrar?.reduce((acc, o) => acc + o.total, 0)
                    .toLocaleString('es-CR') ?? 0}</h3>
            <p>Por cobrar</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <h3>{resumenInventario?.movimientosHoy ?? 0}</h3>
            <p>Movimientos hoy</p>
          </div>
        </div>
      </div>

      {/* ── Órdenes recientes ── */}
      <div className="recent-section">
        <h2>📋 Órdenes recientes</h2>
        {ordenes?.length === 0 ? (
          <p className="empty-msg">No hay órdenes registradas aún.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ordenes?.slice(0, 8).map(orden => (
                <tr key={orden.id}>
                  <td>{orden.id}</td>
                  <td>{orden.clienteNombre}</td>
                  <td>₡{orden.total?.toLocaleString('es-CR')}</td>
                  <td>
                    <span className={`badge badge-${orden.estado}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-pago-${orden.estadoPago}`}>
                      {orden.estadoPago}
                    </span>
                  </td>
                  <td>{new Date(orden.fecha).toLocaleDateString('es-CR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}

export default Dashboard
