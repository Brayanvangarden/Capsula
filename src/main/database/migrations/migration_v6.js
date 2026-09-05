function up(db) {
  const columns = db.prepare("PRAGMA table_info(pagos)").all();
  const hasTipoPago = columns.some((column) => column.name === "tipo_pago");

  if (!hasTipoPago) {
    db.exec(
      "ALTER TABLE pagos ADD COLUMN tipo_pago TEXT NOT NULL DEFAULT 'abono' CHECK(tipo_pago IN ('pago_total','abono'))",
    );
    console.log("Migration v6 applied: pagos now stores tipo_pago");
  }
}

function down() {}

module.exports = { up, down };