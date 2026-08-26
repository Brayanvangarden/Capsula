const { getDb } = require("../db");

const EMPRESA = {
  nombre: "Capsulas Inventario",
  comercial: "Capsulas Inventario",
  identificacion: "Identificación fiscal pendiente",
  direccion: "San José, Costa Rica",
  telefono: "Teléfono pendiente",
  correo: "admin@example.com",
};

function crearParaPago(pagoId, ordenId) {
  const db = getDb();
  const existente = db
    .prepare("SELECT id FROM facturas WHERE orden_id = ?")
    .get(ordenId);
  if (existente) return existente;

  const orden = db
    .prepare(
      `
    SELECT o.*, c.nombre, c.empresa, c.correo, c.telefono, c.direccion
    FROM ordenes o
    JOIN clientes c ON c.id = o.cliente_id
    WHERE o.id = ?
  `,
    )
    .get(ordenId);
  if (!orden)
    throw new Error("No se encontró la orden para generar la factura");

  const pago = db
    .prepare("SELECT metodo_pago FROM pagos WHERE id = ?")
    .get(pagoId);
  const detalle = db
    .prepare(
      `
    SELECT d.*, p.numero_lote AS codigo_producto, p.nombre AS producto_nombre
    FROM ordenes_detalle d
    LEFT JOIN productos p ON p.id = d.producto_id
    WHERE d.orden_id = ?
  `,
    )
    .all(ordenId);
  const subtotal = detalle.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0,
  );
  const totalPagado = db
    .prepare(
      "SELECT COALESCE(SUM(monto), 0) AS total FROM pagos WHERE orden_id = ?",
    )
    .get(ordenId).total;
  const siguienteNumero = db
    .prepare("SELECT COALESCE(MAX(id), 0) + 1 AS siguiente FROM facturas")
    .get().siguiente;
  const numero = `FAC-${new Date().getFullYear()}-${String(siguienteNumero).padStart(6, "0")}`;
  const nombreCliente = orden.nombre || orden.empresa || "Cliente";

  const result = db
    .prepare(
      `
    INSERT INTO facturas (
      numero_factura, orden_id, pago_id, cliente_id, empresa_nombre,
      empresa_nombre_comercial, empresa_identificacion, empresa_direccion,
      empresa_telefono, empresa_correo, cliente_nombre, cliente_identificacion,
      cliente_correo, cliente_telefono, cliente_direccion, orden_fecha,
      metodo_pago, estado_pago, subtotal, total, monto_pagado, saldo, notas
    ) VALUES (
      @numero, @orden_id, @pago_id, @cliente_id, @empresa_nombre,
      @empresa_comercial, @empresa_identificacion, @empresa_direccion,
      @empresa_telefono, @empresa_correo, @cliente_nombre, @cliente_identificacion,
      @cliente_correo, @cliente_telefono, @cliente_direccion, @orden_fecha,
      @metodo_pago, 'pagado', @subtotal, @total, @monto_pagado, 0, @notas
    )
  `,
    )
    .run({
      numero,
      orden_id: ordenId,
      pago_id: pagoId,
      cliente_id: orden.cliente_id,
      empresa_nombre: EMPRESA.nombre,
      empresa_comercial: EMPRESA.comercial,
      empresa_identificacion: EMPRESA.identificacion,
      empresa_direccion: EMPRESA.direccion,
      empresa_telefono: EMPRESA.telefono,
      empresa_correo: EMPRESA.correo,
      cliente_nombre: nombreCliente,
      cliente_identificacion: orden.empresa,
      cliente_correo: orden.correo,
      cliente_telefono: orden.telefono,
      cliente_direccion: orden.direccion,
      orden_fecha: orden.fecha_creacion,
      metodo_pago: pago.metodo_pago,
      subtotal,
      total: Number(orden.total),
      monto_pagado: Number(totalPagado),
      notas: orden.notas,
    });

  const insertarDetalle = db.prepare(`
    INSERT INTO facturas_detalle
      (factura_id, producto_id, codigo_producto, descripcion, cantidad, precio_unitario, subtotal)
    VALUES (@factura_id, @producto_id, @codigo_producto, @descripcion, @cantidad, @precio_unitario, @subtotal)
  `);
  for (const item of detalle) {
    insertarDetalle.run({
      factura_id: result.lastInsertRowid,
      producto_id: item.producto_id,
      codigo_producto: item.codigo_producto,
      descripcion: item.producto_nombre || "Producto",
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
    });
  }
  return { id: result.lastInsertRowid };
}

function getById(id) {
  const db = getDb();
  const factura = db.prepare("SELECT * FROM facturas WHERE id = ?").get(id);
  if (!factura) return null;
  return {
    ...factura,
    detalle: db
      .prepare(
        "SELECT * FROM facturas_detalle WHERE factura_id = ? ORDER BY id",
      )
      .all(id),
  };
}

function getByPagoId(pagoId) {
  const factura = getDb()
    .prepare("SELECT id FROM facturas WHERE pago_id = ?")
    .get(pagoId);
  return factura ? getById(factura.id) : null;
}

module.exports = { crearParaPago, getById, getByPagoId };
