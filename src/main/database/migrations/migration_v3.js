function up(db) {
  const columnas = db.prepare(`PRAGMA table_info(clientes)`).all()
  const tieneApellido = columnas.some((c) => c.name === "apellido")
  const tieneCedula = columnas.some((c) => c.name === "cedula")

  if (!tieneApellido && !tieneCedula) {
    console.log("📦 Migración v3: ya está sin campos legacy, se omite")
    return
  }

  db.pragma("foreign_keys = OFF")

  const transaccion = db.transaction(() => {
    db.exec(`UPDATE clientes SET telefono  = '' WHERE telefono  IS NULL`)
    db.exec(`UPDATE clientes SET correo    = '' WHERE correo    IS NULL`)
    db.exec(`UPDATE clientes SET direccion = '' WHERE direccion IS NULL`)

    db.exec(`
      CREATE TABLE clientes_new (
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
      )
    `)

    db.exec(`
      INSERT INTO clientes_new (
        id, empresa, nombre, telefono, correo, direccion, notas,
        balance_pendiente, tiene_descuento, descuento_porcentaje, estado, creado_en, actualizado
      )
      SELECT
        id, empresa, nombre, telefono, correo, direccion, notas,
        balance_pendiente, tiene_descuento, descuento_porcentaje, estado, creado_en, actualizado
      FROM clientes
    `)

    db.exec(`DROP TABLE clientes`)
    db.exec(`ALTER TABLE clientes_new RENAME TO clientes`)
  })

  try {
    transaccion()
    console.log("📦 Migración v3 aplicada: clientes sin apellido/cedula")
  } finally {
    db.pragma("foreign_keys = ON")
  }
}
function down(db) {}

module.exports = { up, down }
