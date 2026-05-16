const { ipcMain }   = require('electron')
const productosRepo = require('../database/repositories/productos.repository')

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

  // ── Eliminar lógico ────────────────────────────────
  ipcMain.handle('productos:delete', async (_, id) => {
    try {
      productosRepo.remove(id)
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

  // ── Próximos a vencer ──────────────────────────────
  ipcMain.handle('productos:proximosVencer', async (_, dias = 30) => {
    try {
      const data = productosRepo.getProximosVencer(dias)
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

}

module.exports = { registerProductosIpc }
