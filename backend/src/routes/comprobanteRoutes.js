const express = require('express');
const router = express.Router();
const { registrarComprobante, getComprobantes, getDetalleComprobante } = require('../controllers/comprobanteController');
const authUser = require('../middlewares/authUser');

router.get('/', authUser, getComprobantes);
router.post('/', authUser, registrarComprobante);
router.get('/detalle/:id', authUser, getDetalleComprobante); // ✅ nueva ruta

module.exports = router;
