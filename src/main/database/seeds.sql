-- ════════════════════════════
--  USUARIO ADMIN POR DEFECTO
-- ════════════════════════════
-- password: admin123 (hash bcrypt en producción)
INSERT OR IGNORE INTO usuarios (nombre, usuario, correo, password, rol)
VALUES
  ('Administrador', 'admin', 'admin@example.com', '1234', 'admin'),
  ('David Soto', 'david', 'david@example.com', '1234', 'admin'),
  ('María González', 'maria', 'maria@example.com', '1234', 'vendedor'),
  ('Carlos Ramírez', 'carlos', 'carlos@example.com', '1234', 'vendedor');

-- ══════════════════════════════════════════════
--  CATEGORÍAS DE CÁPSULAS
-- ══════════════════════════════════════════════
INSERT OR IGNORE INTO categorias (nombre, descripcion, estado) VALUES
  ('Cápsulas de Gelatina',    'Cápsulas duras de gelatina animal estándar',         'activo'),
  ('Cápsulas Vegetales',      'Cápsulas HPMC aptas para vegetarianos y veganos',     'activo'),
  ('Cápsulas de Gelatina Blanda', 'Softgels de gelatina para líquidos y aceites',   'activo'),
  ('Cápsulas Entéricas',      'Con recubrimiento entérico resistente al ácido',      'activo'),
  ('Cápsulas de Colores',     'Cápsulas pigmentadas para identificación de producto','activo'),
  ('Cápsulas Transparentes',  'Cápsulas sin pigmento, cuerpo y tapa transparentes',  'activo');


-- ══════════════════════════════════════════════
--  PRODUCTOS — CÁPSULAS VACÍAS
-- ══════════════════════════════════════════════
INSERT OR IGNORE INTO productos
  (nombre, categoria_id, cantidad, cantidad_paquete, numero_lote,
   cantidad_lote, precio_unitario, stock_minimo,
   material, color, sku, estado, notas)
VALUES
  -- Cápsulas de Gelatina
  ('Cápsula Gelatina Talla 00',    1, 50000, 1000, 'LOT-GEL-001', 10000, 12.50,  5000,  'Gelatina', 'Transparente',   'SKU-GEL-001', 'activo', 'Talla más grande, muy solicitada'),
  ('Cápsula Gelatina Talla 0',     1, 80000, 1000, 'LOT-GEL-002', 20000, 11.00,  8000,  'Gelatina', 'Transparente',   'SKU-GEL-002', 'activo', 'Talla estándar más vendida'),
  ('Cápsula Gelatina Talla 1',     1, 60000, 1000, 'LOT-GEL-003', 15000, 10.00,  6000,  'Gelatina', 'Transparente',   'SKU-GEL-003', 'activo', NULL),
  ('Cápsula Gelatina Talla 2',     1, 40000, 1000, 'LOT-GEL-004', 10000,  9.50,  4000,  'Gelatina', 'Transparente',   'SKU-GEL-004', 'activo', NULL),
  ('Cápsula Gelatina Talla 3',     1, 25000, 1000, 'LOT-GEL-005',  5000,  9.00,  2000,  'Gelatina', 'Transparente',   'SKU-GEL-005', 'activo', 'Talla pequeña'),
  ('Cápsula Gelatina Talla 4',     1,  8000, 1000, 'LOT-GEL-006',  2000,  8.50,  1000,  'Gelatina', 'Transparente',   'SKU-GEL-006', 'activo', 'Muy poca rotación'),

  -- Cápsulas Vegetales (HPMC)
  ('Cápsula Vegetal Talla 00',     2, 30000, 1000, 'LOT-VEG-001', 10000, 18.00,  3000,  'HPMC',     'Transparente',   'SKU-VEG-001', 'activo', 'Apta para veganos'),
  ('Cápsula Vegetal Talla 0',      2, 45000, 1000, 'LOT-VEG-002', 15000, 16.50,  4000,  'HPMC',     'Transparente',   'SKU-VEG-002', 'activo', 'Mayor demanda vegetal'),
  ('Cápsula Vegetal Talla 1',      2, 20000, 1000, 'LOT-VEG-003',  5000, 15.00,  2000,  'HPMC',     'Transparente',   'SKU-VEG-003', 'activo', NULL),
  ('Cápsula Vegetal Talla 2',      2, 12000, 1000, 'LOT-VEG-004',  3000, 14.50,  1500,  'HPMC',     'Transparente',   'SKU-VEG-004', 'activo', NULL),

  -- Cápsulas Entéricas
  ('Cápsula Entérica Talla 0',     4, 15000, 1000, 'LOT-ENT-001',  5000, 25.00,  2000,  'HPMC',     'Transparente',   'SKU-ENT-001', 'activo', 'Resistente al ácido gástrico'),
  ('Cápsula Entérica Talla 1',     4,  8000, 1000, 'LOT-ENT-002',  2000, 23.00,  1000,  'HPMC',     'Transparente',   'SKU-ENT-002', 'activo', NULL),

  -- Cápsulas de Colores — Gelatina
  ('Cápsula Roja Talla 0',         5, 20000, 1000, 'LOT-COL-001',  5000, 13.50,  2000,  'Gelatina', 'Rojo',           'SKU-COL-001', 'activo', 'Color sólido'),
  ('Cápsula Azul Talla 0',         5, 18000, 1000, 'LOT-COL-002',  5000, 13.50,  2000,  'Gelatina', 'Azul',           'SKU-COL-002', 'activo', NULL),
  ('Cápsula Verde Talla 0',        5, 15000, 1000, 'LOT-COL-003',  5000, 13.50,  2000,  'Gelatina', 'Verde',          'SKU-COL-003', 'activo', NULL),
  ('Cápsula Amarilla Talla 0',     5, 10000, 1000, 'LOT-COL-004',  3000, 13.50,  1000,  'Gelatina', 'Amarillo',       'SKU-COL-004', 'activo', NULL),
  ('Cápsula Negra Talla 0',        5, 12000, 1000, 'LOT-COL-005',  3000, 14.00,  1000,  'Gelatina', 'Negro',          'SKU-COL-005', 'activo', 'Alta demanda en suplementos'),
  ('Cápsula Blanca Talla 0',       5, 22000, 1000, 'LOT-COL-006',  5000, 13.00,  2000,  'Gelatina', 'Blanco',         'SKU-COL-006', 'activo', NULL),
  ('Cápsula Bicolor Rojo-Blanco',  5,  9000, 1000, 'LOT-COL-007',  2000, 15.00,  1000,  'Gelatina', 'Rojo/Blanco',    'SKU-COL-007', 'activo', 'Cuerpo blanco, tapa roja'),
  ('Cápsula Bicolor Azul-Blanco',  5,  7000, 1000, 'LOT-COL-008',  2000, 15.00,  1000,  'Gelatina', 'Azul/Blanco',    'SKU-COL-008', 'activo', 'Cuerpo blanco, tapa azul'),

  -- Cápsulas Transparentes
  ('Cápsula Transparente Talla 00', 6, 35000, 1000, 'LOT-TRA-001', 10000, 12.00,  3000, 'Gelatina', 'Transparente',   'SKU-TRA-001', 'activo', 'Sin pigmento'),
  ('Cápsula Transparente Talla 0',  6, 50000, 1000, 'LOT-TRA-002', 15000, 11.50,  5000, 'Gelatina', 'Transparente',   'SKU-TRA-002', 'activo', 'La más solicitada'),

  -- Producto con stock bajo (para probar alertas)
  ('Cápsula Gelatina Talla 5',     1,   400, 1000, 'LOT-GEL-007',   500,  8.00,  1000,  'Gelatina', 'Transparente',   'SKU-GEL-007', 'activo', '⚠️ Stock bajo para pruebas'),

  -- Producto con SKU especial para pruebas
  ('Cápsula Vegetal Talla 3',      2,  5000, 1000, 'LOT-VEG-005',  1000, 14.00,   500,  'HPMC',     'Transparente',   'SKU-VEG-005', 'activo', '⚠️ Producto de pruebas');


-- ══════════════════════════════════════════════
--  CLIENTES
-- ══════════════════════════════════════════════
INSERT OR IGNORE INTO clientes
  (empresa, nombre, telefono, correo, direccion, balance_pendiente, estado)
VALUES
  ('Farmacia Santa Lucía',     'Luis Mora Jiménez',       '8801-1234', 'lmora@fsantalucia.cr',      'San José, Desamparados',      0,       'activo'),
  ('NutriMax CR',              'Andrea Solís Vargas',     '8712-5678', 'asolisv@nutrimax.cr',       'Heredia, San Pablo',          15000,   'activo'),
  ('Suplementos ProFit',       'Rodrigo Campos Blanco',   '6623-9012', 'rcampos@suplementosprofit.com','Alajuela, Centro',          0,       'activo'),
  ('Laboratorio BioSalud',     'Valeria Torres Núñez',    '7734-3456', 'vtorres@biosalud.cr',       'Cartago, Tres Ríos',          42500,   'activo'),
  ('NaturVita Suplementos',    'Fabián Gutiérrez Arias',  '8845-7890', 'fgutierrez@naturvita.cr',   'San José, Curridabat',        0,       'activo'),
  ('Droguería Central',        'Sofía Ramírez Mora',      '8956-2345', 'sramirez@drogueriacentral.com','Puntarenas, Centro',        8750,    'activo'),
  ('FarmaPlus Liberia',        'Diego Hernández Castro',  '7867-6789', 'dhernandez@farmaplus.cr',   'Guanacaste, Liberia',         0,       'activo'),
  ('Salud Natural Pérez Z.',   'Alejandra Méndez Rojas',  '6978-1234', 'amendez@saludnatural.cr',   'San José, Pérez Zeledón',     21000,   'activo'),
  ('Cápsulas & Más',           'Mauricio Vega Quesada',   '8089-5678', 'mvega@capsulasymas.com',    'Heredia, Barva',              0,       'activo'),
  ('Distribuidora MedVida',    'Daniela Fallas Chinchilla','7190-9012','dfallas@medvida.cr',        'Alajuela, San Ramón',         33600,   'activo'),
  ('GreenCaps Import',         'Jonathan Salas Brenes',   '8201-3456', 'jsalas@greencaps.com',      'San José, Escazú',            0,       'activo'),
  ('Farmacias del Norte',      'Tatiana Ulate Jiménez',   '6312-7890', 'tulate@farmasnorte.cr',     'Alajuela, Ciudad Quesada',    0,       'activo');


-- ══════════════════════════════════════════════
--  MOVIMIENTOS DE INVENTARIO
-- ══════════════════════════════════════════════
INSERT OR IGNORE INTO movimientos_inventario
  (producto_id, tipo, cantidad, observaciones, usuario_id, fecha)
VALUES
  (1,  'entrada', 50000, 'Compra inicial de inventario',       1, datetime('now', '-30 days')),
  (2,  'entrada', 80000, 'Compra inicial de inventario',       1, datetime('now', '-30 days')),
  (7,  'entrada', 30000, 'Compra inicial vegetales',           1, datetime('now', '-28 days')),
  (8,  'entrada', 45000, 'Compra inicial vegetales',           1, datetime('now', '-28 days')),
  (13, 'entrada', 20000, 'Primer lote de colores',             1, datetime('now', '-25 days')),
  (14, 'entrada', 18000, 'Primer lote de colores',             1, datetime('now', '-25 days')),
  (2,  'salida',  10000, 'Venta a Farmacia Santa Lucía',       3, datetime('now', '-20 days')),
  (7,  'salida',   5000, 'Venta a NutriMax CR',                3, datetime('now', '-18 days')),
  (1,  'salida',   8000, 'Venta a Suplementos ProFit',         4, datetime('now', '-15 days')),
  (8,  'salida',  12000, 'Venta a Laboratorio BioSalud',       4, datetime('now', '-12 days')),
  (13, 'salida',   3000, 'Venta a NaturVita',                  3, datetime('now', '-10 days')),
  (2,  'salida',   5000, 'Venta a Droguería Central',          3, datetime('now', '-7 days')),
  (17, 'entrada', 22000, 'Reposición stock blancas',           1, datetime('now', '-5 days')),
  (1,  'salida',   2000, 'Ajuste por devolución',              1, datetime('now', '-3 days'));


-- ══════════════════════════════════════════════
--  ÓRDENES, DETALLE Y PAGOS
-- ══════════════════════════════════════════════
-- Se mantienen vacíos para realizar pruebas desde cero.


-- ══════════════════════════════════════════════
--  HISTORIAL
-- ══════════════════════════════════════════════
INSERT OR IGNORE INTO historial
  (tipo, modulo, descripcion, usuario_id, fecha)
VALUES
  ('creacion', 'usuarios',   'Usuario admin creado',                    1, datetime('now', '-31 days')),
  ('creacion', 'productos',  'Carga inicial de productos',              1, datetime('now', '-30 days')),
  ('creacion', 'clientes',   'Carga inicial de clientes',               1, datetime('now', '-30 days')),
  ('venta',    'ordenes',    'Orden #1 completada - Farmacia S. Lucía', 3, datetime('now', '-18 days')),
  ('venta',    'ordenes',    'Orden #2 completada - NutriMax CR',       3, datetime('now', '-15 days')),
  ('pago',     'pagos',      'Pago recibido de NutriMax CR ₡100,000',   3, datetime('now', '-14 days')),
  ('alerta',   'inventario', 'Stock bajo: Cápsula Gelatina Talla 5',    1, datetime('now', '-2 days')),
  ('alerta',   'inventario', 'Producto próximo a vencer: Vegetal T3',   1, datetime('now', '-1 days'));
