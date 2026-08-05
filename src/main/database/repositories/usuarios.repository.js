const bcrypt = require('bcryptjs')
const { getDb } = require('../db')

function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

function getAll() {
  return getDb()
    .prepare(`
      SELECT id, nombre, usuario, rol, estado, creado_en
      FROM usuarios
      ORDER BY nombre ASC
    `)
    .all()
}

function getById(id) {
  return getDb()
    .prepare(`
      SELECT id, nombre, usuario, rol, estado, creado_en
      FROM usuarios WHERE id = ?
    `)
    .get(id)
}

function create(data) {
  const result = getDb()
    .prepare(`
      INSERT INTO usuarios (nombre, usuario, password, rol, estado)
      VALUES (@nombre, @usuario, @password, @rol, @estado)
    `)
    .run({
      nombre:   data.nombre,
      usuario:  data.usuario,
      password: hashPassword(data.password),
      rol:      data.rol    ?? 'vendedor',
      estado:   data.estado ?? 'activo'
    })
  return getById(result.lastInsertRowid)
}

function update(id, data) {
  getDb()
    .prepare(`
      UPDATE usuarios SET
        nombre      = @nombre,
        usuario     = @usuario,
        rol         = @rol,
        estado      = @estado,
        actualizado = datetime('now')
      WHERE id = @id
    `)
    .run({ ...data, id })
  return getById(id)
}

function updatePassword(id, newPassword) {
  const hash = hashPassword(newPassword)
  return getDb()
    .prepare(`
      UPDATE usuarios
      SET password    = ?,
          actualizado = datetime('now')
      WHERE id = ?
    `)
    .run(hash, id)
}

function toggleEstado(id) {
  const usuario = getById(id)
  if (!usuario) throw new Error('Usuario no encontrado')

  const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo'

  getDb()
    .prepare(`UPDATE usuarios SET estado = ?, actualizado = datetime('now') WHERE id = ?`)
    .run(nuevoEstado, id)

  return getById(id)
}

function existeUsuario(usuario, excludeId = null) {
  const query = excludeId
    ? 'SELECT id FROM usuarios WHERE usuario = ? AND id != ?'
    : 'SELECT id FROM usuarios WHERE usuario = ?'

  const params = excludeId ? [usuario, excludeId] : [usuario]
  return !!getDb().prepare(query).get(...params)
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  updatePassword,
  toggleEstado,
  existeUsuario
}
