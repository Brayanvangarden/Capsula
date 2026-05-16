const { ipcMain }    = require('electron')
const categoriasRepo = require('../database/repositories/categorias.repository')

function registerCategoriasIpc() {

  // ── Obtener todas ──────────────────────────────────
  ipcMain.handle('categorias:getAll', async () => {
    try {
      const data = categoriasRepo.getAll()
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Obtener activas (para selects/dropdowns) ───────
  ipcMain.handle('categorias:getActivas', async () => {
    try {
      const data = categoriasRepo.getActivas()
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Obtener por ID ─────────────────────────────────
  ipcMain.handle('categorias:getById', async (_, id) => {
    try {
      const data = categoriasRepo.getById(id)
      if (!data) return { ok: false, message: 'Categoría no encontrada' }
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Crear ──────────────────────────────────────────
  ipcMain.handle('categorias:create', async (_, formData) => {
    try {
      const data = categoriasRepo.create(formData)
      return { ok: true, data, message: 'Categoría creada correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Actualizar ─────────────────────────────────────
  ipcMain.handle('categorias:update', async (_, { id, ...formData }) => {
    try {
      const data = categoriasRepo.update(id, formData)
      return { ok: true, data, message: 'Categoría actualizada correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Eliminar (lógico) ──────────────────────────────
  ipcMain.handle('categorias:delete', async (_, id) => {
    try {
      categoriasRepo.remove(id)
      return { ok: true, message: 'Categoría eliminada correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

}

module.exports = { registerCategoriasIpc }
