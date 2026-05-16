const { ipcMain } = require('electron')
const authRepo    = require('../database/repositories/auth.repository')

function registerAuthIpc() {

  // ── Login ──────────────────────────────────────────
  ipcMain.handle('auth:login', async (_, { usuario, password }) => {
    try {
      const user = authRepo.findByUsuario(usuario)

      if (!user) {
        return { ok: false, message: 'Usuario no encontrado' }
      }

      // ⚠️ Comparación directa (sin bcrypt por ahora)
      // TODO: reemplazar con bcrypt.compare cuando se implemente hash
      if (user.password !== password) {
        return { ok: false, message: 'Contraseña incorrecta' }
      }

      // No retornar el password al renderer
      const { password: _, ...safeUser } = user
      return { ok: true, data: safeUser }

    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Obtener usuario por ID ─────────────────────────
  ipcMain.handle('auth:getById', async (_, id) => {
    try {
      const user = authRepo.findById(id)
      return { ok: true, data: user }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

}

module.exports = { registerAuthIpc }
