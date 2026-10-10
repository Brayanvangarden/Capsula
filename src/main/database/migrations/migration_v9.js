function addColumns(db, table, columns) {
  const existing = new Set(
    db.prepare(`PRAGMA table_info(${table})`).all().map((column) => column.name),
  );

  for (const [name, definition] of columns) {
    if (!existing.has(name)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
    }
  }
}

function up(db) {
  const migrate = db.transaction(() => {
    addColumns(db, "ordenes", [
      [
        "ship_to_cliente_id",
        "INTEGER REFERENCES clientes(id) ON DELETE SET NULL",
      ],
      ["ship_to_nombre", "TEXT"],
      ["ship_to_empresa", "TEXT"],
      ["ship_to_direccion", "TEXT"],
      ["ship_to_telefono", "TEXT"],
      ["ship_to_correo", "TEXT"],
    ]);
    addColumns(db, "facturas", [
      ["ship_to_cliente_id", "INTEGER"],
      ["ship_to_nombre", "TEXT"],
      ["ship_to_empresa", "TEXT"],
      ["ship_to_direccion", "TEXT"],
      ["ship_to_telefono", "TEXT"],
      ["ship_to_correo", "TEXT"],
    ]);
  });

  migrate();
  console.log("Migration v9 applied: orders and invoices store Ship To details");
}

function down() {}

module.exports = { up, down };