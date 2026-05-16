export const productosService = {

  getAll: async () => {
    const res = await window.api.productos.getAll()
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getById: async (id) => {
    const res = await window.api.productos.getById(id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  create: async (data) => {
    const res = await window.api.productos.create(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  update: async (data) => {
    const res = await window.api.productos.update(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  delete: async (id) => {
    const res = await window.api.productos.delete(id)
    if (!res.ok) throw new Error(res.message)
    return res
  },

  getStockBajo: async () => {
    const res = await window.api.productos.stockBajo()
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getProximosVencer: async (dias = 30) => {
    const res = await window.api.productos.proximosVencer(dias)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

}
