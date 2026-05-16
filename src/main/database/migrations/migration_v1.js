function up(db) {
  // Ejemplo: agregar columna si no existe
  // Esta migración es el punto de partida v1
  // Aquí irán los cambios futuros al esquema
  console.log('📦 Migración v1 aplicada')
}

function down(db) {
  // Revertir cambios si fuera necesario
}

module.exports = { up, down }
