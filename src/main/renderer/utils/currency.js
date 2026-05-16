/**
 * Formatea un número como colones costarricenses
 * Ejemplo: 12500 → ₡12,500.00
 */
export const formatCRC = (monto) =>
  new Intl.NumberFormat('es-CR', {
    style:    'currency',
    currency: 'CRC',
    minimumFractionDigits: 2
  }).format(monto ?? 0)

/**
 * Parsea un string de moneda a número
 * Ejemplo: "₡12,500.00" → 12500
 */
export const parseCRC = (str) =>
  parseFloat(String(str).replace(/[^0-9.-]+/g, '')) || 0
