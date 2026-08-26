const bcrypt = require('bcryptjs')
const fs     = require('fs')
const path   = require('path')
const { getDb } = require('./db')

function initDatabase() {
  const db = getDb()

  try {
    // 1️⃣ Leer y ejecutar schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema     = fs.readFileSync(schemaPath, 'utf-8')
    db.exec(schema)
    repairLegacyClienteColumns(db)
    ensureClientesColumns(db)
    ensureUsuariosColumns(db)
    ensureProductosColumns(db)
    console.log('✅ Esquema de base de datos creado')

    // 2️⃣ Verificar si necesita seeds (primera vez o si faltan datos)
    const userCount = db
      .prepare('SELECT COUNT(*) as total FROM usuarios')
      .get()

    const clienteCount = db
      .prepare('SELECT COUNT(*) as total FROM clientes')
      .get()

    if (userCount.total === 0 || clienteCount.total === 0) {
      const seedsPath = path.join(__dirname, 'seeds.sql')
      const seeds     = fs.readFileSync(seedsPath, 'utf-8')
      db.exec(seeds)
      console.log('✅ Datos iniciales cargados (seeds)')
    }

    // 3️⃣ Re-hash passwords no almacenadas con bcrypt
    hashLegacyPasswords(db)

    // 4️⃣ Ejecutar migraciones
    runMigrations(db)

    console.log('✅ Base de datos lista')
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error)
    throw error
  }
}

function ensureUsuariosColumns(db) {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'usuarios'").get()
  if (!table) return

  const columns = db.prepare('PRAGMA table_info(usuarios)').all()
  const existing = new Set(columns.map(column => column.name))

  const additions = [
    ['correo', 'TEXT NOT NULL DEFAULT ""'],
    ['failed_attempts', 'INTEGER NOT NULL DEFAULT 0'],
    ['locked_until', 'TEXT'],
    ['reset_code', 'TEXT'],
    ['reset_expires', 'TEXT'],
  ]

  for (const [name, type] of additions) {
    if (!existing.has(name)) {
      db.exec(`ALTER TABLE usuarios ADD COLUMN ${name} ${type}`)
      console.log(`✅ Columna agregada a usuarios: ${name}`)
    }
  }
}

function hashLegacyPasswords(db) {
  const users = db.prepare('SELECT id, password FROM usuarios').all()
  const needUpdate = users.filter((user) => !user.password?.startsWith('$2'))
  if (!needUpdate.length) return

  const update = db.prepare('UPDATE usuarios SET password = ? WHERE id = ?')
  const transaction = db.transaction((items) => {
    for (const item of items) {
      const hash = bcrypt.hashSync(item.password, 10)
      update.run(hash, item.id)
    }
  })

  transaction(needUpdate)
  console.log(`✅ Re-hashed ${needUpdate.length} contraseñas heredadas con bcrypt`)
}

function repairLegacyClienteColumns(db) {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'clientes'").get()
  if (!table) return

  const columns = db.prepare('PRAGMA table_info(clientes)').all()
  const existing = new Set(columns.map(column => column.name))

  if (!existing.has('apellido') && !existing.has('cedula')) {
    return
  }

  console.log('⚠️ Se detectaron columnas legacy en clientes: apellido/cedula. Reparando estructura...')
  db.pragma('foreign_keys = OFF')

  try {
    db.exec('ALTER TABLE clientes RENAME TO clientes_legacy')

    db.exec(`
      CREATE TABLE clientes (
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
      INSERT INTO clientes (
        id, empresa, nombre, telefono, correo, direccion, notas,
        balance_pendiente, tiene_descuento, descuento_porcentaje, estado, creado_en, actualizado
      )
      SELECT
        id, empresa, nombre,
        COALESCE(telefono, ''),
        COALESCE(correo, ''),
        COALESCE(direccion, ''),
        COALESCE(notas, ''),
        COALESCE(balance_pendiente, 0),
        COALESCE(tiene_descuento, 0),
        COALESCE(descuento_porcentaje, 0),
        COALESCE(estado, 'activo'),
        COALESCE(creado_en, datetime('now')),
        COALESCE(actualizado, datetime('now'))
      FROM clientes_legacy
    `)

    db.exec('DROP TABLE clientes_legacy')
    console.log('✅ Estructura de clientes reparada sin apellido ni cedula')
  } finally {
    db.pragma('foreign_keys = ON')
  }
}

function ensureClientesColumns(db) {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'clientes'").get()
  if (!table) return

  const columns = db.prepare('PRAGMA table_info(clientes)').all()
  const existing = new Set(columns.map(column => column.name))

  const additions = [
    ['notas', 'TEXT'],
  ]

  for (const [name, type] of additions) {
    if (!existing.has(name)) {
      db.exec(`ALTER TABLE clientes ADD COLUMN ${name} ${type}`)
      console.log(`✅ Columna agregada a clientes: ${name}`)
    }
  }
}

function ensureProductosColumns(db) {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'productos'").get()
  if (!table) return

  const columns = db.prepare('PRAGMA table_info(productos)').all()
  const existing = new Set(columns.map(column => column.name))

  if (!existing.has('sku')) {
    db.exec('ALTER TABLE productos ADD COLUMN sku TEXT')
    console.log('✅ Columna agregada a productos: sku')
  }
}

function runMigrations(db) {
  // Tabla de control de migraciones
  db.exec(`
    CREATE TABLE IF NOT EXISTS migraciones (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      version   TEXT NOT NULL UNIQUE,
      ejecutado TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // Cargar y ejecutar migraciones pendientes
  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.js'))
    .sort()

  for (const file of files) {
    const version = file.replace('.js', '')
    const applied = db
      .prepare('SELECT id FROM migraciones WHERE version = ?')
      .get(version)

    if (!applied) {
      const migration = require(path.join(migrationsDir, file))
      migration.up(db)
      db.prepare('INSERT INTO migraciones (version) VALUES (?)').run(version)
      console.log(`✅ Migración aplicada: ${version}`)
    }
  }
}

module.exports = { initDatabase }
