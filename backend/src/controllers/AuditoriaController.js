const db = require('../config/db');

const getAuditoria = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.id_auditoria AS id,
        a.fecha,
        a.tabla_afectada,
        a.tipo_operacion AS accion,
        a.id_registro AS codigo,
        a.descripcion,
        u.nombre_completo AS usuario
      FROM Auditoria a
      JOIN Usuario u ON a.usuario_id = u.id_usuario
      ORDER BY a.fecha DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener historial de auditoría:', error);
    res.status(500).json({ error: 'Error al obtener historial de auditoría' });
  }
};

module.exports = { getAuditoria };
