// src/routes/empleadoRoutes.js
const express = require('express');
const router = express.Router();
const { crearEmpleado } = require('../controllers/employeeController');
const authAdmin = require('../middlewares/authAdmin'); // ← usa tu archivo existente

router.post('/', authAdmin, crearEmpleado);

module.exports = router;
