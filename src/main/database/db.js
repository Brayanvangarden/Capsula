const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')
const { app }  = require('electron')

let db = null

function getDbPath() {
  // En producción usa la carpeta userData de Electron
  // En desarrollo usa la raíz del proyecto
  const isDev = !app.isPackaged
  if (isDev) {
    return path.join(process.cwd(), 'capsulas.db')
  }
  return path.join(app.getPath('userData'), 'capsulas.db')
}

function getDb() {
  if (!db) {
    const dbPath = getDbPath()
    db = new Database(dbPath, {
      verbose: process.env.NODE_ENV === 'development'
        ? console.log
        : null
    })

    // Configuración de rendimiento
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    db.pragma('synchronous = NORMAL')
  }
  return db
}

function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}

module.exports = { getDb, closeDb, getDbPath }
