import { useMemo } from 'react'
import { useClientes } from '../hooks/useClientes'
import { useOrdenes } from '../hooks/useOrdenes'
import { usePagos } from '../hooks/usePagos'

function Reportes() {
  const { clientes, loading: loadingClientes } = useClientes()
  const { ordenes, resumen: resumenOrdenes, loading: loadingOrdenes } = useOrdenes()
  const { pagos, resumen: resumenPagos, loading: loadingPagos } = usePagos()

  const clientesConDeuda = useMemo(
    () => clientes.filter((cliente) => Number(cliente.balance_pendiente) > 0),
    [clientes]
  )

  const topClientes = useMemo(
    () => [...clientes]
      .sort((a, b) => (Number(b.balance_pendiente) || 0) - (Number(a.balance_pendiente) || 0))
      .slice(0, 5),
    [clientes]
  )

  const ordenesRecientes = useMemo(
    () => ordenes.slice(0, 5),
    [ordenes]
  )

  const pagosRecientes = useMemo(
    () => pagos.slice(0, 5),
    [pagos]
  )

  if (loadingClientes || loadingOrdenes || loadingPagos) {
    return <div className="page-loading">Cargando reportes…</div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📊 Reportes</h1>
          <p>Resumen general de clientes, órdenes y pagos.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🧾</div>
          <div>
            <h3>{resumenOrdenes?.total_ordenes ?? 0}</h3>
            <p>Órdenes totales</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div>
            <h3>₡{Number(resumenOrdenes?.monto_total ?? 0).toLocaleString('es-CR')}</h3>
            <p>Total facturado</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <h3>₡{Number(resumenOrdenes?.pendiente_cobro ?? 0).toLocaleString('es-CR')}</h3>
            <p>Pendiente por cobrar</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div>
            <h3>{resumenPagos?.total_pagos ?? 0}</h3>
            <p>Pagos registrados</p>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <section className="panel-card">
          <h2>Clientes con deuda</h2>
          {clientesConDeuda.length === 0 ? (
            <p className="empty-msg">No hay clientes con deuda pendiente.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Empresa</th>
                    <th>Deuda</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesConDeuda.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.nombre}</td>
                      <td>{cliente.empresa || '—'}</td>
                      <td>₡{Number(cliente.balance_pendiente || 0).toLocaleString('es-CR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel-card">
          <h2>Top 5 clientes</h2>
          {topClientes.length === 0 ? (
            <p className="empty-msg">No hay clientes registrados.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Deuda</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {topClientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.nombre}</td>
                      <td>₡{Number(cliente.balance_pendiente || 0).toLocaleString('es-CR')}</td>
                      <td>{cliente.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="reports-grid">
        <section className="panel-card">
          <h2>Órdenes recientes</h2>
          {ordenesRecientes.length === 0 ? (
            <p className="empty-msg">No se han registrado órdenes aún.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesRecientes.map((orden) => (
                    <tr key={orden.id}>
                      <td>{orden.id}</td>
                      <td>{orden.cliente_nombre}</td>
                      <td>₡{Number(orden.total || 0).toLocaleString('es-CR')}</td>
                      <td>{orden.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel-card">
          <h2>Pagos recientes</h2>
          {pagosRecientes.length === 0 ? (
            <p className="empty-msg">No se han registrado pagos aún.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Monto</th>
                    <th>Método</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosRecientes.map((pago) => (
                    <tr key={pago.id}>
                      <td>{pago.id}</td>
                      <td>{pago.cliente_nombre}</td>
                      <td>₡{Number(pago.monto || 0).toLocaleString('es-CR')}</td>
                      <td>{pago.metodo_pago}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Reportes
