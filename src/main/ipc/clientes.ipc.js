const { ipcMain }  = require('electron')
const clientesRepo = require('../database/repositories/clientes.repository')

function registerClientesIpc() {

  // ── Obtener todos ──────────────────────────────────
  ipcMain.handle('clientes:getAll', async () => {
    try {
      const data = clientesRepo.getAll()
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Obtener por ID ─────────────────────────────────
  ipcMain.handle('clientes:getById', async (_, id) => {
    try {
      const data = clientesRepo.getById(id)
      if (!data) return { ok: false, message: 'Cliente no encontrado' }
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Crear ──────────────────────────────────────────
  ipcMain.handle('clientes:create', async (_, formData) => {
    try {
      const data = clientesRepo.create(formData)
      return { ok: true, data, message: 'Cliente creado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Actualizar ─────────────────────────────────────
  ipcMain.handle('clientes:update', async (_, { id, ...formData }) => {
    try {
      const data = clientesRepo.update(id, formData)
      return { ok: true, data, message: 'Cliente actualizado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Eliminar lógico ────────────────────────────────
  ipcMain.handle('clientes:delete', async (_, id) => {
    try {
      clientesRepo.remove(id)
      return { ok: true, message: 'Cliente desactivado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Actualizar balance ─────────────────────────────
  ipcMain.handle('clientes:updateBalance', async (_, { id, monto }) => {
    try {
      clientesRepo.updateBalance(id, monto)
      return { ok: true, message: 'Balance actualizado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

}

module.exports = { registerClientesIpc }
