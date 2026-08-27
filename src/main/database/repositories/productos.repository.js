const { getDb } = require('../db')

function getAll() {
  return getDb()
    .prepare(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.nombre ASC
    `)
    .all()
}

function getById(id) {
  return getDb()
    .prepare(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `)
    .get(id)
}

function registrarMovimientoInventario(productoId, tipo, cantidad, observaciones = null, usuarioId = null) {
  return getDb().prepare(`
    INSERT INTO movimientos_inventario
      (producto_id, tipo, cantidad, observaciones, usuario_id)
    VALUES
      (?, ?, ?, ?, ?)
  `).run(productoId, tipo, cantidad, observaciones, usuarioId)
}

function create(data) {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO productos
      (nombre, categoria_id, cantidad, cantidad_paquete,
       numero_lote, cantidad_lote, precio_unitario,
       stock_minimo, material, color,
       sku, estado, notas)
    VALUES
      (@nombre, @categoria_id, @cantidad, @cantidad_paquete,
       @numero_lote, @cantidad_lote, @precio_unitario,
       @stock_minimo, @material, @color,
       @sku, @estado, @notas)
  `)
  const result = stmt.run(data)
  const producto = getById(result.lastInsertRowid)

  if (producto && Number(producto.cantidad || 0) > 0) {
    registrarMovimientoInventario(
      producto.id,
      'entrada',
      Number(producto.cantidad),
      `Creación de producto con stock inicial: ${producto.nombre}`,
      data.usuario_id ?? null,
    )
  }

  return producto
}

function update(id, data) {
  const productoActual = getById(id)
  const cantidadAnterior = Number(productoActual?.cantidad ?? 0)
  const cantidadNueva = Number(data.cantidad ?? cantidadAnterior)
  const diferencia = cantidadNueva - cantidadAnterior

  getDb().prepare(`
    UPDATE productos SET
      nombre            = @nombre,
      categoria_id      = @categoria_id,
      cantidad          = @cantidad,
      cantidad_paquete  = @cantidad_paquete,
      numero_lote       = @numero_lote,
      cantidad_lote     = @cantidad_lote,
      precio_unitario   = @precio_unitario,
      stock_minimo      = @stock_minimo,
      material          = @material,
      color             = @color,
      sku               = @sku,
      estado            = @estado,
      notas             = @notas,
      actualizado       = datetime('now')
    WHERE id = @id
  `).run({ ...data, id })

  if (diferencia !== 0) {
    registrarMovimientoInventario(
      id,
      diferencia > 0 ? 'entrada' : 'salida',
      Math.abs(diferencia),
      `Ajuste de stock por edición de producto (${cantidadAnterior} → ${cantidadNueva})`,
      data.usuario_id ?? null,
    )
  }

  return getById(id)
}

function remove(id, usuarioId = null) {
  const producto = getById(id)
  const cantidadActual = Number(producto?.cantidad ?? 0)

  if (producto && cantidadActual > 0) {
    registrarMovimientoInventario(
      id,
      'salida',
      cantidadActual,
      `Eliminación de producto: ${producto.nombre}`,
      usuarioId,
    )
  }

  return getDb()
    .prepare(`UPDATE productos SET cantidad = 0, estado = 'inactivo',
              actualizado = datetime('now') WHERE id = ?`)
    .run(id)
}

function getStockBajo() {
  return getDb()
    .prepare(`
      SELECT * FROM productos
      WHERE cantidad <= stock_minimo
        AND estado = 'activo'
      ORDER BY cantidad ASC
    `)
    .all()
}

module.exports = { getAll, getById, create, update, remove, getStockBajo }
