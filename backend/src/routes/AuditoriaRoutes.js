const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/AuditoriaController');

router.get('/', auditoriaController.getAuditoria);

module.exports = router;
