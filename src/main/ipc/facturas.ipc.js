const { ipcMain } = require("electron");
const facturasRepository = require("../database/repositories/facturas.repository");

function registerFacturasIpc() {
  ipcMain.handle("facturas:getById", async (_, id) => {
    try {
      const data = facturasRepository.getById(id);
      if (!data) return { ok: false, message: "Factura no encontrada" };
      return { ok: true, data };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  });

  ipcMain.handle("facturas:getByPagoId", async (_, pagoId) => {
    try {
      return { ok: true, data: facturasRepository.getByPagoId(pagoId) };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  });
}

module.exports = { registerFacturasIpc };
