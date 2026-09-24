const { z } = require("zod");

const numeroNoNegativo = z.coerce
	.number()
	.finite()
	.min(0, "El valor no puede ser negativo");

const categoriaId = z.preprocess(
	(value) => (value === "" || value == null ? null : value),
	z.coerce.number().int().positive().nullable(),
);

const productoImportSchema = z.object({
	nombre: z
		.string({ required_error: "El nombre es obligatorio" })
		.trim()
		.min(1, "El nombre es obligatorio"),
	categoria_id: categoriaId.optional().default(null),
	cantidad: numeroNoNegativo.optional().default(0),
	cantidad_paquete: numeroNoNegativo.optional().default(1),
	numero_lote: z.string().trim().nullable().optional().default(null),
	cantidad_lote: numeroNoNegativo.optional().default(0),
	precio_unitario: numeroNoNegativo.optional().default(0),
	stock_minimo: numeroNoNegativo.optional().default(0),
	material: z.string().trim().nullable().optional().default(null),
	color: z.string().trim().nullable().optional().default(null),
	sku: z
		.string({ required_error: "El SKU es obligatorio" })
		.trim()
		.min(1, "El SKU es obligatorio"),
	estado: z.enum(["activo", "inactivo"]).optional().default("activo"),
	notas: z.string().trim().optional().default(""),
	usuario_id: z.coerce.number().int().nullable().optional().default(null),
});

function validarProductoImport(data) {
	const resultado = productoImportSchema.safeParse(data);
	if (!resultado.success) {
		const primerError = resultado.error.issues[0];
		return { ok: false, message: primerError?.message ?? "Datos inválidos" };
	}

	return { ok: true, data: resultado.data };
}

module.exports = { productoImportSchema, validarProductoImport };
