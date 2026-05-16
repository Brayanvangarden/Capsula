import { z } from 'zod'

export const loginSchema = z.object({
  usuario:  z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const productoSchema = z.object({
  nombre:          z.string().min(1, 'El nombre es requerido'),
  categoria_id:    z.number({ invalid_type_error: 'Seleccione una categoría' }),
  cantidad:        z.number().min(0, 'La cantidad no puede ser negativa'),
  precio_unitario: z.number().min(0, 'El precio no puede ser negativo'),
  stock_minimo:    z.number().min(0).default(0),
  estado:          z.enum(['activo', 'inactivo']).default('activo'),
})

export const clienteSchema = z.object({
  nombre:   z.string().min(1, 'El nombre es requerido'),
  empresa:  z.string().optional(),
  telefono: z.string().optional(),
  correo:   z.string().email('Correo inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
})

export const categoriaSchema = z.object({
  nombre:      z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  estado:      z.enum(['activo', 'inactivo']).default('activo'),
})

export const pagoSchema = z.object({
  cliente_id:  z.number({ invalid_type_error: 'Seleccione un cliente' }),
  monto:       z.number().min(1, 'El monto debe ser mayor a 0'),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'sinpe', 'otro']),
  orden_id:    z.number().optional().nullable(),
  notas:       z.string().optional(),
})

export const usuarioSchema = z.object({
  nombre:   z.string().min(1, 'El nombre es requerido'),
  usuario:  z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional(),
  rol:      z.enum(['admin', 'vendedor']),
  estado:   z.enum(['activo', 'inactivo']).default('activo'),
})
