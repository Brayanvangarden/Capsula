export const categoriasService = {

  getAll: async () => {
    const res = await window.api.categorias.getAll()
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getActivas: async () => {
    const res = await window.api.categorias.getActivas()
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getById: async (id) => {
    const res = await window.api.categorias.getById(id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  create: async (data) => {
    const res = await window.api.categorias.create(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  update: async (data) => {
    const res = await window.api.categorias.update(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  delete: async (id) => {
    const res = await window.api.categorias.delete(id)
    if (!res.ok) throw new Error(res.message)
    return res
  },

}
