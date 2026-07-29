const normalizeCliente = (cliente = {}) => ({
  ...cliente,
  empresa: cliente.empresa ?? '',
  nombre: cliente.nombre ?? '',
  apellido: cliente.apellido ?? '',
  cedula: cliente.cedula ?? '',
  telefono: cliente.telefono ?? '',
  correo: cliente.correo ?? '',
  direccion: cliente.direccion ?? '',
  notas: cliente.notas ?? '',
  balance_pendiente: Number(cliente.balance_pendiente ?? 0),
  estado: cliente.estado ?? 'activo',
})

const normalizePayload = (data = {}) => ({
  ...data,
  empresa: data.empresa ?? '',
  nombre: data.nombre ?? '',
  apellido: data.apellido ?? '',
  cedula: data.cedula ?? '',
  telefono: data.telefono ?? '',
  correo: data.correo ?? '',
  direccion: data.direccion ?? '',
  notas: data.notas ?? '',
  balance_pendiente: Number(data.balance_pendiente ?? 0),
  estado: data.estado ?? 'activo',
})

export const clientesService = {

  getAll: async (includeInactive = false) => {
    const res = await window.api.clientes.getAll(includeInactive)
    if (!res.ok) throw new Error(res.message)
    return (res.data ?? []).map(normalizeCliente)
  },

  getById: async (id) => {
    const res = await window.api.clientes.getById(id)
    if (!res.ok) {
      if (res.message === 'Cliente no encontrado') return null
      throw new Error(res.message)
    }
    return normalizeCliente(res.data)
  },

  create: async (data) => {
    const payload = normalizePayload(data)
    const res = await window.api.clientes.create(payload)
    if (!res.ok) throw new Error(res.message)
    return normalizeCliente(res.data)
  },

  update: async (data) => {
    const payload = normalizePayload(data)
    const res = await window.api.clientes.update(payload)
    if (!res.ok) throw new Error(res.message)
    return normalizeCliente(res.data)
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
    return {
      ...res,
      data: res.data ? normalizeCliente(res.data) : null,
    }
  },

  updateBalance: async (id, monto) => {
    const res = await window.api.clientes.updateBalance(id, monto)
    if (!res.ok) throw new Error(res.message)
    return res
  },

}
