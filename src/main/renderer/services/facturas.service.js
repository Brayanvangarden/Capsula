export const facturasService = {
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
