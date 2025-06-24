const pool = require('../config/db');

const registrarAuditoria = async (tabla, tipo, id_registro, descripcion, usuario_id) => {
  try {
    await pool.query(`
      INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
      VALUES (?, ?, ?, ?, ?)
    `, [tabla, tipo, id_registro, descripcion, usuario_id]);
  } catch (error) {
    console.error('Error registrando auditoría:', error);
  }
};

module.exports = {
  registrarAuditoria
};
