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
    ensureClientesColumns(db)
    ensureUsuariosColumns(db)
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

function ensureClientesColumns(db) {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'clientes'").get()
  if (!table) return

  const columns = db.prepare('PRAGMA table_info(clientes)').all()
  const existing = new Set(columns.map(column => column.name))

  const additions = [
    ['apellido', 'TEXT'],
    ['cedula', 'TEXT'],
    ['notas', 'TEXT'],
  ]

  for (const [name, type] of additions) {
    if (!existing.has(name)) {
      db.exec(`ALTER TABLE clientes ADD COLUMN ${name} ${type}`)
      console.log(`✅ Columna agregada a clientes: ${name}`)
    }
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
