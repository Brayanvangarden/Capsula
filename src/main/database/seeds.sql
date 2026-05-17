-- ════════════════════════════
--  USUARIO ADMIN POR DEFECTO
-- ════════════════════════════
-- password: admin123 (hash bcrypt en producción)
INSERT OR IGNORE INTO usuarios (nombre, usuario, password, rol)
VALUES
  ('Administrador', 'admin', '1234', 'admin'),
  ('David Soto', 'david', '1234', 'admin'),
  ('María González', 'maria', '1234', 'vendedor'),
  ('Carlos Ramírez', 'carlos', '1234', 'vendedor');

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
   material, color, fecha_vencimiento, estado, notas)
VALUES
  -- Cápsulas de Gelatina
  ('Cápsula Gelatina Talla 00',    1, 50000, 1000, 'LOT-GEL-001', 10000, 12.50,  5000,  'Gelatina', 'Transparente',   '2027-06-30', 'activo', 'Talla más grande, muy solicitada'),
  ('Cápsula Gelatina Talla 0',     1, 80000, 1000, 'LOT-GEL-002', 20000, 11.00,  8000,  'Gelatina', 'Transparente',   '2027-06-30', 'activo', 'Talla estándar más vendida'),
  ('Cápsula Gelatina Talla 1',     1, 60000, 1000, 'LOT-GEL-003', 15000, 10.00,  6000,  'Gelatina', 'Transparente',   '2027-08-31', 'activo', NULL),
  ('Cápsula Gelatina Talla 2',     1, 40000, 1000, 'LOT-GEL-004', 10000,  9.50,  4000,  'Gelatina', 'Transparente',   '2027-08-31', 'activo', NULL),
  ('Cápsula Gelatina Talla 3',     1, 25000, 1000, 'LOT-GEL-005',  5000,  9.00,  2000,  'Gelatina', 'Transparente',   '2027-10-31', 'activo', 'Talla pequeña'),
  ('Cápsula Gelatina Talla 4',     1,  8000, 1000, 'LOT-GEL-006',  2000,  8.50,  1000,  'Gelatina', 'Transparente',   '2027-10-31', 'activo', 'Muy poca rotación'),

  -- Cápsulas Vegetales (HPMC)
  ('Cápsula Vegetal Talla 00',     2, 30000, 1000, 'LOT-VEG-001', 10000, 18.00,  3000,  'HPMC',     'Transparente',   '2028-01-31', 'activo', 'Apta para veganos'),
  ('Cápsula Vegetal Talla 0',      2, 45000, 1000, 'LOT-VEG-002', 15000, 16.50,  4000,  'HPMC',     'Transparente',   '2028-01-31', 'activo', 'Mayor demanda vegetal'),
  ('Cápsula Vegetal Talla 1',      2, 20000, 1000, 'LOT-VEG-003',  5000, 15.00,  2000,  'HPMC',     'Transparente',   '2028-03-31', 'activo', NULL),
  ('Cápsula Vegetal Talla 2',      2, 12000, 1000, 'LOT-VEG-004',  3000, 14.50,  1500,  'HPMC',     'Transparente',   '2028-03-31', 'activo', NULL),

  -- Cápsulas Entéricas
  ('Cápsula Entérica Talla 0',     4, 15000, 1000, 'LOT-ENT-001',  5000, 25.00,  2000,  'HPMC',     'Transparente',   '2027-12-31', 'activo', 'Resistente al ácido gástrico'),
  ('Cápsula Entérica Talla 1',     4,  8000, 1000, 'LOT-ENT-002',  2000, 23.00,  1000,  'HPMC',     'Transparente',   '2027-12-31', 'activo', NULL),

  -- Cápsulas de Colores — Gelatina
  ('Cápsula Roja Talla 0',         5, 20000, 1000, 'LOT-COL-001',  5000, 13.50,  2000,  'Gelatina', 'Rojo',           '2027-05-31', 'activo', 'Color sólido'),
  ('Cápsula Azul Talla 0',         5, 18000, 1000, 'LOT-COL-002',  5000, 13.50,  2000,  'Gelatina', 'Azul',           '2027-05-31', 'activo', NULL),
  ('Cápsula Verde Talla 0',        5, 15000, 1000, 'LOT-COL-003',  5000, 13.50,  2000,  'Gelatina', 'Verde',          '2027-05-31', 'activo', NULL),
  ('Cápsula Amarilla Talla 0',     5, 10000, 1000, 'LOT-COL-004',  3000, 13.50,  1000,  'Gelatina', 'Amarillo',       '2027-05-31', 'activo', NULL),
  ('Cápsula Negra Talla 0',        5, 12000, 1000, 'LOT-COL-005',  3000, 14.00,  1000,  'Gelatina', 'Negro',          '2027-07-31', 'activo', 'Alta demanda en suplementos'),
  ('Cápsula Blanca Talla 0',       5, 22000, 1000, 'LOT-COL-006',  5000, 13.00,  2000,  'Gelatina', 'Blanco',         '2027-07-31', 'activo', NULL),
  ('Cápsula Bicolor Rojo-Blanco',  5,  9000, 1000, 'LOT-COL-007',  2000, 15.00,  1000,  'Gelatina', 'Rojo/Blanco',    '2027-09-30', 'activo', 'Cuerpo blanco, tapa roja'),
  ('Cápsula Bicolor Azul-Blanco',  5,  7000, 1000, 'LOT-COL-008',  2000, 15.00,  1000,  'Gelatina', 'Azul/Blanco',    '2027-09-30', 'activo', 'Cuerpo blanco, tapa azul'),

  -- Cápsulas Transparentes
  ('Cápsula Transparente Talla 00', 6, 35000, 1000, 'LOT-TRA-001', 10000, 12.00,  3000, 'Gelatina', 'Transparente',   '2027-11-30', 'activo', 'Sin pigmento'),
  ('Cápsula Transparente Talla 0',  6, 50000, 1000, 'LOT-TRA-002', 15000, 11.50,  5000, 'Gelatina', 'Transparente',   '2027-11-30', 'activo', 'La más solicitada'),

  -- Producto con stock bajo (para probar alertas)
  ('Cápsula Gelatina Talla 5',     1,   400, 1000, 'LOT-GEL-007',   500,  8.00,  1000,  'Gelatina', 'Transparente',   '2026-08-31', 'activo', '⚠️ Stock bajo para pruebas'),

  -- Producto próximo a vencer (para probar alertas)
  ('Cápsula Vegetal Talla 3',      2,  5000, 1000, 'LOT-VEG-005',  1000, 14.00,   500,  'HPMC',     'Transparente',   '2026-06-10', 'activo', '⚠️ Próximo a vencer para pruebas');


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
--  ÓRDENES
-- ══════════════════════════════════════════════
INSERT OR IGNORE INTO ordenes
  (cliente_id, fecha_creacion, fecha_entrega, estado, estado_pago, total, notas, usuario_id)
VALUES
  (1, datetime('now', '-20 days'), datetime('now', '-18 days'), 'completada', 'pagado',   125000, 'Entrega en farmacia', 3),
  (2, datetime('now', '-18 days'), datetime('now', '-15 days'), 'completada', 'parcial',  198000, 'Pago en dos tractos',  3),
  (3, datetime('now', '-15 days'), datetime('now', '-12 days'), 'completada', 'pagado',    87500, NULL,                   4),
  (4, datetime('now', '-12 days'), datetime('now', '-8 days'),  'completada', 'pendiente', 340000, 'Factura pendiente',   4),
  (5, datetime('now', '-10 days'), datetime('now', '-6 days'),  'completada', 'pagado',    62000, NULL,                   3),
  (6, datetime('now', '-7 days'),  datetime('now', '-3 days'),  'completada', 'pendiente', 70000, 'Cobrar a fin de mes',  3),
  (7, datetime('now', '-5 days'),  date('now', '+2 days'),      'en_proceso', 'pendiente', 156000, NULL,                  4),
  (8, datetime('now', '-3 days'),  date('now', '+5 days'),      'en_proceso', 'pendiente', 168000, NULL,                  3),
  (9, datetime('now', '-1 days'),  date('now', '+7 days'),      'pendiente',  'pendiente', 93500,  NULL,                  4),
  (10,datetime('now'),             date('now', '+10 days'),     'pendiente',  'pendiente', 268800, 'Orden grande',        3);


-- ══════════════════════════════════════════════
--  DETALLE DE ÓRDENES
-- ══════════════════════════════════════════════
INSERT OR IGNORE INTO ordenes_detalle
  (orden_id, producto_id, cantidad, precio_unitario, subtotal)
VALUES
  -- Orden 1: Farmacia Santa Lucía
  (1, 2, 10000, 11.00, 110000),
  (1, 1,  1000, 12.50,  12500),
  -- Orden 2: NutriMax CR
  (2, 7,  5000, 18.00,  90000),
  (2, 8,  6000, 16.50,  99000),
  -- Orden 3: Suplementos ProFit
  (3, 1,  5000, 12.50,  62500),
  (3, 13, 1667, 13.50,  22500),
  -- Orden 4: Laboratorio BioSalud
  (4, 8,  12000, 16.50, 198000),
  (4, 11,  5000, 25.00, 125000),
  -- Orden 5: NaturVita
  (5, 13,  3000, 13.50,  40500),
  (5, 14,  1000, 13.50,  13500),
  -- Orden 6: Droguería Central
  (6, 2,   5000, 11.00,  55000),
  (6, 18,  1000, 15.00,  15000),
  -- Orden 7: FarmaPlus Liberia
  (7, 20, 10000, 11.50, 115000),
  (7, 19,  3000, 12.00,  36000),
  -- Orden 8: Salud Natural
  (8, 7,   5000, 18.00,  90000),
  (8, 10,  3000, 14.50,  43500),
  -- Orden 9: Cápsulas & Más
  (9, 17,  5000, 13.00,  65000),
  (9, 15,  1000, 13.50,  13500),
  -- Orden 10: MedVida
  (10, 2,  12000, 11.00, 132000),
  (10, 8,   5000, 16.50,  82500),
  (10, 20,  3000, 11.50,  34500);


-- ══════════════════════════════════════════════
--  PAGOS
-- ══════════════════════════════════════════════
INSERT OR IGNORE INTO pagos
  (cliente_id, orden_id, monto, metodo_pago, fecha_pago, notas, usuario_id)
VALUES
  (1, 1, 125000, 'transferencia', datetime('now', '-17 days'), 'Pago completo',         3),
  (2, 2, 100000, 'sinpe',         datetime('now', '-14 days'), 'Primer tracto',          3),
  (3, 3,  87500, 'efectivo',      datetime('now', '-11 days'), 'Pago en efectivo',       4),
  (5, 5,  62000, 'transferencia', datetime('now', '-5 days'),  'Pago completo',          3),
  (2, 2,  83000, 'sinpe',         datetime('now', '-3 days'),  'Saldo pendiente',        3),
  (9, NULL, 5000,'efectivo',      datetime('now', '-1 days'),  'Abono a cuenta',         4);


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
