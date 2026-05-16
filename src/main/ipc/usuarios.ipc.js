const { ipcMain }   = require('electron')
const usuariosRepo  = require('../database/repositories/usuarios.repository')

function registerUsuariosIpc() {

  // ── Obtener todos ──────────────────────────────────
  ipcMain.handle('usuarios:getAll', async () => {
    try {
      const data = usuariosRepo.getAll()
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Obtener por ID ─────────────────────────────────
  ipcMain.handle('usuarios:getById', async (_, id) => {
    try {
      const data = usuariosRepo.getById(id)
      if (!data) return { ok: false, message: 'Usuario no encontrado' }
      return { ok: true, data }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Crear ──────────────────────────────────────────
  ipcMain.handle('usuarios:create', async (_, formData) => {
    try {
      const existe = usuariosRepo.existeUsuario(formData.usuario)
      if (existe) {
        return { ok: false, message: 'El nombre de usuario ya está en uso' }
      }
      const data = usuariosRepo.create(formData)
      return { ok: true, data, message: 'Usuario creado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Actualizar ─────────────────────────────────────
  ipcMain.handle('usuarios:update', async (_, { id, ...formData }) => {
    try {
      const existe = usuariosRepo.existeUsuario(formData.usuario, id)
      if (existe) {
        return { ok: false, message: 'El nombre de usuario ya está en uso' }
      }
      const data = usuariosRepo.update(id, formData)
      return { ok: true, data, message: 'Usuario actualizado correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Cambiar contraseña ─────────────────────────────
  ipcMain.handle('usuarios:changePassword', async (_, { id, password }) => {
    try {
      usuariosRepo.updatePassword(id, password)
      return { ok: true, message: 'Contraseña actualizada correctamente' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Activar / Desactivar ───────────────────────────
  ipcMain.handle('usuarios:toggleEstado', async (_, id) => {
    try {
      const data = usuariosRepo.toggleEstado(id)
      return { ok: true, data, message: `Usuario ${data.estado}` }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

}

module.exports = { registerUsuariosIpc }
