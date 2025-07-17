const pool = require('../config/db');

// 1. Total de productos ingresados hoy
exports.getProductosHoy = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM EntradaProducto
      WHERE DATE(fecha_entrada) = CURDATE()
    `);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener productos ingresados hoy' });
  }
};

// 2. Valor total del inventario (stock × costo)
exports.getValorInventario = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ROUND(SUM(stock * costo_compra), 2) AS total
      FROM Producto
      WHERE estado = 1
    `);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener valor del inventario' });
  }
};

// 3. Total de productos en stock
exports.getTotalStock = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT SUM(stock) AS total
      FROM Producto
      WHERE estado = 1
    `);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener total de stock' });
  }
};

// 4. Productos ingresados últimos 7 días
exports.getEntradasPorDia = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE(fecha_entrada) AS fecha,
        COUNT(*) AS total_entradas
      FROM EntradaProducto
      WHERE fecha_entrada >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha_entrada)
      ORDER BY fecha ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener entradas por día' });
  }
};

// 5. Categorías más comunes
exports.getTopCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.nombre_categoria,
        COUNT(p.id_producto) AS total_productos
      FROM Producto p
      JOIN Categoria c ON p.id_categoria = c.id_categoria
      GROUP BY c.nombre_categoria
      ORDER BY total_productos DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener categorías principales' });
  }
};
