// src/routes/detalleComprobanteRoutes.js
const express = require("express");
const router = express.Router();
const { getDetalleComprobantePorId } = require("../controllers/detalleComprobanteController");
const authUser = require("../middlewares/authUser");

router.get("/:id_comprobante", authUser, getDetalleComprobantePorId);

module.exports = router;
