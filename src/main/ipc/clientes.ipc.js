const { ipcMain }  = require('electron')
const clientesRepo = require('../database/repositories/clientes.repository')
const clientesPreciosRepo = require('../database/repositories/clientes_precios.repository')

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

  // ── Obtener precio especial por cliente y producto ──
  ipcMain.handle('clientes:getPrecioEspecial', async (_, { cliente_id, producto_id }) => {
    try {
      const data = clientesPreciosRepo.getByClienteProducto(cliente_id, producto_id)
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Listar precios especiales ────────────────────────
  ipcMain.handle('clientes:precios:getAll', async () => {
    try {
      const data = clientesPreciosRepo.getAll()
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  ipcMain.handle('clientes:precios:getByClienteId', async (_, cliente_id) => {
    try {
      const data = clientesPreciosRepo.getByClienteId(cliente_id)
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  ipcMain.handle('clientes:precios:create', async (_, formData) => {
    try {
      const data = clientesPreciosRepo.create(formData)
      return { ok: true, data, message: 'Precio especial creado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  ipcMain.handle('clientes:precios:update', async (_, { id, ...formData }) => {
    try {
      const data = clientesPreciosRepo.update(id, formData)
      return { ok: true, data, message: 'Precio especial actualizado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  ipcMain.handle('clientes:precios:delete', async (_, id) => {
    try {
      clientesPreciosRepo.remove(id)
      return { ok: true, message: 'Precio especial eliminado correctamente' }
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
