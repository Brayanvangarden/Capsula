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
