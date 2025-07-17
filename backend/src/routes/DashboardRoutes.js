const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');

// Dashboard metrics
router.get('/productos-hoy', dashboardController.getProductosHoy);
router.get('/valor-inventario', dashboardController.getValorInventario);
router.get('/total-stock', dashboardController.getTotalStock);

// Entradas y gastos
router.get('/entradas-filtradas', dashboardController.getEntradasFiltradas);
router.get('/gastos-filtrados', dashboardController.getGastosFiltrados); 

// Categorías
router.get('/top-categorias', dashboardController.getTopCategorias);

// Productos (para filtros)
router.get('/productos', dashboardController.getProductos);

module.exports = router;
