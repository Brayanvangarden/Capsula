const { ipcMain }    = require('electron')
const inventarioRepo = require('../database/repositories/inventario.repository')

function registerInventarioIpc() {

  // ── Obtener movimientos con filtros ────────────────
  ipcMain.handle('inventario:getMovimientos', async (_, filtros = {}) => {
    try {
      const data = inventarioRepo.getMovimientos(filtros)
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Obtener movimiento por ID ──────────────────────
  ipcMain.handle('inventario:getById', async (_, id) => {
    try {
      const data = inventarioRepo.getMovimientoById(id)
      if (!data) return { ok: false, message: 'Movimiento no encontrado' }
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Registrar entrada ──────────────────────────────
  ipcMain.handle('inventario:entrada', async (_, formData) => {
    try {
      const data = inventarioRepo.registrarEntrada(formData)
      return { ok: true, data, message: 'Entrada registrada correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Registrar salida ───────────────────────────────
  ipcMain.handle('inventario:salida', async (_, formData) => {
    try {
      const data = inventarioRepo.registrarSalida(formData)
      return { ok: true, data, message: 'Salida registrada correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Resumen por producto ───────────────────────────
  ipcMain.handle('inventario:resumenProducto', async (_, producto_id) => {
    try {
      const data = inventarioRepo.getResumenPorProducto(producto_id)
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

}

module.exports = { registerInventarioIpc }
