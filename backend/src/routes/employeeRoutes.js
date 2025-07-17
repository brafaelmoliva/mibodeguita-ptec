// src/routes/empleadoRoutes.js
const express = require('express');
const router = express.Router();
const { crearEmpleado, consultarDNI, obtenerTodosEmpleados, actualizarEmpleado } = require('../controllers/employeeController');
const authAdmin = require('../middlewares/authAdmin');

// Crear empleado (protegido)
router.post('/', authAdmin, crearEmpleado);

// Consultar nombre por DNI (protegido para usuarios autenticados)
router.get('/dni/:dni', authAdmin, consultarDNI);

router.get('/', authAdmin, obtenerTodosEmpleados);
router.put('/:id', authAdmin, actualizarEmpleado);



module.exports = router;
