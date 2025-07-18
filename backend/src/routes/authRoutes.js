// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post("/register", authController.register); 
router.post("/verificar", authController.verificarCorreo);
router.post("/reenviar-codigo", authController.reenviarCodigo);
router.post('/login', authController.login); 
module.exports = router;