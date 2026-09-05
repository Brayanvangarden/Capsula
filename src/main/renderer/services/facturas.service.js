export const facturasService = {
  getHistorial: async (filtros = {}) => {
    const res = await window.api.facturas.getHistorial(filtros);
    if (!res.ok) throw new Error(res.message);
    return res.data;
  },

  getById: async (id) => {
    const res = await window.api.facturas.getById(id);
    if (!res.ok) throw new Error(res.message);
    return res.data;
  },

  getByPagoId: async (pagoId) => {
    const res = await window.api.facturas.getByPagoId(pagoId);
    if (!res.ok) throw new Error(res.message);
    return res.data;
  },
};
