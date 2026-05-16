export const ordenesService = {

  /**
   * @param {Object} filtros - { cliente_id, estado, estado_pago, fecha_desde, fecha_hasta }
   */
  getAll: async (filtros = {}) => {
    const res = await window.api.ordenes.getAll(filtros)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getById: async (id) => {
    const res = await window.api.ordenes.getById(id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  /**
   * Crear orden con detalle
   * @param {{
   *   cliente_id: number,
   *   fecha_entrega: string,
   *   notas: string,
   *   usuario_id: number,
   *   detalle: Array<{ producto_id, cantidad, precio_unitario, subtotal }>
   * }} data
   */
  create: async (data) => {
    const res = await window.api.ordenes.create(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  updateEstado: async (id, estado) => {
    const res = await window.api.ordenes.updateEstado(id, estado)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  updateEstadoPago: async (id, estadoPago) => {
    const res = await window.api.ordenes.updateEstadoPago(id, estadoPago)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getResumen: async () => {
    const res = await window.api.ordenes.resumen()
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

}
