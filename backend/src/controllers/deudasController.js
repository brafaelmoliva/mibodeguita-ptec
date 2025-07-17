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
    // Obtener el monto total sumado de DetalleEntradaProducto para esta entrada
    const [[{ total }]] = await pool.query(`
      SELECT SUM(monto_total) AS total
      FROM DetalleEntradaProducto
      WHERE id_entrada = ?
    `, [id]);

    if (!total) {
      return res.status(404).json({ error: 'Deuda no encontrada o sin detalles' });
    }

    // Actualizar EntradaProducto con monto_pagado igual al total calculado y marcar como pagada
    const [result] = await pool.query(`
      UPDATE EntradaProducto 
      SET 
        fecha_pago = NOW(),
        esta_cancelado = TRUE,
        monto_pendiente = 0,
        monto_pagado = ?
      WHERE id_entrada = ?
    `, [total, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Deuda no encontrada' });
    }

    // Registrar auditoría
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
