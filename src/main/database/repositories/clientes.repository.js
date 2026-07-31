const { getDb } = require("../db");

function getAll(includeInactive = false) {
  if (includeInactive) {
    return getDb().prepare(`SELECT * FROM clientes ORDER BY nombre ASC`).all();
  }
  return getDb()
    .prepare(
      `SELECT * FROM clientes WHERE estado = 'activo' ORDER BY nombre ASC`,
    )
    .all();
}

function getById(id) {
  return getDb().prepare("SELECT * FROM clientes WHERE id = ?").get(id);
}

function create(data) {
  const result = getDb().prepare(`
    INSERT INTO clientes (empresa, nombre, apellido, cedula, telefono, correo, direccion, notas, tiene_descuento, descuento_porcentaje)
    VALUES (@empresa, @nombre, @apellido, @cedula, @telefono, @correo, @direccion, @notas, @tiene_descuento, @descuento_porcentaje)
  `).run({
    empresa: data.empresa ?? '',
    nombre: data.nombre,
    apellido: data.apellido ?? '',
    cedula: data.cedula ?? '',
    telefono: data.telefono ?? '',
    correo: data.correo ?? '',
    direccion: data.direccion ?? '',
    notas: data.notas ?? null,
    tiene_descuento: data.tiene_descuento ? 1 : 0,
    descuento_porcentaje: Number(data.descuento_porcentaje ?? 0),
  })
  return getById(result.lastInsertRowid)
}

function update(id, data) {
  getDb()
    .prepare(
      `
    UPDATE clientes SET
      empresa    = @empresa,
      nombre     = @nombre,
      apellido   = @apellido,
      cedula     = @cedula,
      telefono   = @telefono,
      correo     = @correo,
      direccion  = @direccion,
      notas      = @notas,
      tiene_descuento = @tiene_descuento,
      descuento_porcentaje = @descuento_porcentaje,
      actualizado = datetime('now')
    WHERE id = @id
  `,
    )
    .run({
      empresa: data.empresa ?? '',
      nombre: data.nombre,
      apellido: data.apellido ?? '',
      cedula: data.cedula ?? '',
      telefono: data.telefono ?? '',
      correo: data.correo ?? '',
      direccion: data.direccion ?? '',
      notas: data.notas ?? null,
      tiene_descuento: data.tiene_descuento ? 1 : 0,
      descuento_porcentaje: Number(data.descuento_porcentaje ?? 0),
      id,
    });
  return getById(id);
}

function remove(id) {
  const db = getDb();
  const cliente = db
    .prepare("SELECT id, estado FROM clientes WHERE id = ?")
    .get(id);

  if (!cliente) {
    return null;
  }

  if (cliente.estado === "inactivo") {
    return cliente;
  }

  db.prepare(
    `
    UPDATE clientes
    SET estado = 'inactivo', actualizado = datetime('now')
    WHERE id = ?
  `,
  ).run(id);

  return db.prepare("SELECT * FROM clientes WHERE id = ?").get(id);
}

function updateBalance(id, monto) {
  return getDb()
    .prepare(
      `
      UPDATE clientes
      SET balance_pendiente = balance_pendiente + ?,
          actualizado = datetime('now')
      WHERE id = ?
    `,
    )
    .run(monto, id);
}

module.exports = { getAll, getById, create, update, remove, updateBalance };
