function up(db) {
  const tableSql = db
    .prepare(
      "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'pagos'",
    )
    .get();

  if (!tableSql || tableSql.sql.includes("'datafono'")) {
    return;
  }

  db.pragma("foreign_keys = OFF");

  try {
    const migrate = db.transaction(() => {
      db.exec(`
        CREATE TABLE pagos_new (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          cliente_id  INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
          orden_id    INTEGER REFERENCES ordenes(id) ON DELETE SET NULL,
          monto       REAL NOT NULL,
          metodo_pago TEXT NOT NULL CHECK(metodo_pago IN (
            'efectivo', 'cheque', 'datafono', 'zelle',
            'transferencia', 'sinpe', 'otro'
          )),
          fecha_pago  TEXT NOT NULL DEFAULT (datetime('now')),
          notas       TEXT,
          usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
        )
      `);

      db.exec(`
        INSERT INTO pagos_new (
          id, cliente_id, orden_id, monto, metodo_pago, fecha_pago, notas, usuario_id
        )
        SELECT id, cliente_id, orden_id, monto, metodo_pago, fecha_pago, notas, usuario_id
        FROM pagos
      `);

      db.exec("DROP TABLE pagos");
      db.exec("ALTER TABLE pagos_new RENAME TO pagos");
    });

    migrate();
    console.log("Migration v5 applied: pagos accepts datafono and zelle");
  } finally {
    db.pragma("foreign_keys = ON");
  }
}

function down() {}

module.exports = { up, down };
