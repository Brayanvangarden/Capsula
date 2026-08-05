const { getDb } = require("../db");

function getAll(filtros = {}) {
  const db = getDb();

  let query = `
    SELECT
      o.*,
      c.nombre AS cliente_nombre,
      c.empresa AS cliente_empresa,
      u.nombre AS usuario_nombre
    FROM ordenes o
    LEFT JOIN clientes c ON o.cliente_id = c.id
    LEFT JOIN usuarios u ON o.usuario_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (filtros.cliente_id) {
    query += " AND o.cliente_id = ?";
    params.push(filtros.cliente_id);
  }
  if (filtros.estado) {
    query += " AND o.estado = ?";
    params.push(filtros.estado);
  }
  if (filtros.estado_pago) {
    query += " AND o.estado_pago = ?";
    params.push(filtros.estado_pago);
  }
  if (filtros.fecha_desde) {
    query += " AND DATE(o.fecha_creacion) >= ?";
    params.push(filtros.fecha_desde);
  }
  if (filtros.fecha_hasta) {
    query += " AND DATE(o.fecha_creacion) <= ?";
    params.push(filtros.fecha_hasta);
  }

  query += " ORDER BY o.fecha_creacion DESC";
  return db.prepare(query).all(...params);
}

function getById(id) {
  const db = getDb();
  const orden = db
    .prepare(
      `
      SELECT
        o.*,
        c.nombre AS cliente_nombre,
        c.empresa AS cliente_empresa,
        u.nombre AS usuario_nombre
      FROM ordenes o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN usuarios u ON o.usuario_id = u.id
      WHERE o.id = ?
    `,
    )
    .get(id);

  if (!orden) return null;

  const detalle = db
    .prepare(
      `
      SELECT
        d.*, 
        p.nombre AS producto_nombre,
        p.cantidad AS producto_stock
      FROM ordenes_detalle d
      LEFT JOIN productos p ON d.producto_id = p.id
      WHERE d.orden_id = ?
    `,
    )
    .all(id);

  return { ...orden, detalle };
}

function create(data) {
  const db = getDb();

  const transaction = db.transaction((data) => {
    const { detalle = [], descuento_porcentaje = 0, ...ordenData } = data;

    const subtotal = detalle.reduce((sum, item) => sum + item.subtotal, 0);
    const descuentoMonto = subtotal * (Number(descuento_porcentaje) / 100);
    const total = subtotal - descuentoMonto;

    const result = db
      .prepare(
        `
      INSERT INTO ordenes
        (cliente_id, fecha_entrega, estado, estado_pago, total, notas, usuario_id)
      VALUES
        (@cliente_id, @fecha_entrega, @estado, @estado_pago, @total, @notas, @usuario_id)
    `,
      )
      .run({
        ...ordenData,
        total,
        estado: "pendiente",
        estado_pago: "pendiente",
      });

    const orden_id = result.lastInsertRowid;

    const insertDetalle = db.prepare(`
      INSERT INTO ordenes_detalle
        (orden_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES
        (@orden_id, @producto_id, @cantidad, @precio_unitario, @subtotal)
    `);

    const descontarStock = db.prepare(`
      UPDATE productos
      SET cantidad    = cantidad - @cantidad,
          actualizado = datetime('now')
      WHERE id = @producto_id
    `);

    for (const item of detalle) {
      const prod = db
        .prepare("SELECT cantidad FROM productos WHERE id = ?")
        .get(item.producto_id);

      if (!prod || prod.cantidad < item.cantidad) {
        throw new Error(
          `Stock insuficiente para el producto ID ${item.producto_id}`,
        );
      }

      insertDetalle.run({ ...item, orden_id });
      descontarStock.run(item);
    }

    db.prepare(
      `
      UPDATE clientes
      SET balance_pendiente = balance_pendiente + ?,
          actualizado = datetime('now')
      WHERE id = ?
    `,
    ).run(total, ordenData.cliente_id);

    return getById(orden_id);
  });

  return transaction(data);
}

function updateEstado(id, estado) {
  const db = getDb();
  db.prepare(`UPDATE ordenes SET estado = ? WHERE id = ?`).run(estado, id);
  return getById(id);
}

function updateEstadoPago(id, estado_pago) {
  const db = getDb();
  db.prepare(`UPDATE ordenes SET estado_pago = ? WHERE id = ?`).run(
    estado_pago,
    id,
  );
  return getById(id);
}

function getResumen() {
  const db = getDb();
  return db
    .prepare(
      `
      SELECT
        COUNT(*) AS total_ordenes,
        SUM(total) AS monto_total,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) AS en_proceso,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) AS completadas
      FROM ordenes
    `,
    )
    .get();
}

function update(id, data) {
  const db = getDb();

  const transaction = db.transaction((id, data) => {
    const existingOrder = getById(id);
    if (!existingOrder) {
      throw new Error("Orden no encontrada");
    }

    const { detalle = [], descuento_porcentaje = 0, ...ordenData } = data;
    const subtotal = detalle.reduce((sum, item) => sum + item.subtotal, 0);
    const descuentoMonto = subtotal * (Number(descuento_porcentaje) / 100);
    const total = subtotal - descuentoMonto;

    const restoreStock = db.prepare(`
      UPDATE productos
      SET cantidad = cantidad + @cantidad,
          actualizado = datetime('now')
      WHERE id = @producto_id
    `);

    for (const item of existingOrder.detalle) {
      restoreStock.run(item);
    }

    db.prepare(`DELETE FROM ordenes_detalle WHERE orden_id = ?`).run(id);

    const insertDetalle = db.prepare(`
      INSERT INTO ordenes_detalle
        (orden_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES
        (@orden_id, @producto_id, @cantidad, @precio_unitario, @subtotal)
    `);

    const descontarStock = db.prepare(`
      UPDATE productos
      SET cantidad    = cantidad - @cantidad,
          actualizado = datetime('now')
      WHERE id = @producto_id
    `);

    for (const item of detalle) {
      const prod = db
        .prepare("SELECT cantidad FROM productos WHERE id = ?")
        .get(item.producto_id);

      if (!prod || prod.cantidad < item.cantidad) {
        throw new Error(
          `Stock insuficiente para el producto ID ${item.producto_id}`,
        );
      }

      insertDetalle.run({ ...item, orden_id: id });
      descontarStock.run(item);
    }

    const clienteId = ordenData.cliente_id ?? existingOrder.cliente_id;
    const usuarioId = ordenData.usuario_id ?? existingOrder.usuario_id;

    db.prepare(
      `
      UPDATE ordenes
      SET cliente_id = @cliente_id,
          fecha_entrega = @fecha_entrega,
          notas = @notas,
          total = @total,
          usuario_id = @usuario_id
      WHERE id = @id
    `,
    ).run({
      ...ordenData,
      cliente_id: clienteId,
      fecha_entrega: ordenData.fecha_entrega || null,
      notas: ordenData.notas || null,
      total,
      usuario_id: usuarioId,
      id,
    });

    if (existingOrder.cliente_id === clienteId) {
      const diff = total - existingOrder.total;
      db.prepare(
        `
        UPDATE clientes
        SET balance_pendiente = balance_pendiente + ?,
            actualizado = datetime('now')
        WHERE id = ?
      `,
      ).run(diff, clienteId);
    } else {
      db.prepare(
        `
        UPDATE clientes
        SET balance_pendiente = balance_pendiente - ?,
            actualizado = datetime('now')
        WHERE id = ?
      `,
      ).run(existingOrder.total, existingOrder.cliente_id);

      db.prepare(
        `
        UPDATE clientes
        SET balance_pendiente = balance_pendiente + ?,
            actualizado = datetime('now')
        WHERE id = ?
      `,
      ).run(total, clienteId);
    }

    return getById(id);
  });

  return transaction(id, data);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateEstado,
  updateEstadoPago,
  getResumen,
};
