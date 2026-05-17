const { app, BrowserWindow } = require('electron')
const path     = require('path')
const isDev    = require('electron-is-dev')

const { initDatabase }       = require('./database/initDatabase')

// ── Importar todos los handlers IPC ───────────────
const { registerAuthIpc }       = require('./ipc/auth.ipc')
const { registerCategoriasIpc } = require('./ipc/categorias.ipc')
const { registerProductosIpc }  = require('./ipc/productos.ipc')
const { registerInventarioIpc } = require('./ipc/inventario.ipc')
const { registerClientesIpc }   = require('./ipc/clientes.ipc')
const { registerOrdenesIpc }    = require('./ipc/ordenes.ipc')
const { registerPagosIpc }      = require('./ipc/pagos.ipc')
const { registerUsuariosIpc }   = require('./ipc/usuarios.ipc')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false
    }
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
  }
}

app.whenReady().then(() => {
  // 1️⃣ Iniciar base de datos
  initDatabase()

  // 2️⃣ Registrar todos los handlers IPC
  registerAuthIpc()
  registerCategoriasIpc()
  registerProductosIpc()
  registerInventarioIpc()
  registerClientesIpc()
  registerOrdenesIpc()
  registerPagosIpc()
  registerUsuariosIpc()

  // 3️⃣ Crear ventana
  createWindow()
}).catch(error => {
  console.error('❌ Error en app.whenReady():', error)
  app.quit()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
