export const cuentasPorCobrarService = {
  getResumen: async () => {
    const res = await window.api.cuentasPorCobrar.getResumen();
    if (!res.ok) throw new Error(res.message);
    return res.data;
  },

  getEstadoCuenta: async (clienteId, mes) => {
    const res = await window.api.cuentasPorCobrar.getEstadoCuenta(
      clienteId,
      mes,
    );
    if (!res.ok) throw new Error(res.message);
    return res.data;
  },
};
