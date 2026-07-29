PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ════════════════════════════════════════
--  USUARIOS Y ROLES
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usuarios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL,
  usuario     TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,
  rol         TEXT    NOT NULL CHECK(rol IN ('admin', 'vendedor')),
  estado      TEXT    NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
  creado_en   TEXT    NOT NULL DEFAULT (datetime('now')),
  actualizado TEXT    NOT NULL DEFAULT (datetime('now'))
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
  fecha_vencimiento   TEXT,
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
  telefono         TEXT,
  correo           TEXT,
  direccion        TEXT,
  balance_pendiente REAL   NOT NULL DEFAULT 0,
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
  metodo_pago TEXT    NOT NULL CHECK(metodo_pago IN ('efectivo','transferencia','sinpe','otro')),
  fecha_pago  TEXT    NOT NULL DEFAULT (datetime('now')),
  notas       TEXT,
  usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
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
