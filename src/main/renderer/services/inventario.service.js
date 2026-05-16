export const inventarioService = {

  /**
   * @param {Object} filtros - { producto_id, tipo, fecha_desde, fecha_hasta }
   */
  getMovimientos: async (filtros = {}) => {
    const res = await window.api.inventario.getMovimientos(filtros)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getById: async (id) => {
    const res = await window.api.inventario.getById(id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  /**
   * Registrar entrada de stock
   * @param {{ producto_id, cantidad, observaciones, usuario_id }} data
   */
  registrarEntrada: async (data) => {
    const res = await window.api.inventario.entrada(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  /**
   * Registrar salida de stock
   * @param {{ producto_id, cantidad, observaciones, usuario_id }} data
   */
  registrarSalida: async (data) => {
    const res = await window.api.inventario.salida(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getResumenProducto: async (producto_id) => {
    const res = await window.api.inventario.resumenProducto(producto_id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

}
