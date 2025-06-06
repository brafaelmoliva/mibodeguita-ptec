const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // o './db' si está en raíz
const authUser = require('../middlewares/authUser'); // ← este
  
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.nombre_categoria, pr.nombre_proveedor
       FROM Producto p
       LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria
       LEFT JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
       WHERE p.estado = 1`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  const id_producto = req.params.id;
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.nombre_categoria, pr.nombre_proveedor
       FROM Producto p
       LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria
       LEFT JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
       WHERE p.id_producto = ? AND p.estado = 1`,
      [id_producto]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Crear un nuevo producto
router.post('/', authUser, async (req, res) => {
  try {
    const {
  id_categoria,
  id_proveedor,
  nombre_producto,
  descripcion_producto,
  unidad_medida,
  stock,
  stock_min,
  precio,
  costo_compra,
  precio_venta
} = req.body;

    const usuarioId = req.user.id_usuario;

    // Suponemos que en creación el costo_compra y precio_venta se inician en 0
    const [resultado] = await pool.query(`
      INSERT INTO Producto (
    id_categoria, id_proveedor, nombre_producto, descripcion_producto,
    unidad_medida, stock, stock_min,
    precio, costo_compra, precio_venta, created_by, updated_by
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)


    `, [
       id_categoria, id_proveedor, nombre_producto, descripcion_producto,
  unidad_medida, stock, stock_min,
  precio, costo_compra, precio_venta,
  usuarioId, usuarioId
    ]);

    const nuevoId = resultado.insertId;

    // Registrar en auditoría
    await pool.query(`
      INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
      VALUES (?, ?, ?, ?, ?)
    `, [
      'Producto',
      'INSERT',
      nuevoId,
      `Usuario ${usuarioId} creó el producto '${nombre_producto}'`,
      usuarioId
    ]);

    res.status(201).json({ mensaje: 'Producto creado correctamente', id_producto: nuevoId });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: 'Error al crear producto' });
  }
});


// Actualizar un producto existente
router.put('/:id', authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const {
  id_categoria,
  id_proveedor,
  nombre_producto,
  descripcion_producto,
  unidad_medida,
  stock,
  stock_min,
  precio,
  costo_compra,
  precio_venta,
  estado  // <-- agregar aquí
} = req.body;

    const usuarioId = req.user.id_usuario;

    const [resultado] = await pool.query(`
      UPDATE Producto SET
        id_categoria = ?, id_proveedor = ?, nombre_producto = ?, descripcion_producto = ?,
        unidad_medida = ?, stock = ?, stock_min = ?, precio = ?,
        costo_compra = ?, precio_venta = ?, estado = ? ,updated_by = ?
      WHERE id_producto = ?
    `, [
      id_categoria, id_proveedor, nombre_producto, descripcion_producto,
      unidad_medida, stock, stock_min, precio,
      costo_compra, precio_venta,estado, usuarioId,
      id
    ]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await pool.query(`
      INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
      VALUES (?, ?, ?, ?, ?)
    `, [
      'Producto',
      'UPDATE',
      id,
      `Usuario ${usuarioId} actualizó el producto '${nombre_producto}'`,
      usuarioId
    ]);

    res.json({ mensaje: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});


// "Eliminar" producto (cambiar estado a 0)
// Agrega authUser para proteger la ruta y obtener usuario
router.delete('/:id', authUser, async (req, res) => {
  const id_producto = req.params.id;
  const usuarioId = req.user.id_usuario;

  try {
    const [result] = await pool.query(
      `UPDATE Producto SET estado = 0, updated_by = ?, updated_at = NOW() WHERE id_producto = ?`,
      [usuarioId, id_producto]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Opcional: registrar auditoría también para eliminación lógica
    await pool.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'Producto',
        'DELETE',
        id_producto,
        `Usuario ${usuarioId} desactivó el producto ID ${id_producto}`,
        usuarioId,
      ]
    );

    res.json({ message: 'Producto desactivado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al desactivar producto' });
  }
});


module.exports = router;
