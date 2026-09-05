const { getDb } = require("../db");
const facturasRepository = require("./facturas.repository");

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
  `;
  const params = [];

  if (filtros.cliente_id) {
    query += " AND p.cliente_id = ?";
    params.push(filtros.cliente_id);
  }
  if (filtros.orden_id) {
    query += " AND p.orden_id = ?";
    params.push(filtros.orden_id);
  }
  if (filtros.fecha_desde) {
    query += " AND DATE(p.fecha_pago) >= ?";
    params.push(filtros.fecha_desde);
  }
  if (filtros.fecha_hasta) {
    query += " AND DATE(p.fecha_pago) <= ?";
    params.push(filtros.fecha_hasta);
  }

  query += " ORDER BY p.fecha_pago DESC";
  return getDb()
    .prepare(query)
    .all(...params);
}

function getById(id) {
  return getDb()
    .prepare(
      `
      SELECT p.*, c.nombre AS cliente_nombre
      FROM pagos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ?
    `,
    )
    .get(id);
}

function create(data) {
  const db = getDb();

  const transaction = db.transaction((data) => {
    if (!data.orden_id) {
      throw new Error("Todo pago debe estar ligado a una orden");
    }

    const monto = Number(data.monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      throw new Error("El monto del pago debe ser mayor que cero");
    }

    const orden = db
      .prepare("SELECT id, cliente_id, total FROM ordenes WHERE id = ?")
      .get(data.orden_id);

    if (!orden) {
      throw new Error("La orden no existe");
    }
    if (Number(orden.cliente_id) !== Number(data.cliente_id)) {
      throw new Error("La orden no pertenece al cliente seleccionado");
    }

    const totalPagadoAnterior = db
      .prepare(
        "SELECT COALESCE(SUM(monto), 0) AS total FROM pagos WHERE orden_id = ?",
      )
      .get(data.orden_id).total;
    const saldoPendiente = Number(orden.total) - Number(totalPagadoAnterior);

    if (monto > saldoPendiente + 0.005) {
      throw new Error(
        `El monto no puede ser mayor al saldo pendiente de la orden (${saldoPendiente})`,
      );
    }

    // Registrar cada pago como un movimiento independiente del historial.
    const result = db
      .prepare(
        `
      INSERT INTO pagos
          (cliente_id, orden_id, monto, tipo_pago, metodo_pago, notas, usuario_id)
      VALUES
          (@cliente_id, @orden_id, @monto, @tipo_pago, @metodo_pago, @notas, @usuario_id)
    `,
      )
      .run(data);

    db.prepare(
      `
      UPDATE clientes
      SET balance_pendiente = MAX(0, balance_pendiente - ?),
          actualizado = datetime('now')
      WHERE id = ?
    `,
    ).run(monto, data.cliente_id);

    const totalPagado = Number(totalPagadoAnterior) + monto;
    const estado_pago =
      totalPagado >= Number(orden.total) - 0.005 ? "pagado" : "parcial";

    db.prepare("UPDATE ordenes SET estado_pago = ? WHERE id = ?").run(
      estado_pago,
      data.orden_id,
    );

    if (estado_pago === "pagado") {
      facturasRepository.crearParaPago(result.lastInsertRowid, data.orden_id);
    }

    return getById(result.lastInsertRowid);
  });

  return transaction(data);
}

function getHistorialCliente(cliente_id) {
  return getDb()
    .prepare(
      `
      SELECT p.*, o.total AS orden_total
      FROM pagos p
      LEFT JOIN ordenes o ON p.orden_id = o.id
      WHERE p.cliente_id = ?
      ORDER BY p.fecha_pago DESC
    `,
    )
    .all(cliente_id);
}

function getResumen() {
  return getDb()
    .prepare(
      `
      SELECT
        COUNT(*)          AS total_pagos,
        SUM(monto)        AS total_recaudado,
        SUM(CASE WHEN metodo_pago = 'efectivo' THEN monto ELSE 0 END) AS efectivo,
        SUM(CASE WHEN metodo_pago = 'cheque'   THEN monto ELSE 0 END) AS cheque,
        SUM(CASE WHEN metodo_pago = 'datafono' THEN monto ELSE 0 END) AS datafono,
        SUM(CASE WHEN metodo_pago = 'zelle'    THEN monto ELSE 0 END) AS zelle
      FROM pagos
    `,
    )
    .get();
}

module.exports = { getAll, getById, create, getHistorialCliente, getResumen };
