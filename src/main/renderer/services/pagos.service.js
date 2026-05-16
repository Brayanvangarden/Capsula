export const pagosService = {

  /**
   * @param {Object} filtros - { cliente_id, orden_id, fecha_desde, fecha_hasta }
   */
  getAll: async (filtros = {}) => {
    const res = await window.api.pagos.getAll(filtros)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getById: async (id) => {
    const res = await window.api.pagos.getById(id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  /**
   * Registrar pago
   * @param {{
   *   cliente_id: number,
   *   orden_id?: number,
   *   monto: number,
   *   metodo_pago: 'efectivo'|'transferencia'|'sinpe'|'otro',
   *   notas?: string,
   *   usuario_id: number
   * }} data
   */
  create: async (data) => {
    const res = await window.api.pagos.create(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getHistorialCliente: async (clienteId) => {
    const res = await window.api.pagos.historialCliente(clienteId)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getResumen: async () => {
    const res = await window.api.pagos.resumen()
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

}
