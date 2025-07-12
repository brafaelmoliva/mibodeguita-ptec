// src/controllers/detalleComprobanteController.js
const pool = require("../config/db");

const getDetalleComprobantePorId = async (req, res) => {
  const { id_comprobante } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        d.id_detalle,
        d.id_producto,
        p.nombre_producto,
        d.cantidad,
        d.unidad,
        d.costo_unitario,
        d.precio_venta_sugerido,
        d.subtotal
      FROM DetalleComprobante d
      JOIN Producto p ON d.id_producto = p.id_producto
      WHERE d.id_comprobante = ?
    `, [id_comprobante]);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener detalle del comprobante:", error);
    res.status(500).json({ error: "Error al obtener detalle del comprobante" });
  }
};

module.exports = {
  getDetalleComprobantePorId,
};
