const { getDb } = require('../db')

function getAll() {
  return getDb()
    .prepare(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.nombre ASC
    `)
    .all()
}

function getById(id) {
  return getDb()
    .prepare('SELECT * FROM productos WHERE id = ?')
    .get(id)
}

function create(data) {
  const stmt = getDb().prepare(`
    INSERT INTO productos
      (nombre, categoria_id, cantidad, cantidad_paquete,
       numero_lote, cantidad_lote, precio_unitario,
       stock_minimo, material, color,
       fecha_vencimiento, estado, notas)
    VALUES
      (@nombre, @categoria_id, @cantidad, @cantidad_paquete,
       @numero_lote, @cantidad_lote, @precio_unitario,
       @stock_minimo, @material, @color,
       @fecha_vencimiento, @estado, @notas)
  `)
  const result = stmt.run(data)
  return getById(result.lastInsertRowid)
}

function update(id, data) {
  getDb().prepare(`
    UPDATE productos SET
      nombre            = @nombre,
      categoria_id      = @categoria_id,
      cantidad          = @cantidad,
      cantidad_paquete  = @cantidad_paquete,
      numero_lote       = @numero_lote,
      cantidad_lote     = @cantidad_lote,
      precio_unitario   = @precio_unitario,
      stock_minimo      = @stock_minimo,
      material          = @material,
      color             = @color,
      fecha_vencimiento = @fecha_vencimiento,
      estado            = @estado,
      notas             = @notas,
      actualizado       = datetime('now')
    WHERE id = @id
  `).run({ ...data, id })
  return getById(id)
}

function remove(id) {
  // Eliminación lógica
  return getDb()
    .prepare(`UPDATE productos SET estado = 'inactivo',
              actualizado = datetime('now') WHERE id = ?`)
    .run(id)
}

function getStockBajo() {
  return getDb()
    .prepare(`
      SELECT * FROM productos
      WHERE cantidad <= stock_minimo
        AND estado = 'activo'
      ORDER BY cantidad ASC
    `)
    .all()
}

function getProximosVencer(dias = 30) {
  return getDb()
    .prepare(`
      SELECT * FROM productos
      WHERE fecha_vencimiento IS NOT NULL
        AND fecha_vencimiento <= date('now', '+' || ? || ' days')
        AND estado = 'activo'
      ORDER BY fecha_vencimiento ASC
    `)
    .all(dias)
}

module.exports = { getAll, getById, create, update, remove, getStockBajo, getProximosVencer }
