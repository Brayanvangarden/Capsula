function up(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS facturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_factura TEXT NOT NULL UNIQUE,
      orden_id INTEGER NOT NULL UNIQUE REFERENCES ordenes(id) ON DELETE RESTRICT,
      pago_id INTEGER NOT NULL UNIQUE REFERENCES pagos(id) ON DELETE RESTRICT,
      cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
      fecha_emision TEXT NOT NULL DEFAULT (datetime('now')),
      estado TEXT NOT NULL DEFAULT 'emitida' CHECK(estado IN ('emitida','anulada')),
      empresa_nombre TEXT NOT NULL,
      empresa_nombre_comercial TEXT NOT NULL,
      empresa_identificacion TEXT NOT NULL,
      empresa_direccion TEXT NOT NULL,
      empresa_telefono TEXT NOT NULL,
      empresa_correo TEXT NOT NULL,
      cliente_nombre TEXT NOT NULL,
      cliente_identificacion TEXT,
      cliente_correo TEXT,
      cliente_telefono TEXT,
      cliente_direccion TEXT,
      orden_fecha TEXT NOT NULL,
      metodo_pago TEXT NOT NULL,
      estado_pago TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      descuentos REAL NOT NULL DEFAULT 0,
      impuestos REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      monto_pagado REAL NOT NULL DEFAULT 0,
      saldo REAL NOT NULL DEFAULT 0,
      notas TEXT
    );

    CREATE TABLE IF NOT EXISTS facturas_detalle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      factura_id INTEGER NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
      producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
      codigo_producto TEXT,
      descripcion TEXT NOT NULL,
      cantidad REAL NOT NULL,
      precio_unitario REAL NOT NULL,
      descuento REAL NOT NULL DEFAULT 0,
      impuesto REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL
    );
  `);
}

function down(db) {
  db.exec(
    "DROP TABLE IF EXISTS facturas_detalle; DROP TABLE IF EXISTS facturas",
  );
}

module.exports = { up, down };
