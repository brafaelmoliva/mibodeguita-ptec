const express = require('express');
const router = express.Router();
const {
  registrarEntradaProducto,
  obtenerEntradasProducto,
  obtenerEntradaPorId
} = require('../controllers/entradaController');

router.post('/', registrarEntradaProducto);
router.get('/', obtenerEntradasProducto);
router.get('/', obtenerEntradasProducto);
router.get('/:id', obtenerEntradaPorId); 


module.exports = router;
