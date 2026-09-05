const { getDb } = require("../db");

const UMBRAL = 0.005;

function estadoCuenta(saldo, tieneVencida) {
  if (saldo <= UMBRAL) return "al_dia";
  return tieneVencida ? "morosa" : "pendiente";
}

function getResumen() {
  const db = getDb();
  const clientes = db
    .prepare(
      `
      SELECT
        c.id,
        c.nombre,
        c.empresa,
        COALESCE(ventas.total_ventas, 0) AS total_ventas_credito,
        COALESCE(pagos.total_pagado, 0) AS total_pagado,
        MAX(0, COALESCE(ventas.total_ventas, 0) - COALESCE(pagos.total_pagado, 0)) AS saldo_pendiente,
        CASE
          WHEN MAX(0, COALESCE(ventas.total_ventas, 0) - COALESCE(pagos.total_pagado, 0)) <= @umbral THEN 'al_dia'
          WHEN COALESCE(ventas.tiene_vencida, 0) = 1 THEN 'morosa'
          ELSE 'pendiente'
        END AS estado,
        COALESCE(ventas.ultima_venta, '') AS ultima_venta
      FROM clientes c
      INNER JOIN (
        SELECT
          cliente_id,
          SUM(total) AS total_ventas,
          MAX(fecha_creacion) AS ultima_venta,
          MAX(CASE
            WHEN total > (
              SELECT COALESCE(SUM(p2.monto), 0)
              FROM pagos p2
              WHERE p2.orden_id = o.id
            ) + @umbral
            AND fecha_entrega IS NOT NULL
            AND DATE(fecha_entrega) < DATE('now')
            THEN 1 ELSE 0 END
          ) AS tiene_vencida
        FROM ordenes o
        GROUP BY cliente_id
      ) ventas ON ventas.cliente_id = c.id
      LEFT JOIN (
        SELECT o.cliente_id, SUM(p.monto) AS total_pagado
        FROM pagos p
        INNER JOIN ordenes o ON o.id = p.orden_id
        GROUP BY o.cliente_id
      ) pagos ON pagos.cliente_id = c.id
      ORDER BY saldo_pendiente DESC, c.nombre COLLATE NOCASE ASC
      `,
    )
    .all({ umbral: UMBRAL });

  return clientes;
}

function getEstadoCuenta(clienteId, mes = "") {
  const db = getDb();
  const cliente = db
    .prepare("SELECT id, nombre, empresa FROM clientes WHERE id = ?")
    .get(clienteId);
  if (!cliente) return null;

  const ordenes = db
    .prepare(
      `
            SELECT o.id, o.fecha_creacion AS fecha, o.total AS monto, o.fecha_entrega,
              o.estado, o.notas, f.numero_factura
            FROM ordenes o
            LEFT JOIN facturas f ON f.orden_id = o.id
            WHERE o.cliente_id = ?
            ORDER BY o.fecha_creacion ASC, o.id ASC
      `,
    )
    .all(clienteId);
  const pagos = db
    .prepare(
      `
    SELECT p.id, p.orden_id, p.fecha_pago AS fecha, p.monto,
           p.metodo_pago, p.notas, f.numero_factura
    FROM pagos p
    INNER JOIN ordenes o ON o.id = p.orden_id
    LEFT JOIN facturas f ON f.pago_id = p.id
    WHERE o.cliente_id = ?
    ORDER BY p.fecha_pago ASC, p.id ASC
    `,
    )
    .all(clienteId);
  const movimientos = [
    ...ordenes.map((orden) => ({
      clave: `orden-${orden.id}`,
      fecha: orden.fecha,
      orden_id: orden.id,
      numero_factura: orden.numero_factura,
      tipo: "venta",
      descripcion: "Venta a credito",
      monto: Number(orden.monto),
      fecha_entrega: orden.fecha_entrega,
    })),
    ...pagos.map((pago) => ({
      clave: `pago-${pago.id}`,
      fecha: pago.fecha,
      orden_id: pago.orden_id,
      pago_id: pago.id,
      numero_factura: pago.numero_factura,
      tipo: "pago",
      descripcion: `Pago - ${pago.metodo_pago}`,
      monto: -Number(pago.monto),
    })),
  ].sort((a, b) => {
    const diferencia = new Date(a.fecha) - new Date(b.fecha);
    if (diferencia !== 0) return diferencia;
    if (a.tipo === b.tipo) return a.clave.localeCompare(b.clave);
    return a.tipo === "venta" ? -1 : 1;
  });

  const movimientosDelMes = mes
    ? movimientos.filter((movimiento) =>
        String(movimiento.fecha).startsWith(mes),
      )
    : movimientos;
  const movimientosAnteriores = mes
    ? movimientos.filter((movimiento) => String(movimiento.fecha) < `${mes}-01`)
    : [];
  let saldo = movimientosAnteriores.reduce(
    (total, movimiento) => total + movimiento.monto,
    0,
  );
  const saldoInicial = Math.max(0, saldo);
  const detalle = movimientosDelMes.map((movimiento) => {
    saldo = Math.max(0, saldo + movimiento.monto);
    return { ...movimiento, saldo: Number(saldo.toFixed(2)) };
  });

  const totalVentas = ordenes.reduce(
    (total, orden) => total + Number(orden.monto),
    0,
  );
  const totalPagado = pagos.reduce(
    (total, pago) => total + Number(pago.monto),
    0,
  );
  const saldoPendiente = Math.max(0, totalVentas - totalPagado);
  const ventasDelMes = movimientosDelMes
    .filter((movimiento) => movimiento.tipo === "venta")
    .reduce((total, movimiento) => total + movimiento.monto, 0);
  const pagosDelMes = movimientosDelMes
    .filter((movimiento) => movimiento.tipo === "pago")
    .reduce((total, movimiento) => total + Math.abs(movimiento.monto), 0);
  const tieneVencida = ordenes.some(
    (orden) =>
      Number(orden.monto) >
        pagos
          .filter((pago) => pago.orden_id === orden.id)
          .reduce((total, pago) => total + Number(pago.monto), 0) +
          UMBRAL &&
      orden.fecha_entrega &&
      new Date(orden.fecha_entrega) < new Date(new Date().toDateString()),
  );

  return {
    cliente,
    total_ventas_credito: totalVentas,
    total_pagado: totalPagado,
    saldo_pendiente: saldoPendiente,
    mes,
    saldo_inicial: saldoInicial,
    ventas_del_mes: ventasDelMes,
    pagos_del_mes: pagosDelMes,
    saldo_al_cierre: Math.max(0, saldo),
    estado: estadoCuenta(saldoPendiente, tieneVencida),
    movimientos: detalle,
  };
}

module.exports = { getResumen, getEstadoCuenta };
