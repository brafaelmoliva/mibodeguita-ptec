const pool = require('../config/db');
const { registrarAuditoria } = require('../utils/auditoriaUtil');

const registrarEntradaProducto = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      productos, // array de productos [{ id_producto, tipo_entrada, cantidad_total, ... }]
      numero_factura,
      tipo_pago,
      monto_pagado,
      fecha_cancelacion,
      usuario_id,
      observaciones
    } = req.body;

    let esta_cancelado = true;
    let monto_total = 0;
    let fecha_pago = null;
    let monto_pendiente = 0;

    // Calcular total
    for (const p of productos) {
      const recalculadoCantidad = p.cantidad_paquetes && p.productos_por_paquete
        ? p.cantidad_paquetes * p.productos_por_paquete
        : p.cantidad_total;

      const recalculadoCostoUnitario = p.precio_por_paquete && p.productos_por_paquete
        ? p.precio_por_paquete / p.productos_por_paquete
        : p.costo_unitario_calculado;

      const montoParcial = recalculadoCantidad * recalculadoCostoUnitario;
      monto_total += montoParcial;
    }

    if (tipo_pago === "contado") {
      esta_cancelado = true;
      monto_pendiente = 0;
      fecha_pago = new Date();
    } else if (tipo_pago === "credito") {
      esta_cancelado = false;
      monto_pendiente = monto_total - parseFloat(monto_pagado);
    } else {
      return res.status(400).json({ error: "Tipo de pago inválido" });
    }

    // 1. Insertar en EntradaProducto
    const [entradaResult] = await connection.query(`
      INSERT INTO EntradaProducto (
        numero_factura, esta_cancelado, monto_pagado, monto_pendiente,
        fecha_cancelacion, fecha_pago, usuario_id, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      numero_factura,
      esta_cancelado,
      monto_pagado,
      monto_pendiente,
      fecha_cancelacion || null,
      fecha_pago,
      usuario_id,
      observaciones || null
    ]);

    const id_entrada = entradaResult.insertId;

    // 2. Insertar detalles y actualizar stock
    for (const p of productos) {
      const cantidad_total = p.cantidad_paquetes && p.productos_por_paquete
        ? p.cantidad_paquetes * p.productos_por_paquete
        : p.cantidad_total;

      const costo_unitario = p.precio_por_paquete && p.productos_por_paquete
        ? p.precio_por_paquete / p.productos_por_paquete
        : p.costo_unitario_calculado;

      const monto_total_detalle = cantidad_total * costo_unitario;

      await connection.query(`
        INSERT INTO DetalleEntradaProducto (
          id_entrada, id_producto, tipo_entrada, cantidad_total,
          cantidad_paquetes, productos_por_paquete, precio_por_paquete,
          monto_total, costo_unitario_calculado, precio_venta_sugerido
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id_entrada,
        p.id_producto,
        p.tipo_entrada || 'unidad',
        cantidad_total,
        p.cantidad_paquetes || null,
        p.productos_por_paquete || null,
        p.precio_por_paquete || null,
        monto_total_detalle,
        costo_unitario.toFixed(2),
        p.precio_venta_sugerido
      ]);

      // Actualizar stock y precios del producto
      await connection.query(`
        UPDATE Producto
        SET stock = stock + ?, costo_compra = ?, precio_venta = ?
        WHERE id_producto = ?
      `, [
        cantidad_total,
        costo_unitario,
        p.precio_venta_sugerido,
        p.id_producto
      ]);
    }

    // Auditoría
    await registrarAuditoria(
      'EntradaProducto',
      'INSERT',
      id_entrada,
      `Entrada registrada con ${productos.length} productos, factura: ${numero_factura}, total: S/ ${monto_total.toFixed(2)}`,
      usuario_id
    );

    await connection.commit();

    res.json({ message: "Entrada registrada exitosamente" });

  } catch (error) {
    await connection.rollback();
    console.error("❌ Error al registrar entrada de producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    connection.release();
  }
};

const obtenerEntradasProducto = async (req, res) => {
  try {
    const [entradas] = await pool.query(`
      SELECT ep.*, u.nombre_completo AS registrado_por
      FROM EntradaProducto ep
      LEFT JOIN Usuario u ON ep.usuario_id = u.id_usuario
      ORDER BY ep.fecha_entrada DESC
    `);

    const [detalles] = await pool.query(`
      SELECT dp.*, p.nombre_producto
      FROM DetalleEntradaProducto dp
      JOIN Producto p ON dp.id_producto = p.id_producto
    `);

    const entradasConDetalles = entradas.map(ep => ({
      ...ep,
      productos: detalles.filter(d => d.id_entrada === ep.id_entrada)
    }));

    res.json(entradasConDetalles);

  } catch (error) {
    console.error("❌ Error al obtener entradas de producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const obtenerEntradaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [entrada] = await pool.query(
      `SELECT ep.*, u.nombre_completo AS registrado_por
       FROM EntradaProducto ep
       LEFT JOIN Usuario u ON ep.usuario_id = u.id_usuario
       WHERE ep.id_entrada = ?`,
      [id]
    );

    if (entrada.length === 0) {
      return res.status(404).json({ error: "Entrada no encontrada" });
    }

    const [productos] = await pool.query(
      `SELECT dep.*, p.nombre_producto
       FROM DetalleEntradaProducto dep
       JOIN Producto p ON dep.id_producto = p.id_producto
       WHERE dep.id_entrada = ?`,
      [id]
    );

    res.json({ ...entrada[0], productos });
  } catch (error) {
    console.error("❌ Error al obtener detalles de entrada:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


module.exports = {
  registrarEntradaProducto,
  obtenerEntradasProducto,
  obtenerEntradaPorId
};
