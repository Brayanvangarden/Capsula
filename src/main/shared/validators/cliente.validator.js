const { z } = require('zod')

const clienteSchema = z.object({
  empresa: z.string().trim().optional().default(''),

  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre es obligatorio'),

  apellido: z
    .string({ required_error: 'El apellido es obligatorio' })
    .trim()
    .min(1, 'El apellido es obligatorio'),

  cedula: z.string().trim().optional().default(''),
  telefono: z.string().trim().optional().default(''),

  correo: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'El correo no es válido',
    }),

  direccion: z.string().trim().optional().default(''),
  notas: z.string().trim().optional().default(''),
})

function validarCliente(data) {
  const resultado = clienteSchema.safeParse(data)

  if (!resultado.success) {
    const primerError = resultado.error.issues[0]
    return { ok: false, message: primerError?.message ?? 'Datos inválidos' }
  }

  return { ok: true, data: resultado.data }
}

module.exports = { clienteSchema, validarCliente }