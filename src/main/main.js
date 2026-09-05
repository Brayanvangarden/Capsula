const { app, BrowserWindow } = require("electron");
const http = require("http");
const path = require("path");
const isDev = !app.isPackaged;

const { initDatabase } = require("./database/initDatabase");

// ── Importar todos los handlers IPC ───────────────
const { registerAuthIpc } = require("./ipc/auth.ipc");
const { registerCategoriasIpc } = require("./ipc/categorias.ipc");
const { registerProductosIpc } = require("./ipc/productos.ipc");
const { registerInventarioIpc } = require("./ipc/inventario.ipc");
const { registerClientesIpc } = require("./ipc/clientes.ipc");
const { registerOrdenesIpc } = require("./ipc/ordenes.ipc");
const { registerPagosIpc } = require("./ipc/pagos.ipc");
const { registerFacturasIpc } = require("./ipc/facturas.ipc");
const { registerCuentasPorCobrarIpc } = require("./ipc/cuentas_por_cobrar.ipc");
const { registerUsuariosIpc } = require("./ipc/usuarios.ipc");

function getDevUrl() {
  const ports = [4173, 4174, 4175, 5173, 5174];

  return new Promise((resolve) => {
    const tryPort = (index) => {
      if (index >= ports.length) {
        resolve("http://localhost:4173");
        return;
      }

      const port = ports[index];
      const req = http.get(
        { hostname: "localhost", port, path: "/" },
        (res) => {
          res.resume();
          resolve(`http://localhost:${port}`);
        },
      );

      req.on("error", () => tryPort(index + 1));
      req.setTimeout(400, () => {
        req.destroy();
        tryPort(index + 1);
      });
    };

    tryPort(0);
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    const devUrl = await getDevUrl();
    win.loadURL(devUrl);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
}

app
  .whenReady()
  .then(() => {
    // 1️⃣ Iniciar base de datos
    initDatabase();

    // 2️⃣ Registrar todos los handlers IPC
    registerAuthIpc();
    registerCategoriasIpc();
    registerProductosIpc();
    registerInventarioIpc();
    registerClientesIpc();
    registerOrdenesIpc();
    registerPagosIpc();
    registerFacturasIpc();
    registerCuentasPorCobrarIpc();
    registerUsuariosIpc();

    // 3️⃣ Crear ventana
    createWindow();
  })
  .catch((error) => {
    console.error("❌ Error en app.whenReady():", error);
    app.quit();
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
