const bcrypt = require('bcryptjs')
const { getDb } = require('../db')

function findByUsuario(usuario) {
  return getDb()
    .prepare(`SELECT * FROM usuarios WHERE usuario = ? AND estado = 'activo'`)
    .get(usuario)
}

function findByUsuarioOrCorreo(value) {
  return getDb()
    .prepare(`
      SELECT * FROM usuarios
      WHERE (usuario = ? OR correo = ?)
        AND estado = 'activo'
    `)
    .get(value, value)
}

function findById(id) {
  return getDb()
    .prepare('SELECT id, nombre, usuario, rol, estado FROM usuarios WHERE id = ?')
    .get(id)
}

function updatePassword(id, newPassword) {
  const hash = bcrypt.hashSync(newPassword, 10)
  return getDb()
    .prepare(`
      UPDATE usuarios
      SET password = ?, actualizado = datetime('now')
      WHERE id = ?
    `)
    .run(hash, id)
}

function resetFailedLogin(id) {
  return getDb()
    .prepare(`
      UPDATE usuarios
      SET failed_attempts = 0,
          locked_until = NULL,
          actualizado = datetime('now')
      WHERE id = ?
    `)
    .run(id)
}

function updateFailedLogin(id, failedAttempts, lockedUntil = null) {
  return getDb()
    .prepare(`
      UPDATE usuarios
      SET failed_attempts = ?,
          locked_until = ?,
          actualizado = datetime('now')
      WHERE id = ?
    `)
    .run(failedAttempts, lockedUntil, id)
}

function setResetToken(id, resetCode, resetExpires) {
  return getDb()
    .prepare(`
      UPDATE usuarios
      SET reset_code = ?,
          reset_expires = ?,
          actualizado = datetime('now')
      WHERE id = ?
    `)
    .run(resetCode, resetExpires, id)
}

function clearResetToken(id) {
  return getDb()
    .prepare(`
      UPDATE usuarios
      SET reset_code = NULL,
          reset_expires = NULL,
          actualizado = datetime('now')
      WHERE id = ?
    `)
    .run(id)
}

module.exports = {
  findByUsuario,
  findByUsuarioOrCorreo,
  findById,
  updatePassword,
  resetFailedLogin,
  updateFailedLogin,
  setResetToken,
  clearResetToken,
}
