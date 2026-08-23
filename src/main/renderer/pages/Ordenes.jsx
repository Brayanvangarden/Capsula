import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useOrdenes } from "../hooks/useOrdenes";
import { useClientes } from "../hooks/useClientes";
import { useProductos } from "../hooks/useProductos";
import { usePagos } from "../hooks/usePagos";
import { clientesService } from "../services/clientes.service";
import { ordenesService } from "../services/ordenes.service";

const NUEVA_LINEA = { productoId: "", cantidad: "1", precio: "0" };

function Ordenes() {
  const { user } = useAuth();
  const {
    ordenes,
    ordenesPendientes,
    ordenesPorCobrar,
    ordenesEnProceso,
    resumen,
    loading,
    error,
    crearOrden,
    actualizarOrden,
    cambiarEstado,
  } = useOrdenes();

  const { clientes } = useClientes();
  const { productosActivos } = useProductos();
  const { pagos } = usePagos();

  const [modal, setModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    clienteId: "",
    fechaEntrega: "",
    notas: "",
  });
  const [lineas, setLineas] = useState([NUEVA_LINEA]);
  const [filtroPago, setFiltroPago] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Auto-limpia el mensaje
  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => setMensaje(""), 3000);
    return () => clearTimeout(timer);
  }, [mensaje]);

  const clienteSeleccionado = useMemo(
    () => clientes.find((c) => String(c.id) === form.clienteId),
    [clientes, form.clienteId],
  );

  const descuentoPorcentaje = clienteSeleccionado?.tiene_descuento
    ? Number(clienteSeleccionado.descuento_porcentaje ?? 0)
    : 0;

  // Calcula, por orden, cuánto se ha pagado y cuánto falta —
  // usando el historial real de pagos, no un simple flag.
  const saldoPorOrden = useMemo(() => {
    const mapa = new Map();
    for (const orden of ordenes) {
      const totalPagado = pagos
        .filter((pago) => String(pago.orden_id) === String(orden.id))
        .reduce((total, pago) => total + Number(pago.monto), 0);
      mapa.set(orden.id, {
        totalPagado,
        saldoPendiente: Math.max(0, Number(orden.total) - totalPagado),
      });
    }
    return mapa;
  }, [ordenes, pagos]);

  const ordenarVisible = useMemo(() => {
    let lista = ordenes;

    if (filtroPago !== "todos") {
      lista = lista.filter((o) => o.estado_pago === filtroPago);
    }

    if (!busqueda) return lista;

    const q = busqueda.toLowerCase();
    return lista.filter(
      (o) =>
        String(o.id).includes(q) ||
        o.cliente_nombre?.toLowerCase().includes(q) ||
        o.cliente_empresa?.toLowerCase().includes(q) ||
        o.estado?.toLowerCase().includes(q) ||
        o.estado_pago?.toLowerCase().includes(q),
    );
  }, [ordenes, filtroPago, busqueda]);

  const actualizarLinea = (index, cambios) => {
    setLineas((prev) =>
      prev.map((linea, i) => (i === index ? { ...linea, ...cambios } : linea)),
    );
  };

  const handleProductoSelect = async (index, productoId) => {
    const producto = productosActivos.find(
      (item) => String(item.id) === productoId,
    );
    const precioInicial = producto ? String(producto.precio) : "0";

    actualizarLinea(index, { productoId, precio: precioInicial });

    if (!form.clienteId || !producto) return;

    const precioEspecial = await clientesService.getPrecioEspecial(
      Number(form.clienteId),
      producto.id,
    );

    if (precioEspecial != null) {
      actualizarLinea(index, { precio: String(precioEspecial) });
    }
  };

  const agregarLinea = () => setLineas((prev) => [...prev, NUEVA_LINEA]);
  const removerLinea = (index) =>
    setLineas((prev) => prev.filter((_, i) => i !== index));

  const lineasValidas = lineas.filter(
    (linea) => linea.productoId && Number(linea.cantidad) > 0,
  );

  const subtotalOrden = lineasValidas.reduce(
    (acc, linea) => acc + Number(linea.precio) * Number(linea.cantidad),
    0,
  );
  const descuentoMonto = subtotalOrden * (descuentoPorcentaje / 100);
  const totalOrden = subtotalOrden - descuentoMonto;

  useEffect(() => {
    if (!form.clienteId) return;
    const clienteId = Number(form.clienteId);
    const actualizarPrecios = async () => {
      const nuevasLineas = await Promise.all(
        lineas.map(async (linea) => {
          if (!linea.productoId) return linea;
          const precioEspecial = await clientesService.getPrecioEspecial(
            clienteId,
            Number(linea.productoId),
          );
          if (precioEspecial != null) {
            return { ...linea, precio: String(precioEspecial) };
          }
          return linea;
        }),
      );
      setLineas(nuevasLineas);
    };
    actualizarPrecios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.clienteId]);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm({ clienteId: "", fechaEntrega: "", notas: "" });
    setLineas([NUEVA_LINEA]);
    setMensaje("");
    setModal(true);
  };

  const abrirEditar = async (orden) => {
    try {
      setMensaje("");
      const ordenData = await ordenesService.getById(orden.id);
      const detalle = ordenData.detalle.map((item) => ({
        productoId: String(item.producto_id),
        cantidad: String(item.cantidad),
        precio: String(item.precio_unitario),
      }));

      setEditandoId(orden.id);
      setForm({
        clienteId: String(ordenData.cliente_id),
        fechaEntrega: ordenData.fecha_entrega || "",
        notas: ordenData.notas || "",
      });
      setLineas(detalle.length ? detalle : [NUEVA_LINEA]);
      setModal(true);
    } catch (err) {
      setMensaje(err.message || "No se pudo cargar la orden.");
    }
  };

  const cerrarModal = () => {
    setModal(false);
    setEditandoId(null);
    setForm({ clienteId: "", fechaEntrega: "", notas: "" });
    setLineas([NUEVA_LINEA]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje("");

    if (!form.clienteId) {
      setMensaje("Selecciona un cliente para la orden.");
      return;
    }
    if (lineasValidas.length === 0) {
      setMensaje("Agrega al menos un producto a la orden.");
      return;
    }

    const excedeStock = lineasValidas.find((linea) => {
      const producto = productosActivos.find(
        (p) => String(p.id) === linea.productoId,
      );
      return producto && Number(linea.cantidad) > Number(producto.cantidad);
    });

    if (excedeStock) {
      const producto = productosActivos.find(
        (p) => String(p.id) === excedeStock.productoId,
      );
      setMensaje(
        `La cantidad solicitada de ${producto?.nombre || "el producto"} excede el stock disponible.`,
      );
      return;
    }

    setGuardando(true);
    try {
      const detalle = lineasValidas.map((linea) => ({
        producto_id: Number(linea.productoId),
        cantidad: Number(linea.cantidad),
        precio_unitario: Number(linea.precio),
        subtotal: Number(linea.precio) * Number(linea.cantidad),
      }));

      if (editandoId) {
        const respuesta = await actualizarOrden(editandoId, {
          cliente_id: Number(form.clienteId),
          fecha_entrega: form.fechaEntrega || null,
          notas: form.notas,
          usuario_id: user?.id,
          descuento_porcentaje: descuentoPorcentaje,
          detalle,
        });

        if (!respuesta.ok) {
          setMensaje(respuesta.message || "No se pudo actualizar la orden.");
          return;
        }

        cerrarModal();
        setMensaje("Orden actualizada correctamente.");
      } else {
        const respuesta = await crearOrden({
          cliente_id: Number(form.clienteId),
          fecha_entrega: form.fechaEntrega || null,
          notas: form.notas,
          usuario_id: user?.id,
          descuento_porcentaje: descuentoPorcentaje,
          detalle,
        });

        if (!respuesta.ok) {
          setMensaje(respuesta.message || "No se pudo crear la orden.");
          return;
        }

        cerrarModal();
        setMensaje("Orden creada correctamente.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const actualizarEstadoOrden = async (orden) => {
    const siguienteEstado =
      orden.estado === "pendiente"
        ? "en_proceso"
        : orden.estado === "en_proceso"
          ? "completada"
          : orden.estado;

    if (siguienteEstado !== orden.estado) {
      await cambiarEstado(orden.id, siguienteEstado);
    }
  };

  const pillPago = (estadoPago) => {
    if (estadoPago === "pagado") return "pill-si";
    if (estadoPago === "parcial") return "pill-warn";
    return "pill-no"; // pendiente
  };

  if (loading) return <div className="page-loading">Cargando órdenes…</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🧾 Órdenes</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={abrirNuevo}>
            + Nueva orden
          </button>
        </div>
      </div>

      {error && <p className="message-error">{error}</p>}
      {mensaje && !modal && (
        <div className="message-success-banner">✅ {mensaje}</div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🕒</div>
          <div className="stat-info">
            <h3>{ordenesPendientes.length}</h3>
            <p>Órdenes pendientes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <h3>{ordenesEnProceso.length}</h3>
            <p>En proceso</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{ordenesPorCobrar.length}</h3>
            <p>Por cobrar</p>
          </div>
        </div>
      </div>

      <div className="list-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por ID, cliente o estado..."
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

        <div className="filtros-grupo">
          <span className="filtros-label">Estado de pago:</span>
          <div className="filtros">
            {["todos", "pendiente", "parcial", "pagado"].map((item) => (
              <button
                key={item}
                type="button"
                className={`btn-filtro ${filtroPago === item ? "active" : ""}`}
                onClick={() => setFiltroPago(item)}
              >
                {item === "todos" ? "Todos" : item}
              </button>
            ))}
          </div>
        </div>

        {ordenarVisible.length === 0 ? (
          <p className="empty-state">
            No hay órdenes que coincidan con el filtro.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenarVisible.map((orden) => {
                const saldo = saldoPorOrden.get(orden.id);
                return (
                  <tr key={orden.id}>
                    <td>#{orden.id}</td>
                    <td>
                      <strong>{orden.cliente_nombre ?? "Sin cliente"}</strong>
                      {orden.cliente_empresa && (
                        <>
                          <br />
                          <small className="text-muted">
                            {orden.cliente_empresa}
                          </small>
                        </>
                      )}
                    </td>
                    <td>₡{Number(orden.total ?? 0).toLocaleString("es-CR")}</td>
                    <td>
                      <span className={`pill ${pillPago(orden.estado_pago)}`}>
                        {orden.estado_pago}
                      </span>
                      {orden.estado_pago !== "pagado" &&
                        saldo?.saldoPendiente > 0 && (
                          <div className="pago-faltante">
                            Faltan ₡
                            {saldo.saldoPendiente.toLocaleString("es-CR")}
                          </div>
                        )}
                    </td>
                    <td>
                      {orden.fecha_creacion
                        ? new Date(orden.fecha_creacion).toLocaleDateString(
                            "es-CR",
                          )
                        : "—"}
                    </td>
                    <td className="action-buttons">
                      <button
                        className="btn-action-outline"
                        type="button"
                        onClick={() => abrirEditar(orden)}
                      >
                        ✏️ Editar
                      </button>
                      {(orden.estado === "pendiente" ||
                        orden.estado === "en_proceso") && (
                        <button
                          className="btn-action-outline"
                          type="button"
                          onClick={() => actualizarEstadoOrden(orden)}
                        >
                          {orden.estado === "pendiente"
                            ? "Iniciar"
                            : "Completar"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editandoId ? `Editar orden #${editandoId}` : "Nueva orden"}
              </h2>
              <button
                className="modal-close"
                type="button"
                onClick={cerrarModal}
              >
                ✕
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  required
                  value={form.clienteId}
                  onChange={(e) =>
                    setForm({ ...form, clienteId: e.target.value })
                  }
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}{" "}
                      {cliente.empresa ? `- ${cliente.empresa}` : ""}
                      {cliente.tiene_descuento
                        ? ` (−${cliente.descuento_porcentaje}%)`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha de entrega</label>
                <input
                  type="date"
                  value={form.fechaEntrega}
                  onChange={(e) =>
                    setForm({ ...form, fechaEntrega: e.target.value })
                  }
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
                {lineas.map((linea, index) => (
                  <div key={index} className="product-row">
                    <div className="form-group">
                      <label>Producto</label>
                      <select
                        required
                        value={linea.productoId}
                        onChange={(e) =>
                          handleProductoSelect(index, e.target.value)
                        }
                      >
                        <option value="">Selecciona un producto</option>
                        {productosActivos.map((productoItem) => (
                          <option
                            key={productoItem.id}
                            value={productoItem.id}
                            disabled={Number(productoItem.cantidad) <= 0}
                          >
                            {productoItem.nombre}{" "}
                            {productoItem.cantidad <= 0
                              ? "(Agotado)"
                              : `(stock: ${productoItem.cantidad})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Stock disponible</label>
                      <div className="readonly-field">
                        {linea.productoId
                          ? (productosActivos.find(
                              (p) => String(p.id) === linea.productoId,
                            )?.cantidad ?? "—")
                          : "—"}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Cantidad</label>
                      <input
                        required
                        type="number"
                        min="1"
                        max={
                          productosActivos.find(
                            (p) => String(p.id) === linea.productoId,
                          )?.cantidad
                        }
                        value={linea.cantidad}
                        onChange={(e) => {
                          const producto = productosActivos.find(
                            (p) => String(p.id) === linea.productoId,
                          );
                          const stockDisponible = Number(
                            producto?.cantidad ?? 0,
                          );
                          const cantidad = Math.min(
                            Number(e.target.value) || 0,
                            stockDisponible,
                          );
                          actualizarLinea(index, {
                            cantidad: cantidad ? String(cantidad) : "",
                          });
                        }}
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
                        onChange={(e) =>
                          actualizarLinea(index, { precio: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Subtotal</label>
                      <input
                        type="text"
                        readOnly
                        value={`₡${(Number(linea.precio) * Number(linea.cantidad)).toLocaleString("es-CR")}`}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => removerLinea(index)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={agregarLinea}
                >
                  + Agregar producto
                </button>
              </div>

              <div className="orden-resumen">
                <div className="orden-resumen-row">
                  <span>Subtotal</span>
                  <span>₡{subtotalOrden.toLocaleString("es-CR")}</span>
                </div>
                {descuentoPorcentaje > 0 && (
                  <div className="orden-resumen-row orden-resumen-descuento">
                    <span>Descuento cliente ({descuentoPorcentaje}%)</span>
                    <span>−₡{descuentoMonto.toLocaleString("es-CR")}</span>
                  </div>
                )}
                <div className="orden-resumen-row orden-resumen-total">
                  <span>Total orden</span>
                  <span>₡{totalOrden.toLocaleString("es-CR")}</span>
                </div>
              </div>

              {mensaje && modal && <p className="message-error">{mensaje}</p>}

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : editandoId
                      ? "Actualizar orden"
                      : "Guardar orden"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ordenes;
