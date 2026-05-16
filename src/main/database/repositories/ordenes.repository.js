const { getDb } = require('../db')

function getAll(filtros = {}) {
  let query = `
    SELECT
      o.*,
      c.nombre  AS cliente_nombre,
      c.empresa AS cliente_empresa,
      u.nombre  AS usuario_nombre
    FROM ordenes o
    LEFT JOIN clientes c ON o.cliente_id = c.id
    LEFT JOIN usuarios u ON o.usuario_id = u.id
    WHERE 1=1
  `
  const params = []

  if (filtros.cliente_id) {
    query += ' AND o.cliente_id = ?'
    params.push(filtros.cliente_id)
  }
  if (filtros.estado) {
    query += ' AND o.estado = ?'
    params.push(filtros.estado)
  }
  if (filtros.estado_pago) {
    query += ' AND o.estado_pago = ?'
    params.push(filtros.estado_pago)
  }
  if (filtros.fecha_desde) {
    query += ' AND DATE(o.fecha_creacion) >= ?'
    params.push(filtros.fecha_desde)
  }
  if (filtros.fecha_hasta) {
    query += ' AND DATE(o.fecha_creacion) <= ?'
    params.push(filtros.fecha_hasta)
  }

  query += ' ORDER BY o.fecha_creacion DESC'
  return getDb().prepare(query).all(...params)
}

function getById(id) {
  const orden = getDb()
    .prepare(`
      SELECT
        o.*,
        c.nombre  AS cliente_nombre,
        c.empresa AS cliente_empresa,
        c.telefono AS cliente_telefono,
        c.correo   AS cliente_correo
      FROM ordenes o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      WHERE o.id = ?
    `)
    .get(id)

  if (orden) {
    // Traer el detalle de la orden
    orden.detalle = getDb()
      .prepare(`
        SELECT
          od.*,
          p.nombre AS producto_nombre
        FROM ordenes_detalle od
        LEFT JOIN productos p ON od.producto_id = p.id
        WHERE od.orden_id = ?
      `)
      .all(id)
  }
  return orden
}

function create(data) {
  const db = getDb()

  const transaction = db.transaction((data) => {
    const { detalle, ...ordenData } = data

    // 1️⃣ Calcular total
    const total = detalle.reduce((sum, item) => sum + item.subtotal, 0)

    // 2️⃣ Crear la orden
    const result = db.prepare(`
      INSERT INTO ordenes
        (cliente_id, fecha_entrega, estado, estado_pago, total, notas, usuario_id)
      VALUES
        (@cliente_id, @fecha_entrega, @estado, @estado_pago, @total, @notas, @usuario_id)
    `).run({ ...ordenData, total, estado: 'pendiente', estado_pago: 'pendiente' })

    const orden_id = result.lastInsertRowid

    // 3️⃣ Insertar detalle y descontar stock
    const insertDetalle = db.prepare(`
      INSERT INTO ordenes_detalle
        (orden_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES
        (@orden_id, @producto_id, @cantidad, @precio_unitario, @subtotal)
    `)

    const descontarStock = db.prepare(`
      UPDATE productos
      SET cantidad    = cantidad - @cantidad,
          actualizado = datetime('now')
      WHERE id = @producto_id
    `)

    for (const item of detalle) {
      // Verificar stock
      const prod = db
        .prepare('SELECT cantidad FROM productos WHERE id = ?')
        .get(item.producto_id)

      if (!prod || prod.cantidad < item.cantidad) {
        throw new Error(`Stock insuficiente para el producto ID ${item.producto_id}`)
      }

      insertDetalle.run({ ...item, orden_id })
      descontarStock.run(item)
    }

    // 4️⃣ Actualizar balance del cliente
    db.prepare(`
      UPDATE clientes
      SET balance_pendiente = balance_pendiente + ?,
          actualizado = datetime('now')
      WHERE id = ?
    `).run(total, ordenData.cliente_id)

    return getById(orden_id)
  })

  return transaction(data)
}

function updateEstado(id, estado) {
  getDb()
    .prepare('UPDATE ordenes SET estado = ? WHERE id = ?')
    .run(estado, id)
  return getById(id)
}

function updateEstadoPago(id, estado_pago) {
  getDb()
    .prepare('UPDATE ordenes SET estado_pago = ? WHERE id = ?')
    .run(estado_pago, id)
  return getById(id)
}

function getResumen() {
  return getDb()
    .prepare(`
      SELECT
        COUNT(*) AS total_ordenes,
        SUM(total) AS monto_total,
        SUM(CASE WHEN estado_pago = 'pendiente' THEN total ELSE 0 END) AS pendiente_cobro,
        SUM(CASE WHEN estado = 'completada'     THEN 1 ELSE 0 END) AS completadas,
        SUM(CASE WHEN estado = 'cancelada'      THEN 1 ELSE 0 END) AS canceladas
      FROM ordenes
    `)
    .get()
}

module.exports = { getAll, getById, create, updateEstado, updateEstadoPago, getResumen }
