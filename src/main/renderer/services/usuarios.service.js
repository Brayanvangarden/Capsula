export const usuariosService = {

  getAll: async () => {
    const res = await window.api.usuarios.getAll()
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  getById: async (id) => {
    const res = await window.api.usuarios.getById(id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  create: async (data) => {
    const res = await window.api.usuarios.create(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  update: async (data) => {
    const res = await window.api.usuarios.update(data)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  changePassword: async (id, password) => {
    const res = await window.api.usuarios.changePassword({ id, password })
    if (!res.ok) throw new Error(res.message)
    return res
  },

  toggleEstado: async (id) => {
    const res = await window.api.usuarios.toggleEstado(id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

}
