import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useOrdenes } from '../hooks/useOrdenes'
import { useClientes } from '../hooks/useClientes'
import { useProductos } from '../hooks/useProductos'

const NUEVA_LINEA = { productoId: '', cantidad: '1', precio: '0' }

function Ordenes() {
  const { user } = useAuth()
  const {
    ordenes,
    ordenesPendientes,
    ordenesPorCobrar,
    ordenesEnProceso,
    resumen,
    loading,
    error,
    crearOrden,
    cambiarEstado,
    cambiarEstadoPago,
  } = useOrdenes()

  const { clientes } = useClientes()
  const { productosActivos } = useProductos()

  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ clienteId: '', fechaEntrega: '', notas: '' })
  const [lineas, setLineas] = useState([NUEVA_LINEA])
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState('')

  const ordenarVisible = useMemo(() => {
    let lista = ordenes

    if (filtro === 'pendiente') lista = lista.filter((o) => o.estado === 'pendiente')
    if (filtro === 'en_proceso') lista = lista.filter((o) => o.estado === 'en_proceso')
    if (filtro === 'pagado') lista = lista.filter((o) => o.estado_pago === 'pagado')

    if (!busqueda) return lista

    const q = busqueda.toLowerCase()
    return lista.filter((o) =>
      String(o.id).includes(q) ||
      o.cliente_nombre?.toLowerCase().includes(q) ||
      o.cliente_empresa?.toLowerCase().includes(q) ||
      o.estado?.toLowerCase().includes(q) ||
      o.estado_pago?.toLowerCase().includes(q)
    )
  }, [ordenes, filtro, busqueda])

  const actualizarLinea = (index, cambios) => {
    setLineas((prev) => prev.map((linea, i) => i === index ? { ...linea, ...cambios } : linea))
  }

  const agregarLinea = () => setLineas((prev) => [...prev, NUEVA_LINEA])

  const removerLinea = (index) => setLineas((prev) => prev.filter((_, i) => i !== index))

  const lineasValidas = lineas.filter((linea) => linea.productoId && Number(linea.cantidad) > 0)

  const totalOrden = lineasValidas.reduce(
    (acc, linea) => acc + Number(linea.precio) * Number(linea.cantidad),
    0
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMensaje('')

    if (!form.clienteId) {
      setMensaje('Selecciona un cliente para la orden.')
      return
    }

    if (lineasValidas.length === 0) {
      setMensaje('Agrega al menos un producto a la orden.')
      return
    }

    const detalle = lineasValidas.map((linea) => ({
      producto_id: Number(linea.productoId),
      cantidad: Number(linea.cantidad),
      precio_unitario: Number(linea.precio),
      subtotal: Number(linea.precio) * Number(linea.cantidad),
    }))

    const respuesta = await crearOrden({
      cliente_id: Number(form.clienteId),
      fecha_entrega: form.fechaEntrega || null,
      notas: form.notas,
      usuario_id: user?.id,
      detalle,
    })

    if (!respuesta.ok) {
      setMensaje(respuesta.message || 'No se pudo crear la orden.')
      return
    }

    setModal(false)
    setForm({ clienteId: '', fechaEntrega: '', notas: '' })
    setLineas([NUEVA_LINEA])
    setMensaje('Orden creada correctamente.')
  }

  const actualizarEstadoOrden = async (orden) => {
    const siguienteEstado = orden.estado === 'pendiente'
      ? 'en_proceso'
      : orden.estado === 'en_proceso'
        ? 'completada'
        : orden.estado

    if (siguienteEstado !== orden.estado) {
      await cambiarEstado(orden.id, siguienteEstado)
    }
  }

  const actualizarEstadoPago = async (orden) => {
    const siguientePago = orden.estado_pago === 'pagado' ? 'pendiente' : 'pagado'
    await cambiarEstadoPago(orden.id, siguientePago)
  }

  if (loading) return <div className="page-loading">Cargando órdenes…</div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🧾 Órdenes</h1>
          <p>{ordenes.length} órdenes registradas</p>
        </div>
        <button className="btn-primary" onClick={() => { setModal(true); setMensaje('') }}>
          + Nueva orden
        </button>
      </div>

      <div className="alertas-row">
        <div className="card-card">
          <strong>{ordenesPendientes.length}</strong>
          <p>Ordenes pendientes</p>
        </div>
        <div className="card-card">
          <strong>{ordenesEnProceso.length}</strong>
          <p>En proceso</p>
        </div>
        <div className="card-card">
          <strong>{ordenesPorCobrar.length}</strong>
          <p>Por cobrar</p>
        </div>
        <div className="card-card">
          <strong>₡{Number(resumen?.monto_total ?? 0).toLocaleString('es-CR')}</strong>
          <p>Total facturado</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar por ID, cliente o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="filtros">
          {['todos', 'pendiente', 'en_proceso', 'pagado'].map((item) => (
            <button
              key={item}
              type="button"
              className={`btn-filtro ${filtro === item ? 'active' : ''}`}
              onClick={() => setFiltro(item)}
            >
              {item === 'todos' ? 'Todos' : item === 'pendiente' ? 'Pendiente' : item === 'en_proceso' ? 'En proceso' : 'Pagado'}
            </button>
          ))}
        </div>
      </div>

      {ordenarVisible.length === 0 ? (
        <p className="empty-msg">No hay órdenes que coincidan con el filtro.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenarVisible.map((orden) => (
                <tr key={orden.id}>
                  <td>{orden.id}</td>
                  <td>
                    <strong>{orden.cliente_nombre ?? 'Sin cliente'}</strong>
                    <br />
                    <small>{orden.cliente_empresa ?? '—'}</small>
                  </td>
                  <td>₡{Number(orden.total ?? 0).toLocaleString('es-CR')}</td>
                  <td>
                    <span className={`badge badge-${orden.estado === 'pendiente' ? 'warning' : orden.estado === 'en_proceso' ? 'info' : 'success'}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${orden.estado_pago === 'pagado' ? 'success' : orden.estado_pago === 'parcial' ? 'warning' : 'danger'}`}>
                      {orden.estado_pago}
                    </span>
                  </td>
                  <td>{orden.fecha_creacion ? new Date(orden.fecha_creacion).toLocaleDateString('es-CR') : '—'}</td>
                  <td className="actions">
                    {(orden.estado === 'pendiente' || orden.estado === 'en_proceso') && (
                      <button className="btn-secondary" type="button" onClick={() => actualizarEstadoOrden(orden)}>
                        {orden.estado === 'pendiente' ? 'Iniciar' : 'Completar'}
                      </button>
                    )}
                    <button className="btn-secondary" type="button" onClick={() => actualizarEstadoPago(orden)}>
                      {orden.estado_pago === 'pagado' ? 'Marcar pendiente' : 'Marcar pagado'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva orden</h2>
              <button className="modal-close" type="button" onClick={() => setModal(false)}>
                ✕
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  required
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.empresa ? `- ${cliente.empresa}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha de entrega</label>
                <input
                  type="date"
                  value={form.fechaEntrega}
                  onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notas</label>
                <textarea
                  rows={3}
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                />
              </div>

              <div className="settings-section">
                <h3>Detalle de productos</h3>
                {lineas.map((linea, index) => {
                  const producto = productosActivos.find((item) => String(item.id) === linea.productoId)
                  return (
                    <div key={index} className="product-row">
                      <div className="form-group">
                        <label>Producto</label>
                        <select
                          required
                          value={linea.productoId}
                          onChange={(e) => {
                            const valor = e.target.value
                            const prod = productosActivos.find((item) => String(item.id) === valor)
                            actualizarLinea(index, {
                              productoId: valor,
                              precio: prod ? String(prod.precio) : '0',
                            })
                          }}
                        >
                          <option value="">Selecciona un producto</option>
                          {productosActivos.map((productoItem) => (
                            <option key={productoItem.id} value={productoItem.id}>
                              {productoItem.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Cantidad</label>
                        <input
                          required
                          type="number"
                          min="1"
                          value={linea.cantidad}
                          onChange={(e) => actualizarLinea(index, { cantidad: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Precio unitario</label>
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={linea.precio}
                          onChange={(e) => actualizarLinea(index, { precio: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Subtotal</label>
                        <input
                          type="text"
                          readOnly
                          value={`₡${(Number(linea.precio) * Number(linea.cantidad)).toLocaleString('es-CR')}`}
                        />
                      </div>
                      <button type="button" className="btn-secondary" onClick={() => removerLinea(index)}>
                        Eliminar
                      </button>
                    </div>
                  )
                })}
                <button type="button" className="btn-primary" onClick={agregarLinea}>
                  + Agregar producto
                </button>
              </div>

              <div className="form-group">
                <label>Total orden</label>
                <div className="order-total">₡{totalOrden.toLocaleString('es-CR')}</div>
              </div>
              {mensaje && <p className="message-success">{mensaje}</p>}

              <div className="modal-footer">
                <button className="btn-secondary" type="button" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button className="btn-primary" type="submit">
                  Guardar orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ordenes
