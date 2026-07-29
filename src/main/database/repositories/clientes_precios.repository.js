const { getDb } = require('../db')

function getAll() {
  return getDb()
    .prepare(`
      SELECT cp.*, p.nombre AS producto_nombre
      FROM clientes_precios cp
      LEFT JOIN productos p ON cp.producto_id = p.id
      ORDER BY cp.cliente_id, p.nombre ASC
    `)
    .all()
}

function getById(id) {
  return getDb()
    .prepare('SELECT * FROM clientes_precios WHERE id = ?')
    .get(id)
}

function getByClienteId(cliente_id) {
  return getDb()
    .prepare(`
      SELECT cp.*, p.nombre AS producto_nombre
      FROM clientes_precios cp
      LEFT JOIN productos p ON cp.producto_id = p.id
      WHERE cp.cliente_id = ?
      ORDER BY p.nombre ASC
    `)
    .all(cliente_id)
}

function getByClienteProducto(cliente_id, producto_id) {
  return getDb()
    .prepare(`
      SELECT *
      FROM clientes_precios
      WHERE cliente_id = ? AND producto_id = ?
    `)
    .get(cliente_id, producto_id)
}

function create(data) {
  const result = getDb().prepare(`
    INSERT INTO clientes_precios
      (cliente_id, producto_id, precio_unitario)
    VALUES
      (@cliente_id, @producto_id, @precio_unitario)
  `).run(data)
  return getById(result.lastInsertRowid)
}

function update(id, data) {
  getDb().prepare(`
    UPDATE clientes_precios SET
      cliente_id    = @cliente_id,
      producto_id   = @producto_id,
      precio_unitario = @precio_unitario,
      actualizado   = datetime('now')
    WHERE id = @id
  `).run({ ...data, id })
  return getById(id)
}

function upsert(cliente_id, producto_id, precio_unitario) {
  const existing = getByClienteProducto(cliente_id, producto_id)
  if (existing) {
    return update(existing.id, { cliente_id, producto_id, precio_unitario })
  }
  return create({ cliente_id, producto_id, precio_unitario })
}

function remove(id) {
  return getDb()
    .prepare('DELETE FROM clientes_precios WHERE id = ?')
    .run(id)
}

module.exports = {
  getAll,
  getById,
  getByClienteId,
  getByClienteProducto,
  create,
  update,
  upsert,
  remove,
}
