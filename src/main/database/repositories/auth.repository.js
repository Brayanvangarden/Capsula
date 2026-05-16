const { getDb } = require('../db')

function findByUsuario(usuario) {
  return getDb()
    .prepare(`SELECT * FROM usuarios WHERE usuario = ? AND estado = 'activo'`)
    .get(usuario)
}

function findById(id) {
  return getDb()
    .prepare('SELECT id, nombre, usuario, rol, estado FROM usuarios WHERE id = ?')
    .get(id)
}

module.exports = { findByUsuario, findById }
