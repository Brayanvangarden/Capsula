const { getDb } = require('../db')

function getAll() {
  return getDb()
    .prepare(`
      SELECT c.*, COUNT(p.id) AS total_productos
      FROM categorias c
      LEFT JOIN productos p ON p.categoria_id = c.id
      GROUP BY c.id
      ORDER BY c.nombre ASC
    `)
    .all()
}

function getById(id) {
  return getDb()
    .prepare('SELECT * FROM categorias WHERE id = ?')
    .get(id)
}

function getActivas() {
  return getDb()
    .prepare(`SELECT * FROM categorias WHERE estado = 'activo' ORDER BY nombre ASC`)
    .all()
}

function create(data) {
  const result = getDb()
    .prepare(`
      INSERT INTO categorias (nombre, descripcion, estado)
      VALUES (@nombre, @descripcion, @estado)
    `)
    .run({
      nombre:      data.nombre,
      descripcion: data.descripcion ?? null,
      estado:      data.estado ?? 'activo'
    })
  return getById(result.lastInsertRowid)
}

function update(id, data) {
  getDb()
    .prepare(`
      UPDATE categorias SET
        nombre      = @nombre,
        descripcion = @descripcion,
        estado      = @estado
      WHERE id = @id
    `)
    .run({ ...data, id })
  return getById(id)
}

function remove(id) {
  // Verificar si tiene productos asociados
  const total = getDb()
    .prepare(`SELECT COUNT(*) AS total FROM productos WHERE categoria_id = ? AND estado = 'activo'`)
    .get(id)

  if (total.total > 0) {
    throw new Error(`No se puede eliminar: tiene ${total.total} producto(s) activo(s) asociado(s)`)
  }

  return getDb()
    .prepare(`UPDATE categorias SET estado = 'inactivo' WHERE id = ?`)
    .run(id)
}

module.exports = { getAll, getById, getActivas, create, update, remove }
