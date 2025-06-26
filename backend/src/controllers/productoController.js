const pool = require('../config/db');
const { registrarAuditoria } = require('../utils/auditoriaUtil');

const getProductos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id_producto,
        p.id_proveedor,
        p.id_categoria,
        p.nombre_producto,
        p.descripcion_producto,
        p.unidad_medida,
        p.stock,
        p.stock_min,
        p.precio,
        p.costo_compra,
        p.precio_venta,
        CAST(p.estado AS UNSIGNED) AS estado,   -- <-- Aquí el cast
        p.created_at,
        p.created_by,
        p.updated_at,
        p.updated_by,
        c.nombre_categoria, 
        pr.nombre_razon_social AS nombre_proveedor
      FROM Producto p
      JOIN Categoria c ON p.id_categoria = c.id_categoria
      JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};



const crearProducto = async (req, res) => {
  const {
    id_proveedor,
    id_categoria,
    nombre_producto,
    descripcion_producto,
    unidad_medida,
    stock_min
  } = req.body;

  const createdBy = req.user.id_usuario;

  try {
    const [result] = await pool.query(`
      INSERT INTO Producto 
        (id_proveedor, id_categoria, nombre_producto, descripcion_producto, unidad_medida, stock, stock_min, costo_compra, precio_venta, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, 0, ?, 0, 0, ?, ?)
    `, [
      id_proveedor, id_categoria, nombre_producto, descripcion_producto,
      unidad_medida, stock_min, createdBy, createdBy
    ]);

    const descripcion = `Producto creado:
ID: ${result.insertId}, Nombre: ${nombre_producto}, Proveedor ID: ${id_proveedor}, Categoría ID: ${id_categoria}`;

    await registrarAuditoria('Producto', 'INSERT', result.insertId, descripcion, createdBy);

    res.status(201).json({ message: 'Producto creado correctamente' });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const {
    id_proveedor,
    id_categoria,
    nombre_producto,
    descripcion_producto,
    unidad_medida,
    stock,
    stock_min,
    precio,
    costo_compra,
    precio_venta,
    estado
  } = req.body;

  const updatedBy = req.user.id_usuario;

  try {
    // Convertir estado a número (0 o 1) si viene como Buffer
    let estadoNum;
    if (Buffer.isBuffer(estado)) {
      estadoNum = estado[0];
    } else {
      estadoNum = estado ? 1 : 0;
    }

    await pool.query(`
      UPDATE Producto SET
        id_proveedor = ?, id_categoria = ?, nombre_producto = ?, descripcion_producto = ?,
        unidad_medida = ?, stock = ?, stock_min = ?, precio = ?, costo_compra = ?, precio_venta = ?, estado = ?, updated_by = ?
      WHERE id_producto = ?
    `, [
      id_proveedor, id_categoria, nombre_producto, descripcion_producto,
      unidad_medida, stock, stock_min, precio, costo_compra, precio_venta,
      estadoNum, updatedBy, id
    ]);

    const descripcion = `Producto actualizado:
ID: ${id}, Nombre: ${nombre_producto}, Proveedor ID: ${id_proveedor}, Categoría ID: ${id_categoria}`;

    await registrarAuditoria('Producto', 'UPDATE', id, descripcion, updatedBy);

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};


module.exports = {
  getProductos,
  crearProducto,
  actualizarProducto
};
