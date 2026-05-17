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

  const totalPorCobrar = porCobrar?.reduce((acc, o) => acc + o.total, 0) ?? 0

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <p className="dashboard-welcome">👋 Hola, {user?.nombre}</p>
          <h1>Tu panel de control</h1>
        </div>
        <div className="dashboard-meta">
          <p>{new Date().toLocaleDateString('es-CR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}</p>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-summary">
          {(stockBajo.length > 0 || proximosVencer.length > 0 || clientesConDeuda.length > 0) && (
            <div className="alertas-section">
              <h2>🚨 Alertas importantes</h2>
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
                <h3>₡{totalPorCobrar.toLocaleString('es-CR')}</h3>
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
        </div>

        <div className="dashboard-graph-card">
          <div className="widget-card">
            <div className="widget-card-header">
              <div>
                <p>📈 Espacio para gráficos</p>
                <h2>Próximamente</h2>
              </div>
              <span className="badge badge-info">Nuevo</span>
            </div>
            <div className="widget-card-body">
              <p>
                Aquí podrás visualizar indicadores clave como ventas, ingresos y rotación de inventario.
                Por ahora este panel está reservado para futuros gráficos interactivos.
              </p>
              <div className="placeholder-chart">
                <span>Gráficos en desarrollo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
