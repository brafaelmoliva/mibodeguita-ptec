const express = require('express');
const router = express.Router();
const authUser = require('../middlewares/authUser');
const {
  getProductos,
  crearProducto,
  actualizarProducto
} = require('../controllers/productoController');

// Obtener todos los productos activos
router.get('/', getProductos);

// Crear nuevo producto
router.post('/', authUser, crearProducto);

// Actualizar producto existente
router.put('/:id', authUser, actualizarProducto);

module.exports = router;
