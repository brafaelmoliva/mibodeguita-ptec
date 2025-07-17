const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');

router.get('/productos-hoy', dashboardController.getProductosHoy);
router.get('/valor-inventario', dashboardController.getValorInventario);
router.get('/total-stock', dashboardController.getTotalStock);
router.get('/entradas-dia', dashboardController.getEntradasPorDia);
router.get('/top-categorias', dashboardController.getTopCategorias);

module.exports = router;
