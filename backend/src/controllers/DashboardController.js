const pool = require('../config/db');

// 1. Total de productos ingresados hoy
const getProductosHoy = async (req, res) => {
  try {
    const { periodo } = req.query;
    const hoy = new Date();

    let fechaInicio;
    switch (periodo) {
      case 'dia':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        break;
      case 'semana':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case 'anio':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        break;
      default:
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    }

    const fechaInicioStr = fechaInicio.toISOString().slice(0, 10);

    const [rows] = await pool.query(`
      SELECT IFNULL(SUM(dep.cantidad_total), 0) AS total
      FROM EntradaProducto ep
      JOIN DetalleEntradaProducto dep ON ep.id_entrada = dep.id_entrada
      WHERE ep.fecha_entrada >= ?
    `, [fechaInicioStr]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener productos ingresados:', error);
    res.status(500).json({ mensaje: 'Error al obtener productos ingresados' });
  }
};


// 2. Valor total del inventario (stock × costo)
const getValorInventario = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ROUND(SUM(stock * costo_compra), 2) AS total
      FROM Producto
      WHERE estado = 1
    `);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener valor del inventario:', error);
    res.status(500).json({ mensaje: 'Error al obtener valor del inventario' });
  }
};

// 3. Total de productos en stock
const getTotalStock = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT SUM(stock) AS total
      FROM Producto
      WHERE estado = 1
    `);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener total de stock:', error);
    res.status(500).json({ mensaje: 'Error al obtener total de stock' });
  }
};

// 4. Entradas filtradas por producto y periodo (día, semana, mes, año)
const getEntradasFiltradas = async (req, res) => {
  try {
    const { productoId, periodo } = req.query;
    const hoy = new Date();

    let fechaInicio;
    switch (periodo) {
      case 'dia':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        break;
      case 'semana':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case 'anio':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        break;
      default:
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - 7);
    }
    const fechaInicioStr = fechaInicio.toISOString().slice(0, 10);

    let groupBy, selectDate;
    switch (periodo) {
      case 'dia':
        groupBy = "DATE(ep.fecha_entrada)";
        selectDate = "DATE(ep.fecha_entrada) AS fecha";
        break;
      case 'semana':
        groupBy = "YEARWEEK(ep.fecha_entrada, 3)";
        selectDate = `STR_TO_DATE(CONCAT(YEARWEEK(ep.fecha_entrada,3),' Monday'), '%X%V %W') AS fecha`;
        break;
      case 'mes':
        groupBy = "DATE_FORMAT(ep.fecha_entrada, '%Y-%m')";
        selectDate = "DATE_FORMAT(ep.fecha_entrada, '%Y-%m-01') AS fecha";
        break;
      case 'anio':
        groupBy = "YEAR(ep.fecha_entrada)";
        selectDate = "STR_TO_DATE(CONCAT(YEAR(ep.fecha_entrada), '-01-01'), '%Y-%m-%d') AS fecha";
        break;
      default:
        groupBy = "DATE(ep.fecha_entrada)";
        selectDate = "DATE(ep.fecha_entrada) AS fecha";
    }

    let query = `
      SELECT ${selectDate}, IFNULL(SUM(dep.cantidad_total), 0) AS total_entradas
      FROM EntradaProducto ep
      JOIN DetalleEntradaProducto dep ON ep.id_entrada = dep.id_entrada
      WHERE ep.fecha_entrada >= ?
    `;

    const params = [fechaInicioStr];

    if (productoId) {
      query += ' AND dep.id_producto = ?';
      params.push(productoId);
    }

    query += ` GROUP BY ${groupBy} ORDER BY fecha ASC`;

    const [rows] = await pool.query(query, params);
    res.json(rows);

  } catch (error) {
    console.error('Error al obtener entradas filtradas:', error);
    res.status(500).json({ mensaje: 'Error al obtener entradas filtradas' });
  }
};

// 5. Categorías más comunes
const getTopCategorias = async (req, res) => {
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
    console.error('Error al obtener categorías principales:', error);
    res.status(500).json({ mensaje: 'Error al obtener categorías principales' });
  }
};

// 6. Lista de productos (para filtro en frontend)
const getProductos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_producto, nombre_producto FROM Producto WHERE estado = 1
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
};

// 7. Gastos filtrados por periodo
const getGastosFiltrados = async (req, res) => {
  try {
    const { periodo } = req.query;
    const hoy = new Date();

    let fechaInicio;
    switch (periodo) {
      case 'dia':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        break;
      case 'semana':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      default:
        fechaInicio = null; // Para 'mes', 'anio' y casos por defecto, no filtrar
    }

    const fechaInicioStr = fechaInicio ? fechaInicio.toISOString().slice(0, 10) : null;

    let groupBy, selectDate;
    switch (periodo) {
      case 'dia':
        groupBy = "DATE(fecha_entrada)";
        selectDate = "DATE(fecha_entrada) AS fecha";
        break;
      case 'semana':
        groupBy = `STR_TO_DATE(CONCAT(YEARWEEK(fecha_entrada, 3), ' Monday'), '%X%V %W')`;
        selectDate = `STR_TO_DATE(CONCAT(YEARWEEK(fecha_entrada, 3), ' Monday'), '%X%V %W') AS fecha`;
        break;
      case 'mes':
        groupBy = "STR_TO_DATE(CONCAT(DATE_FORMAT(fecha_entrada, '%Y-%m'), '-01'), '%Y-%m-%d')";
        selectDate = "STR_TO_DATE(CONCAT(DATE_FORMAT(fecha_entrada, '%Y-%m'), '-01'), '%Y-%m-%d') AS fecha";
        break;
      case 'anio':
        groupBy = "STR_TO_DATE(CONCAT(YEAR(fecha_entrada), '-01-01'), '%Y-%m-%d')";
        selectDate = "STR_TO_DATE(CONCAT(YEAR(fecha_entrada), '-01-01'), '%Y-%m-%d') AS fecha";
        break;
      default:
        groupBy = "DATE(fecha_entrada)";
        selectDate = "DATE(fecha_entrada) AS fecha";
    }

    const whereClause = fechaInicioStr ? "WHERE fecha_entrada >= ?" : "";
    const params = fechaInicioStr ? [fechaInicioStr] : [];

    const query = `
      SELECT 
        ${selectDate},
        IFNULL(SUM(monto_pagado), 0) AS total_pagado
      FROM EntradaProducto
      ${whereClause}
      GROUP BY ${groupBy}
      ORDER BY fecha ASC
    `;

    const [rows] = await pool.query(query, params);
    res.json(rows);

  } catch (error) {
    console.error('Error al obtener gastos filtrados:', error);
    res.status(500).json({ mensaje: 'Error al obtener gastos filtrados' });
  }
};


module.exports = {
  getProductosHoy,
  getValorInventario,
  getTotalStock,
  getEntradasFiltradas,
  getTopCategorias,
  getProductos,
  getGastosFiltrados,
};
