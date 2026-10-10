function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function getLegacyReferences(db) {
  return db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
    .all()
    .filter(({ name }) =>
      db
        .pragma(`foreign_key_list(${quoteIdentifier(name)})`)
        .some((foreignKey) => foreignKey.table === "clientes_legacy"),
    )
    .map(({ name }) => name);
}

function rebuildTable(db, tableName) {
  const table = db
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName);
  if (!table?.sql) {
    throw new Error(`No se encontró el esquema de la tabla ${tableName}`);
  }

  const temporaryName = `__migration_v8_${tableName}`;
  const escapedName = tableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const createPattern = new RegExp(
    `^(CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?)(?:"${escapedName}"|\\[${escapedName}\\]|\\x60${escapedName}\\x60|${escapedName})(\\s*\\()`,
    "i",
  );
  const renamedSql = table.sql.replace(
    createPattern,
    `$1${quoteIdentifier(temporaryName)}$2`,
  );
  if (renamedSql === table.sql) {
    throw new Error(`No se pudo preparar la tabla ${tableName} para reparar`);
  }

  const repairedSql = renamedSql.replace(
    /REFERENCES\s+(?:"clientes_legacy"|\[clientes_legacy\]|`clientes_legacy`|clientes_legacy)(?=\s*\()/gi,
    'REFERENCES "clientes"',
  );
  if (
    /REFERENCES\s+(?:"clientes_legacy"|\[clientes_legacy\]|`clientes_legacy`|clientes_legacy)(?=\s*\()/i.test(
      repairedSql,
    )
  ) {
    throw new Error(`No se pudo corregir la referencia de ${tableName}`);
  }

  const columns = db
    .prepare(`PRAGMA table_info(${quoteIdentifier(tableName)})`)
    .all()
    .map((column) => quoteIdentifier(column.name));
  const columnList = columns.join(", ");
  const relatedObjects = db
    .prepare(
      "SELECT sql FROM sqlite_master WHERE tbl_name = ? AND type IN ('index', 'trigger') AND sql IS NOT NULL",
    )
    .all(tableName);
  const previousSequence = db
    .prepare("SELECT seq FROM sqlite_sequence WHERE name = ?")
    .get(tableName)?.seq;
  const rowCount = db
    .prepare(`SELECT COUNT(*) AS total FROM ${quoteIdentifier(tableName)}`)
    .get().total;

  db.exec(repairedSql);
  db.exec(`
    INSERT INTO ${quoteIdentifier(temporaryName)} (${columnList})
    SELECT ${columnList} FROM ${quoteIdentifier(tableName)}
  `);
  db.exec(`DROP TABLE ${quoteIdentifier(tableName)}`);
  db.exec(
    `ALTER TABLE ${quoteIdentifier(temporaryName)} RENAME TO ${quoteIdentifier(tableName)}`,
  );

  if (previousSequence !== undefined) {
    const currentSequence = db
      .prepare("SELECT seq FROM sqlite_sequence WHERE name = ?")
      .get(tableName);
    if (currentSequence) {
      db.prepare("UPDATE sqlite_sequence SET seq = MAX(seq, ?) WHERE name = ?").run(
        previousSequence,
        tableName,
      );
    } else {
      db.prepare("INSERT INTO sqlite_sequence (name, seq) VALUES (?, ?)").run(
        tableName,
        previousSequence,
      );
    }
  }

  for (const object of relatedObjects) {
    db.exec(object.sql);
  }

  const repairedCount = db
    .prepare(`SELECT COUNT(*) AS total FROM ${quoteIdentifier(tableName)}`)
    .get().total;
  if (repairedCount !== rowCount) {
    throw new Error(`La reparación de ${tableName} no conservó todas sus filas`);
  }
}

function up(db) {
  const affectedTables = getLegacyReferences(db);
  if (!affectedTables.length) {
    console.log("Migration v8 skipped: no clientes_legacy foreign keys found");
    return;
  }

  db.pragma("foreign_keys = OFF");

  try {
    db.transaction(() => {
      for (const tableName of affectedTables) {
        rebuildTable(db, tableName);
      }

      if (getLegacyReferences(db).length) {
        throw new Error("Quedaron claves foráneas apuntando a clientes_legacy");
      }
    })();
    console.log(
      `Migration v8 applied: repaired clientes_legacy foreign keys in ${affectedTables.join(", ")}`,
    );
  } finally {
    db.pragma("foreign_keys = ON");
  }
}

function down() {}

module.exports = { up, down };