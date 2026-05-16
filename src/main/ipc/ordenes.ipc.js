const { ipcMain }  = require('electron')
const ordenesRepo  = require('../database/repositories/ordenes.repository')

function registerOrdenesIpc() {

  // ── Obtener todas con filtros ──────────────────────
  ipcMain.handle('ordenes:getAll', async (_, filtros = {}) => {
    try {
      const data = ordenesRepo.getAll(filtros)
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Obtener por ID con detalle ─────────────────────
  ipcMain.handle('ordenes:getById', async (_, id) => {
    try {
      const data = ordenesRepo.getById(id)
      if (!data) return { ok: false, message: 'Orden no encontrada' }
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Crear orden con detalle ────────────────────────
  ipcMain.handle('ordenes:create', async (_, formData) => {
    try {
      const data = ordenesRepo.create(formData)
      return { ok: true, data, message: 'Orden creada correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Actualizar estado de la orden ──────────────────
  ipcMain.handle('ordenes:updateEstado', async (_, { id, estado }) => {
    try {
      const data = ordenesRepo.updateEstado(id, estado)
      return { ok: true, data, message: 'Estado actualizado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Actualizar estado de pago ──────────────────────
  ipcMain.handle('ordenes:updateEstadoPago', async (_, { id, estado_pago }) => {
    try {
      const data = ordenesRepo.updateEstadoPago(id, estado_pago)
      return { ok: true, data, message: 'Estado de pago actualizado' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Resumen general ────────────────────────────────
  ipcMain.handle('ordenes:resumen', async () => {
    try {
      const data = ordenesRepo.getResumen()
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

}

module.exports = { registerOrdenesIpc }
