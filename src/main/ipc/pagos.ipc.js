const { ipcMain } = require('electron')
const pagosRepo   = require('../database/repositories/pagos.repository')

function registerPagosIpc() {

  // ── Obtener todos con filtros ──────────────────────
  ipcMain.handle('pagos:getAll', async (_, filtros = {}) => {
    try {
      const data = pagosRepo.getAll(filtros)
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Obtener por ID ─────────────────────────────────
  ipcMain.handle('pagos:getById', async (_, id) => {
    try {
      const data = pagosRepo.getById(id)
      if (!data) return { ok: false, message: 'Pago no encontrado' }
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Registrar pago ─────────────────────────────────
  ipcMain.handle('pagos:create', async (_, formData) => {
    try {
      const data = pagosRepo.create(formData)
      return { ok: true, data, message: 'Pago registrado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Historial de pagos de un cliente ───────────────
  ipcMain.handle('pagos:historialCliente', async (_, cliente_id) => {
    try {
      const data = pagosRepo.getHistorialCliente(cliente_id)
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Resumen general de pagos ───────────────────────
  ipcMain.handle('pagos:resumen', async () => {
    try {
      const data = pagosRepo.getResumen()
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

}

module.exports = { registerPagosIpc }
