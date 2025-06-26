const express = require('express');
const router = express.Router();
const {
  registrarEntradaProducto,
  obtenerEntradasProducto
} = require('../controllers/entradaController');

router.post('/', registrarEntradaProducto);
router.get('/', obtenerEntradasProducto);

module.exports = router;
