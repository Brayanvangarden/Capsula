const { getDb } = require('../db')

function getAll() {
  return getDb()
    .prepare(`SELECT * FROM clientes ORDER BY nombre ASC`)
    .all()
}

function getById(id) {
  return getDb()
    .prepare('SELECT * FROM clientes WHERE id = ?')
    .get(id)
}

function create(data) {
  const result = getDb().prepare(`
    INSERT INTO clientes (empresa, nombre, telefono, correo, direccion)
    VALUES (@empresa, @nombre, @telefono, @correo, @direccion)
  `).run(data)
  return getById(result.lastInsertRowid)
}

function update(id, data) {
  getDb().prepare(`
    UPDATE clientes SET
      empresa    = @empresa,
      nombre     = @nombre,
      telefono   = @telefono,
      correo     = @correo,
      direccion  = @direccion,
      actualizado = datetime('now')
    WHERE id = @id
  `).run({ ...data, id })
  return getById(id)
}

function remove(id) {
  return getDb()
    .prepare(`UPDATE clientes SET estado = 'inactivo' WHERE id = ?`)
    .run(id)
}

function updateBalance(id, monto) {
  return getDb()
    .prepare(`
      UPDATE clientes
      SET balance_pendiente = balance_pendiente + ?,
          actualizado = datetime('now')
      WHERE id = ?
    `)
    .run(monto, id)
}

module.exports = { getAll, getById, create, update, remove, updateBalance }
