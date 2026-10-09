function up(db) {
  db.pragma("foreign_keys = OFF");

  try {
    const migrate = db.transaction(() => {
      db.exec(`
        CREATE TABLE productos_new (
          id                  INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre              TEXT    NOT NULL,
          categoria_id        INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
          cantidad            REAL    NOT NULL DEFAULT 0,
          cantidad_paquete    REAL    NOT NULL DEFAULT 1,
          numero_lote         TEXT,
          cantidad_lote       REAL    DEFAULT 0,
          precio_unitario     REAL    NOT NULL DEFAULT 0,
          stock_minimo        REAL    NOT NULL DEFAULT 0,
          material            TEXT,
          color               TEXT,
          sku                 TEXT    NOT NULL,
          estado              TEXT    NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
          notas               TEXT,
          creado_en           TEXT    NOT NULL DEFAULT (datetime('now')),
          actualizado         TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        INSERT INTO productos_new (
          id, nombre, categoria_id, cantidad, cantidad_paquete, numero_lote,
          cantidad_lote, precio_unitario, stock_minimo, material, color, sku,
          estado, notas, creado_en, actualizado
        )
        SELECT
          id, nombre, categoria_id, cantidad, cantidad_paquete, numero_lote,
          cantidad_lote, precio_unitario, stock_minimo, material, color, sku,
          estado, notas, creado_en, actualizado
        FROM productos;

        DROP TABLE productos;
        ALTER TABLE productos_new RENAME TO productos;

        CREATE UNIQUE INDEX productos_sku_activo_unique
          ON productos(sku)
          WHERE estado = 'activo';
      `);
    });

    migrate();
    console.log("Migration v7 applied: product SKU and name are unique for active products");
  } finally {
    db.pragma("foreign_keys = ON");
  }
}

function down() {}

module.exports = { up, down };
