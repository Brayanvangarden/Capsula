const normalizeProductoFromDb = (producto) => ({
  ...producto,
  precio: producto.precio_unitario,
  costo: producto.costo ?? '',
  stock: producto.cantidad,
  stockMinimo: producto.stock_minimo,
  categoriaId: producto.categoria_id,
  descripcion: producto.notas ?? '',
  fechaVencimiento: producto.fecha_vencimiento,
})

const mapProductoToDb = (data) => ({
  nombre: data.nombre,
  categoria_id: data.categoriaId || null,
  cantidad: data.stock ?? 0,
  cantidad_paquete: data.cantidad_paquete ?? 1,
  numero_lote: data.numero_lote ?? null,
  cantidad_lote: data.cantidad_lote ?? 0,
  precio_unitario: data.precio ?? 0,
  stock_minimo: data.stockMinimo ?? 0,
  material: data.material ?? null,
  color: data.color ?? null,
  fecha_vencimiento: data.fechaVencimiento || null,
  estado: data.estado ?? 'activo',
  notas: data.descripcion ?? '',
})

const normalizeList = (productos = []) => productos.map(normalizeProductoFromDb)

export const productosService = {

  getAll: async () => {
    const res = await window.api.productos.getAll()
    if (!res.ok) throw new Error(res.message)
    return normalizeList(res.data)
  },

  getById: async (id) => {
    const res = await window.api.productos.getById(id)
    if (!res.ok) throw new Error(res.message)
    return normalizeProductoFromDb(res.data)
  },

  create: async (data) => {
    const res = await window.api.productos.create(mapProductoToDb(data))
    if (!res.ok) throw new Error(res.message)
    return normalizeProductoFromDb(res.data)
  },

  update: async (data) => {
    const res = await window.api.productos.update({ ...data, ...mapProductoToDb(data) })
    if (!res.ok) throw new Error(res.message)
    return normalizeProductoFromDb(res.data)
  },

  delete: async (id) => {
    const res = await window.api.productos.delete(id)
    if (!res.ok) throw new Error(res.message)
    return res
  },

  getStockBajo: async () => {
    const res = await window.api.productos.stockBajo()
    if (!res.ok) throw new Error(res.message)
    return normalizeList(res.data)
  },

  getProximosVencer: async (dias = 30) => {
    const res = await window.api.productos.proximosVencer(dias)
    if (!res.ok) throw new Error(res.message)
    return normalizeList(res.data)
  },

}
