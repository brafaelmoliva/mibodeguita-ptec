// src/controllers/comprobanteController.js
const pool = require("../config/db");

// ✅ Obtener todos los comprobantes
const getComprobantes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, p.nombre_razon_social AS nombre_proveedor
      FROM Comprobante c
      JOIN Proveedor p ON c.id_proveedor = p.id_proveedor
      ORDER BY c.fecha_emision DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener comprobantes:", err);
    res.status(500).json({ error: "Error al obtener comprobantes" });
  }
};

// ✅ Registrar nuevo comprobante
const registrarComprobante = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      tipo,
      numero_comprobante,
      fecha_emision,
      fecha_vencimiento,
      forma_pago,
      total,
      id_proveedor,
      observaciones,
      productos
    } = req.body;

    const id_usuario = req.user.id_usuario; // viene del token

    await connection.beginTransaction();

    // 1. Insertar comprobante
    const [comprobanteResult] = await connection.query(`
      INSERT INTO Comprobante (
        tipo, numero_comprobante, fecha_emision, fecha_vencimiento,
        forma_pago, total, id_proveedor, observaciones, id_usuario
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tipo, numero_comprobante, fecha_emision, fecha_vencimiento,
      forma_pago, total, id_proveedor, observaciones, id_usuario
    ]);

    const id_comprobante = comprobanteResult.insertId;

    // 2. Insertar detalle por cada producto
    for (const item of productos) {
      const { id_producto, cantidad, unidad, costo_unitario, precio_venta_sugerido } = item;

     await connection.query(`
  INSERT INTO DetalleComprobante (
    id_comprobante, id_producto, cantidad, unidad, costo_unitario, precio_venta_sugerido
  ) VALUES (?, ?, ?, ?, ?, ?)
`, [
  id_comprobante, id_producto, cantidad, unidad, costo_unitario, precio_venta_sugerido
]);


      // 3. Actualizar stock y precios del producto
      await connection.query(`
        UPDATE Producto
        SET 
          stock = stock + ?,
          costo_compra = ?,
          precio_venta = ?
        WHERE id_producto = ?
      `, [cantidad, costo_unitario, precio_venta_sugerido, id_producto]);
    }

    await connection.commit();
    res.status(201).json({ mensaje: "Comprobante registrado correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error("Error al registrar comprobante:", error);
    res.status(500).json({ error: "Error al registrar comprobante" });
  } finally {
    connection.release();
  }
};
// ✅ Obtener detalle de un comprobante por ID
const getDetalleComprobante = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT d.*, p.nombre_producto
      FROM DetalleComprobante d
      JOIN Producto p ON d.id_producto = p.id_producto
      WHERE d.id_comprobante = ?
    `, [id]);

    res.json(rows);
  } catch (err) {
    console.error("Error al obtener detalle del comprobante:", err);
    res.status(500).json({ error: "Error al obtener detalle del comprobante" });
  }
};

module.exports = {
  getComprobantes,
  registrarComprobante,
  getDetalleComprobante
};
