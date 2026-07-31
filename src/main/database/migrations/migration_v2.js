function columnaExiste(db, tabla, columna) {
  const columnas = db.prepare(`PRAGMA table_info(${tabla})`).all()
  return columnas.some(c => c.name === columna)
}

function up(db) {
  if (!columnaExiste(db, 'clientes', 'tiene_descuento')) {
    db.exec(`ALTER TABLE clientes ADD COLUMN tiene_descuento INTEGER NOT NULL DEFAULT 0`)
  }
  if (!columnaExiste(db, 'clientes', 'descuento_porcentaje')) {
    db.exec(`ALTER TABLE clientes ADD COLUMN descuento_porcentaje REAL NOT NULL DEFAULT 0`)
  }
  console.log('📦 Migración v2 aplicada: tiene_descuento, descuento_porcentaje en clientes')
}

function down(db) {}

module.exports = { up, down }