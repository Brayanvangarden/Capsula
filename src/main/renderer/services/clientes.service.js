export const clientesService = {

  getAll: async () => {
    const res = await window.api.clientes.getAll()
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getById: async (id) => {
    const res = await window.api.clientes.getById(id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  create: async (data) => {
    const res = await window.api.clientes.create(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  update: async (data) => {
    const res = await window.api.clientes.update(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getPrecioEspecial: async (cliente_id, producto_id) => {
    const res = await window.api.clientes.getPrecioEspecial({ cliente_id, producto_id })
    if (!res.ok) throw new Error(res.message)
    return res.data?.precio_unitario ?? null
  },

  getPreciosEspeciales: async () => {
    const res = await window.api.clientes.getPreciosEspeciales()
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getPreciosEspecialesByCliente: async (cliente_id) => {
    const res = await window.api.clientes.getPreciosEspecialesByCliente(cliente_id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  createPrecioEspecial: async (data) => {
    const res = await window.api.clientes.createPrecioEspecial(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  updatePrecioEspecial: async (data) => {
    const res = await window.api.clientes.updatePrecioEspecial(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  deletePrecioEspecial: async (id) => {
    const res = await window.api.clientes.deletePrecioEspecial(id)
    if (!res.ok) throw new Error(res.message)
    return res
  },

  delete: async (id) => {
    const res = await window.api.clientes.delete(id)
    if (!res.ok) throw new Error(res.message)
    return res
  },

  updateBalance: async (id, monto) => {
    const res = await window.api.clientes.updateBalance(id, monto)
    if (!res.ok) throw new Error(res.message)
    return res
  },

}
