const pool = require('../config/db');
const { registrarAuditoria } = require('../utils/auditoriaUtil');

// Obtener todas las deudas desde la vista VistaDeudas
const getDeudas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM VistaDeudas ORDER BY fecha_cancelacion DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener deudas:", error);
    res.status(500).json({ error: "Error al obtener deudas" });
  }
};


// Marcar deuda como pagada
const pagarDeuda = async (req, res) => {
  const { id } = req.params; // id_entrada
  const usuarioId = req.user.id_usuario;

  try {
    const sqlUpdate = `
      UPDATE EntradaProducto 
      SET 
        fecha_pago = NOW(),
        esta_cancelado = TRUE,
        monto_pendiente = 0,
        monto_pagado = monto_total
      WHERE id_entrada = ?
    `;

    const [result] = await pool.query(sqlUpdate, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }

    const descripcion = `Deuda marcada como pagada para id_entrada ${id}`;
    await registrarAuditoria('EntradaProducto', 'UPDATE', id, descripcion, usuarioId);

    res.json({ message: 'Deuda actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar deuda:', error);
    res.status(500).json({ error: 'Error al actualizar deuda' });
  }
};

module.exports = {
  getDeudas,
  pagarDeuda
};
