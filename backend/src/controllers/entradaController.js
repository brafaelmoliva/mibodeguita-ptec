const pool = require('../config/db');
const { registrarAuditoria } = require('../utils/auditoriaUtil');

const registrarEntradaProducto = async (req, res) => {
  try {
    let {
      id_producto,
      cantidad_total,
      tipo_entrada,
      cantidad_paquetes,
      productos_por_paquete,
      precio_por_paquete,
      costo_unitario_calculado,
      precio_venta_sugerido,
      tipo_pago,
      monto_pagado,
      fecha_cancelacion,
      usuario_id,
      observaciones
    } = req.body;

    // 🔄 Recalcular con datos de paquete por seguridad
    if (cantidad_paquetes && productos_por_paquete && precio_por_paquete) {
      const recalculadoCantidad = cantidad_paquetes * productos_por_paquete;
      const recalculadoCosto = precio_por_paquete / productos_por_paquete;
      cantidad_total = recalculadoCantidad;
      costo_unitario_calculado = recalculadoCosto.toFixed(2);
    }

    const monto_total = cantidad_total * costo_unitario_calculado;

    let esta_cancelado = true;
    let monto_pendiente = 0;
    let fecha_pago = null;

    if (tipo_pago === "contado") {
      esta_cancelado = true;
      monto_pendiente = 0;
      fecha_pago = new Date();
      monto_pagado = monto_total;
      fecha_cancelacion = null;
    } else if (tipo_pago === "credito") {
      esta_cancelado = false;
      monto_pendiente = monto_total - monto_pagado;
    } else {
      return res.status(400).json({ error: "Tipo de pago inválido" });
    }

    // 🟢 Insertar entrada de producto
    const [result] = await pool.query(`
      INSERT INTO EntradaProducto (
        id_producto, cantidad_total, tipo_entrada,
        cantidad_paquetes, productos_por_paquete,
        precio_por_paquete, costo_unitario_calculado,
        precio_venta_sugerido, esta_cancelado,
        monto_total, monto_pagado, monto_pendiente,
        fecha_cancelacion, fecha_pago, usuario_id, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id_producto,
      cantidad_total,
      tipo_entrada,
      cantidad_paquetes || null,
      productos_por_paquete || null,
      precio_por_paquete || null,
      costo_unitario_calculado,
      precio_venta_sugerido,
      esta_cancelado,
      monto_total,
      monto_pagado,
      monto_pendiente,
      fecha_cancelacion || null,
      fecha_pago,
      usuario_id,
      observaciones || null
    ]);

    // 🟢 Actualizar producto
    await pool.query(`
      UPDATE Producto
      SET stock = stock + ?,
          costo_compra = ?,
          precio_venta = ?
      WHERE id_producto = ?
    `, [
      cantidad_total,
      costo_unitario_calculado,
      precio_venta_sugerido,
      id_producto
    ]);

    // 🟢 Obtener nombre del producto para la auditoría
    const [[producto]] = await pool.query(`
      SELECT nombre_producto FROM Producto WHERE id_producto = ?
    `, [id_producto]);

    const descripcion = `
Entrada registrada:
- Producto: ${producto.nombre_producto} (ID: ${id_producto})
- Cantidad total: ${cantidad_total} ${tipo_entrada}
- Paquetes: ${cantidad_paquetes || '-'}
- Productos/Paquete: ${productos_por_paquete || '-'}
- Precio/Paquete: S/ ${precio_por_paquete || '-'}
- Costo unitario: S/ ${costo_unitario_calculado}
- Precio venta sugerido: S/ ${precio_venta_sugerido}
- Tipo de pago: ${tipo_pago}
- Monto total: S/ ${monto_total.toFixed(2)}
- Monto pagado: S/ ${monto_pagado}
- Pendiente: S/ ${monto_pendiente}
- Observaciones: ${observaciones || 'Ninguna'}
`.trim();

    await registrarAuditoria('EntradaProducto', 'INSERT', result.insertId, descripcion, usuario_id);

    res.json({ message: "Entrada registrada, producto actualizado y auditoría guardada" });

  } catch (error) {
    console.error("❌ Error al registrar entrada de producto:", error.stack);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const obtenerEntradasProducto = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ep.*, p.nombre_producto, p.descripcion_producto
      FROM EntradaProducto ep
      JOIN Producto p ON ep.id_producto = p.id_producto
      ORDER BY ep.fecha_entrada DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener entradas de producto:", error.stack);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  registrarEntradaProducto,
  obtenerEntradasProducto
};
