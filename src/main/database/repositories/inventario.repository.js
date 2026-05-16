const { getDb } = require('../db')

function getMovimientos(filtros = {}) {
  let query = `
    SELECT
      m.*,
      p.nombre  AS producto_nombre,
      u.nombre  AS usuario_nombre
    FROM movimientos_inventario m
    LEFT JOIN productos p ON m.producto_id = p.id
    LEFT JOIN usuarios  u ON m.usuario_id  = u.id
    WHERE 1=1
  `
  const params = []

  if (filtros.producto_id) {
    query += ' AND m.producto_id = ?'
    params.push(filtros.producto_id)
  }
  if (filtros.tipo) {
    query += ' AND m.tipo = ?'
    params.push(filtros.tipo)
  }
  if (filtros.fecha_desde) {
    query += ' AND DATE(m.fecha) >= ?'
    params.push(filtros.fecha_desde)
  }
  if (filtros.fecha_hasta) {
    query += ' AND DATE(m.fecha) <= ?'
    params.push(filtros.fecha_hasta)
  }

  query += ' ORDER BY m.fecha DESC'

  return getDb().prepare(query).all(...params)
}

function getMovimientoById(id) {
  return getDb()
    .prepare(`
      SELECT m.*, p.nombre AS producto_nombre
      FROM movimientos_inventario m
      LEFT JOIN productos p ON m.producto_id = p.id
      WHERE m.id = ?
    `)
    .get(id)
}

function registrarEntrada(data) {
  const db = getDb()

  // Transacción: registrar movimiento + actualizar stock
  const transaction = db.transaction((data) => {
    // 1️⃣ Registrar el movimiento
    const result = db.prepare(`
      INSERT INTO movimientos_inventario
        (producto_id, tipo, cantidad, observaciones, usuario_id)
      VALUES
        (@producto_id, 'entrada', @cantidad, @observaciones, @usuario_id)
    `).run(data)

    // 2️⃣ Actualizar cantidad en productos
    db.prepare(`
      UPDATE productos
      SET cantidad    = cantidad + @cantidad,
          actualizado = datetime('now')
      WHERE id = @producto_id
    `).run(data)

    return getMovimientoById(result.lastInsertRowid)
  })

  return transaction(data)
}

function registrarSalida(data) {
  const db = getDb()

  const transaction = db.transaction((data) => {
    // 1️⃣ Verificar stock suficiente
    const producto = db
      .prepare('SELECT cantidad FROM productos WHERE id = ?')
      .get(data.producto_id)

    if (!producto || producto.cantidad < data.cantidad) {
      throw new Error(`Stock insuficiente. Disponible: ${producto?.cantidad ?? 0}`)
    }

    // 2️⃣ Registrar el movimiento
    const result = db.prepare(`
      INSERT INTO movimientos_inventario
        (producto_id, tipo, cantidad, observaciones, usuario_id)
      VALUES
        (@producto_id, 'salida', @cantidad, @observaciones, @usuario_id)
    `).run(data)

    // 3️⃣ Restar cantidad en productos
    db.prepare(`
      UPDATE productos
      SET cantidad    = cantidad - @cantidad,
          actualizado = datetime('now')
      WHERE id = @producto_id
    `).run(data)

    return getMovimientoById(result.lastInsertRowid)
  })

  return transaction(data)
}

function getResumenPorProducto(producto_id) {
  return getDb()
    .prepare(`
      SELECT
        SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE 0 END) AS total_entradas,
        SUM(CASE WHEN tipo = 'salida'  THEN cantidad ELSE 0 END) AS total_salidas,
        COUNT(*) AS total_movimientos
      FROM movimientos_inventario
      WHERE producto_id = ?
    `)
    .get(producto_id)
}

module.exports = {
  getMovimientos,
  getMovimientoById,
  registrarEntrada,
  registrarSalida,
  getResumenPorProducto
}
