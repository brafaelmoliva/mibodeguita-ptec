// routes/ingresos.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // o './db' si está en raíz

router.post('/registrar', async (req, res) => {
  const {
    id_producto,
    tipo_entrada,             // 'unidad' o 'kg'
    cantidad_paquetes,        // opcional si kg
    productos_por_paquete,    // opcional si kg
    precio_por_paquete,       // opcional si kg
    peso_kg,                  // opcional si paquete
    precio_por_kg,            // opcional si paquete
    pago_completado,          // boolean
    monto_pagado,
    observaciones,
    usuario_id
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Calcular cantidad_total y costo unitario
    let cantidad_total = 0;
    let costo_unitario = 0;
    if(tipo_entrada === 'unidad'){
      cantidad_total = cantidad_paquetes * productos_por_paquete;
      costo_unitario = precio_por_paquete / productos_por_paquete;
    } else if(tipo_entrada === 'kg'){
      cantidad_total = peso_kg;
      costo_unitario = precio_por_kg;
    } else {
      throw new Error('Tipo de entrada inválido');
    }

    // 2. Obtener producto para actualizar stock y precios actuales
    const [productos] = await conn.query('SELECT stock, costo_compra, precio_venta FROM Producto WHERE id_producto = ?', [id_producto]);
    if(productos.length === 0){
      throw new Error('Producto no encontrado');
    }
    const producto = productos[0];

    // 3. Calcular nuevo stock y nuevo costo promedio (ejemplo simple)
    const nuevo_stock = parseFloat(producto.stock) + cantidad_total;
    // Costo promedio ponderado
    const nuevo_costo_compra = ((producto.costo_compra * producto.stock) + (costo_unitario * cantidad_total)) / nuevo_stock;

    // 4. Definir margen para precio_venta (ejemplo 30%)
    const margen = 0.3;
    const nuevo_precio_venta = nuevo_costo_compra * (1 + margen);

    // 5. Insertar en EntradaProducto
    const monto_pendiente = pago_completado ? 0 : ((tipo_entrada === 'unidad' ? precio_por_paquete * cantidad_paquetes : precio_por_kg * peso_kg) - monto_pagado);
    const esta_cancelado = pago_completado;

    const [resultEntrada] = await conn.query(
      `INSERT INTO EntradaProducto
      (id_producto, cantidad_total, tipo_entrada, cantidad_paquetes, productos_por_paquete, precio_por_paquete,
       costo_unitario_calculado, precio_venta_sugerido, esta_cancelado, monto_pagado, monto_pendiente, usuario_id, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_producto,
        cantidad_total,
        tipo_entrada,
        cantidad_paquetes || null,
        productos_por_paquete || null,
        precio_por_paquete || null,
        costo_unitario,
        nuevo_precio_venta,
        esta_cancelado,
        monto_pagado,
        monto_pendiente,
        usuario_id,
        observaciones || null
      ]
    );
    const id_entrada = resultEntrada.insertId;

    // 6. Si hay deuda pendiente, insertar en tabla Deuda
    if(monto_pendiente > 0){
      await conn.query(
        `INSERT INTO Deuda (id_entrada, monto_pendiente, usuario_id)
         VALUES (?, ?, ?)`,
         [id_entrada, monto_pendiente, usuario_id]
      );
    }

    // 7. Actualizar stock y precios en Producto
    await conn.query(
      `UPDATE Producto SET stock = ?, costo_compra = ?, precio_venta = ?, updated_by = ?, updated_at = NOW()
       WHERE id_producto = ?`,
      [nuevo_stock, nuevo_costo_compra, nuevo_precio_venta, usuario_id, id_producto]
    );

    // 8. Registrar en Auditoria
    await conn.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES (?, 'INSERT', ?, ?, ?)`,
      ['EntradaProducto', id_entrada, `Ingreso de producto ID ${id_producto}, cantidad: ${cantidad_total}`, usuario_id]
    );

    await conn.commit();
    res.json({ message: 'Ingreso registrado correctamente' });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
