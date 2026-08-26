function up(db) {
  const columns = db.prepare('PRAGMA table_info(clientes)').all()
  const existingColumns = new Set(columns.map(column => column.name))

  if (!existingColumns.has('notas')) {
    db.exec(`ALTER TABLE clientes ADD COLUMN notas TEXT`)
  }

  console.log('📦 Migración v1 aplicada')
}

function down(db) {
  // Revertir cambios si fuera necesario
}

module.exports = { up, down }
