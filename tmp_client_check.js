const { getDb } = require('./src/main/database/db');

const db = getDb();
const cols = db.prepare('PRAGMA table_info(clientes)').all().map(c => c.name);
console.log('COLUMNS=' + cols.join(','));

const hasLegacy = cols.includes('apellido') || cols.includes('cedula');
if (hasLegacy) {
  console.log('LEGACY_DETECTED');
  db.pragma('foreign_keys = OFF');
  db.exec('ALTER TABLE clientes RENAME TO clientes_legacy');
  db.exec(`CREATE TABLE clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa TEXT,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL DEFAULT '',
    correo TEXT NOT NULL DEFAULT '',
    direccion TEXT NOT NULL DEFAULT '',
    notas TEXT,
    balance_pendiente REAL NOT NULL DEFAULT 0,
    tiene_descuento INTEGER NOT NULL DEFAULT 0 CHECK(tiene_descuento IN (0, 1)),
    descuento_porcentaje REAL NOT NULL DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    actualizado TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  db.exec(`INSERT INTO clientes (id, empresa, nombre, telefono, correo, direccion, notas, balance_pendiente, tiene_descuento, descuento_porcentaje, estado, creado_en, actualizado)
    SELECT id, empresa, nombre, COALESCE(telefono, ''), COALESCE(correo, ''), COALESCE(direccion, ''), COALESCE(notas, ''), COALESCE(balance_pendiente, 0), COALESCE(tiene_descuento, 0), COALESCE(descuento_porcentaje, 0), COALESCE(estado, 'activo'), COALESCE(creado_en, datetime('now')), COALESCE(actualizado, datetime('now')) FROM clientes_legacy`);
  db.exec('DROP TABLE clientes_legacy');
  db.pragma('foreign_keys = ON');
}

const finalCols = db.prepare('PRAGMA table_info(clientes)').all().map(c => c.name);
console.log('FINAL=' + finalCols.join(','));

try {
  db.prepare(`INSERT INTO clientes (empresa, nombre, telefono, correo, direccion, notas, tiene_descuento, descuento_porcentaje) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run('X', 'Y', '1', 'x@y.com', 'Z', '', 0, 0);
  console.log('INSERT_OK');
} catch (error) {
  console.error('INSERT_ERR=' + error.message);
  process.exit(1);
}
