PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ════════════════════════════════════════
--  USUARIOS Y ROLES
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usuarios (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre        TEXT    NOT NULL,
  usuario       TEXT    NOT NULL UNIQUE,
  correo        TEXT    NOT NULL DEFAULT '',
  password      TEXT    NOT NULL,
  rol           TEXT    NOT NULL CHECK(rol IN ('admin', 'vendedor')),
  estado        TEXT    NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until  TEXT,
  reset_code    TEXT,
  reset_expires TEXT,
  creado_en     TEXT    NOT NULL DEFAULT (datetime('now')),
  actualizado   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ════════════════════════════════════════
--  CATEGORÍAS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS categorias (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL UNIQUE,
  descripcion TEXT,
  estado      TEXT    NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
  creado_en   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ════════════════════════════════════════
--  PRODUCTOS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS productos (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre              TEXT    NOT NULL,
  categoria_id        INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  cantidad            REAL    NOT NULL DEFAULT 0,
  cantidad_paquete    REAL    NOT NULL DEFAULT 1,
  numero_lote         TEXT,
  cantidad_lote       REAL    DEFAULT 0,
  precio_unitario     REAL    NOT NULL DEFAULT 0,
  stock_minimo        REAL    NOT NULL DEFAULT 0,
  material            TEXT,
  color               TEXT,
  sku                 TEXT    NOT NULL UNIQUE,
  estado              TEXT    NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
  notas               TEXT,
  creado_en           TEXT    NOT NULL DEFAULT (datetime('now')),
  actualizado         TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ════════════════════════════════════════
--  MOVIMIENTOS DE INVENTARIO
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id   INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tipo          TEXT    NOT NULL CHECK(tipo IN ('entrada', 'salida')),
  cantidad      REAL    NOT NULL,
  observaciones TEXT,
  usuario_id    INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha         TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ════════════════════════════════════════
--  CLIENTES
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS clientes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa          TEXT,
  nombre           TEXT    NOT NULL,
  telefono         TEXT    NOT NULL DEFAULT '',
  correo           TEXT    NOT NULL DEFAULT '',
  direccion        TEXT    NOT NULL DEFAULT '',
  notas            TEXT,
  balance_pendiente     REAL    NOT NULL DEFAULT 0,
  tiene_descuento       INTEGER NOT NULL DEFAULT 0 CHECK(tiene_descuento IN (0, 1)),
  descuento_porcentaje  REAL    NOT NULL DEFAULT 0,
  estado           TEXT    NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
  creado_en        TEXT    NOT NULL DEFAULT (datetime('now')),
  actualizado      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ════════════════════════════════════════
--  PRECIOS ESPECIALES POR CLIENTE
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS clientes_precios (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id      INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  producto_id     INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  precio_unitario REAL    NOT NULL DEFAULT 0,
  creado_en       TEXT    NOT NULL DEFAULT (datetime('now')),
  actualizado     TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(cliente_id, producto_id)
);

-- ════════════════════════════════════════
--  ÓRDENES
-- ════════════════════════════════
CREATE TABLE IF NOT EXISTS ordenes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id      INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  fecha_creacion  TEXT    NOT NULL DEFAULT (datetime('now')),
  fecha_entrega   TEXT,
  estado          TEXT    NOT NULL DEFAULT 'pendiente'
                    CHECK(estado IN ('pendiente','en_proceso','completada','cancelada')),
  estado_pago     TEXT    NOT NULL DEFAULT 'pendiente'
                    CHECK(estado_pago IN ('pendiente','parcial','pagado')),
  total           REAL    NOT NULL DEFAULT 0,
  notas           TEXT,
  usuario_id      INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════
--  DETALLE DE ÓRDENES
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ordenes_detalle (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  orden_id        INTEGER NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id     INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  cantidad        REAL    NOT NULL,
  precio_unitario REAL    NOT NULL,
  subtotal        REAL    NOT NULL
);

-- ════════════════════════════════════════
--  PAGOS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pagos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id  INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  orden_id    INTEGER REFERENCES ordenes(id) ON DELETE SET NULL,
  monto       REAL    NOT NULL,
  tipo_pago   TEXT    NOT NULL DEFAULT 'abono' CHECK(tipo_pago IN ('pago_total','abono')),
  metodo_pago TEXT    NOT NULL CHECK(metodo_pago IN ('efectivo','cheque','datafono','zelle')),
  fecha_pago  TEXT    NOT NULL DEFAULT (datetime('now')),
  notas       TEXT,
  usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ════════════════════════════════════════
--  FACTURAS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS facturas (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_factura        TEXT NOT NULL UNIQUE,
  orden_id              INTEGER NOT NULL UNIQUE REFERENCES ordenes(id) ON DELETE RESTRICT,
  pago_id               INTEGER NOT NULL UNIQUE REFERENCES pagos(id) ON DELETE RESTRICT,
  cliente_id            INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  fecha_emision         TEXT NOT NULL DEFAULT (datetime('now')),
  estado                TEXT NOT NULL DEFAULT 'emitida' CHECK(estado IN ('emitida','anulada')),
  empresa_nombre        TEXT NOT NULL,
  empresa_nombre_comercial TEXT NOT NULL,
  empresa_identificacion TEXT NOT NULL,
  empresa_direccion     TEXT NOT NULL,
  empresa_telefono      TEXT NOT NULL,
  empresa_correo        TEXT NOT NULL,
  cliente_nombre        TEXT NOT NULL,
  cliente_identificacion TEXT,
  cliente_correo        TEXT,
  cliente_telefono      TEXT,
  cliente_direccion     TEXT,
  orden_fecha           TEXT NOT NULL,
  metodo_pago           TEXT NOT NULL,
  estado_pago           TEXT NOT NULL,
  subtotal              REAL NOT NULL DEFAULT 0,
  descuentos            REAL NOT NULL DEFAULT 0,
  impuestos             REAL NOT NULL DEFAULT 0,
  total                 REAL NOT NULL DEFAULT 0,
  monto_pagado          REAL NOT NULL DEFAULT 0,
  saldo                 REAL NOT NULL DEFAULT 0,
  notas                 TEXT
);

CREATE TABLE IF NOT EXISTS facturas_detalle (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  factura_id        INTEGER NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  producto_id       INTEGER REFERENCES productos(id) ON DELETE SET NULL,
  codigo_producto   TEXT,
  descripcion       TEXT NOT NULL,
  cantidad          REAL NOT NULL,
  precio_unitario   REAL NOT NULL,
  descuento         REAL NOT NULL DEFAULT 0,
  impuesto          REAL NOT NULL DEFAULT 0,
  subtotal          REAL NOT NULL
);

-- ════════════════════════════════════════
--  HISTORIAL DE MOVIMIENTOS (LOG)
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS historial (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo        TEXT    NOT NULL,
  modulo      TEXT    NOT NULL,
  descripcion TEXT    NOT NULL,
  usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha       TEXT    NOT NULL DEFAULT (datetime('now'))
);
