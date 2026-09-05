const { ipcMain } = require("electron");
const cuentasPorCobrarRepository = require("../database/repositories/cuentas_por_cobrar.repository");

function registerCuentasPorCobrarIpc() {
  ipcMain.handle("cuentasPorCobrar:getResumen", async () => {
    try {
      return { ok: true, data: cuentasPorCobrarRepository.getResumen() };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  });

  ipcMain.handle(
    "cuentasPorCobrar:getEstadoCuenta",
    async (_, { clienteId, mes } = {}) => {
      try {
        const data = cuentasPorCobrarRepository.getEstadoCuenta(clienteId, mes);
        if (!data) return { ok: false, message: "Cliente no encontrado" };
        return { ok: true, data };
      } catch (error) {
        return { ok: false, message: error.message };
      }
    },
  );
}

module.exports = { registerCuentasPorCobrarIpc };
