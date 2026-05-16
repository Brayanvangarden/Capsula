const { getDb } = require('../db')

function getAll(filtros = {}) {
  let query = `
    SELECT
      p.*,
      c.nombre  AS cliente_nombre,
      c.empresa AS cliente_empresa,
      u.nombre  AS usuario_nombre
    FROM pagos p
    LEFT JOIN clientes c ON p.cliente_id = c.id
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    WHERE 1=1
  `
  const params = []

  if (filtros.cliente_id) {
    query += ' AND p.cliente_id = ?'
    params.push(filtros.cliente_id)
  }
  if (filtros.orden_id) {
    query += ' AND p.orden_id = ?'
    params.push(filtros.orden_id)
  }
  if (filtros.fecha_desde) {
    query += ' AND DATE(p.fecha_pago) >= ?'
    params.push(filtros.fecha_desde)
  }
  if (filtros.fecha_hasta) {
    query += ' AND DATE(p.fecha_pago) <= ?'
    params.push(filtros.fecha_hasta)
  }

  query += ' ORDER BY p.fecha_pago DESC'
  return getDb().prepare(query).all(...params)
}

function getById(id) {
  return getDb()
    .prepare(`
      SELECT p.*, c.nombre AS cliente_nombre
      FROM pagos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ?
    `)
    .get(id)
}

function create(data) {
  const db = getDb()

  const transaction = db.transaction((data) => {
    // 1️⃣ Registrar el pago
    const result = db.prepare(`
      INSERT INTO pagos
        (cliente_id, orden_id, monto, metodo_pago, notas, usuario_id)
      VALUES
        (@cliente_id, @orden_id, @monto, @metodo_pago, @notas, @usuario_id)
    `).run(data)

    // 2️⃣ Reducir balance del cliente
    db.prepare(`
      UPDATE clientes
      SET balance_pendiente = MAX(0, balance_pendiente - ?),
          actualizado = datetime('now')
      WHERE id = ?
    `).run(data.monto, data.cliente_id)

    // 3️⃣ Si tiene orden_id, actualizar estado de pago de la orden
    if (data.orden_id) {
      const orden = db
        .prepare('SELECT total FROM ordenes WHERE id = ?')
        .get(data.orden_id)

      const totalPagado = db
        .prepare('SELECT SUM(monto) AS total FROM pagos WHERE orden_id = ?')
        .get(data.orden_id)?.total ?? 0

      let estado_pago = 'pendiente'
      if (totalPagado >= orden.total) {
        estado_pago = 'pagado'
      } else if (totalPagado > 0) {
        estado_pago = 'parcial'
      }

      db.prepare('UPDATE ordenes SET estado_pago = ? WHERE id = ?')
        .run(estado_pago, data.orden_id)
    }

    return getById(result.lastInsertRowid)
  })

  return transaction(data)
}

function getHistorialCliente(cliente_id) {
  return getDb()
    .prepare(`
      SELECT p.*, o.total AS orden_total
      FROM pagos p
      LEFT JOIN ordenes o ON p.orden_id = o.id
      WHERE p.cliente_id = ?
      ORDER BY p.fecha_pago DESC
    `)
    .all(cliente_id)
}

function getResumen() {
  return getDb()
    .prepare(`
      SELECT
        COUNT(*)          AS total_pagos,
        SUM(monto)        AS total_recaudado,
        SUM(CASE WHEN metodo_pago = 'efectivo'     THEN monto ELSE 0 END) AS efectivo,
        SUM(CASE WHEN metodo_pago = 'transferencia' THEN monto ELSE 0 END) AS transferencia,
        SUM(CASE WHEN metodo_pago = 'sinpe'        THEN monto ELSE 0 END) AS sinpe
      FROM pagos
    `)
    .get()
}

module.exports = { getAll, getById, create, getHistorialCliente, getResumen }
