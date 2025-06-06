const express = require('express');
const router = express.Router();
const pool = require('../config/db');


router.get('/', async (req, res) => {

  try {
    const [rows] = await pool.query('SELECT id_categoria, nombre_categoria FROM Categoria WHERE estado = 1');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

module.exports = router;
