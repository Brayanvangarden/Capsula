const { ipcMain }   = require('electron')
const productosRepo = require('../database/repositories/productos.repository')
const { validarProductoImport } = require('../shared/validators/producto.validator')

function registerProductosIpc() {

  // ── Obtener todos ──────────────────────────────────
  ipcMain.handle('productos:getAll', async () => {
    try {
      const data = productosRepo.getAll()
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Obtener por ID ─────────────────────────────────
  ipcMain.handle('productos:getById', async (_, id) => {
    try {
      const data = productosRepo.getById(id)
      if (!data) return { ok: false, message: 'Producto no encontrado' }
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Crear ──────────────────────────────────────────
  ipcMain.handle('productos:create', async (_, formData) => {
    try {
      const data = productosRepo.create(formData)
      return { ok: true, data, message: 'Producto creado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Actualizar ─────────────────────────────────────
  ipcMain.handle('productos:update', async (_, { id, ...formData }) => {
    try {
      const data = productosRepo.update(id, formData)
      return { ok: true, data, message: 'Producto actualizado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Importar en lote ──────────────────────────────
  ipcMain.handle('productos:importBulk', async (_, filas) => {
    const resultado = { creados: 0, fallidos: 0, errores: [] }
    const skusExistentes = new Set(
      productosRepo
        .getAll()
        .map((producto) => String(producto.sku ?? '').trim().toLowerCase())
        .filter(Boolean),
    )

    for (let i = 0; i < filas.length; i++) {
      const validacion = validarProductoImport(filas[i])
      if (!validacion.ok) {
        resultado.fallidos++
        resultado.errores.push(`Fila ${i + 2}: ${validacion.message}`)
        continue
      }

      const skuNormalizado = validacion.data.sku.trim().toLowerCase()
      if (skusExistentes.has(skuNormalizado)) {
        resultado.fallidos++
        resultado.errores.push(
          `Fila ${i + 2}: ya existe un producto con el SKU "${validacion.data.sku}"`,
        )
        continue
      }

      try {
        productosRepo.create(validacion.data)
        skusExistentes.add(skuNormalizado)
        resultado.creados++
      } catch (error) {
        resultado.fallidos++
        resultado.errores.push(`Fila ${i + 2}: ${error.message}`)
      }
    }

    return { ok: true, data: resultado }
  })

  // ── Eliminar lógico ────────────────────────────────
  ipcMain.handle('productos:delete', async (_, { id, usuario_id = null } = {}) => {
    try {
      productosRepo.remove(id, usuario_id)
      return { ok: true, message: 'Producto desactivado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Stock bajo ─────────────────────────────────────
  ipcMain.handle('productos:stockBajo', async () => {
    try {
      const data = productosRepo.getStockBajo()
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

}

module.exports = { registerProductosIpc }
