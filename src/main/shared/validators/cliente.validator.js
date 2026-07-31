const { z } = require("zod");

const clienteSchema = z.object({
  empresa: z.string().trim().optional().default(""),

  nombre: z
    .string({ required_error: "El nombre es obligatorio" })
    .trim()
    .min(1, "El nombre es obligatorio"),

  apellido: z
    .string({ required_error: "El apellido es obligatorio" })
    .trim()
    .min(1, "El apellido es obligatorio"),

  cedula: z.string().trim().optional().default(""),
  telefono: z.string().trim().optional().default(""),

  correo: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "El correo no es válido",
    }),

  direccion: z.string().trim().optional().default(""),
  notas: z.string().trim().optional().default(""),
  tiene_descuento: z.coerce.boolean().optional().default(false),
  descuento_porcentaje: z.coerce
    .number()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede superar 100%")
    .optional()
    .default(0),
});

const clienteImportSchema = clienteSchema.extend({
  balance_pendiente: z.coerce.number().optional().default(0),
  estado: z.enum(["activo", "inactivo"]).optional().default("activo"),
});

function validarClienteImport(data) {
  const resultado = clienteImportSchema.safeParse(data);
  if (!resultado.success) {
    const primerError = resultado.error.issues[0];
    return { ok: false, message: primerError?.message ?? "Datos inválidos" };
  }
  return { ok: true, data: resultado.data };
}

function validarCliente(data) {
  const resultado = clienteSchema.safeParse(data);

  if (!resultado.success) {
    const primerError = resultado.error.issues[0];
    return { ok: false, message: primerError?.message ?? "Datos inválidos" };
  }

  return { ok: true, data: resultado.data };
}

module.exports = {
  clienteSchema,
  validarCliente,
  clienteImportSchema,
  validarClienteImport,
};
