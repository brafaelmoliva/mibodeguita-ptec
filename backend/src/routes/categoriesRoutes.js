// routes/categoriaRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authUser = require('../middlewares/authUser');

// Obtener todas las categorías sin importar estado
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Categoria');

    const categorias = rows.map(cat => ({
      ...cat,
      estado: cat.estado[0] // <-- aquí convertimos Buffer a número
    }));

    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});


// Agregar nueva categoría
router.post('/', authUser, async (req, res) => {
  const { nombre_categoria, descripcion_categoria } = req.body;
  const usuarioId = req.user.id_usuario;

  try {
    const [result] = await pool.query(
      `INSERT INTO Categoria (nombre_categoria, descripcion_categoria)
       VALUES (?, ?)`,
      [nombre_categoria, descripcion_categoria]
    );

    await pool.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES ('Categoria', 'INSERT', ?, ?, ?)`,
      [result.insertId, `Categoría creada: ${nombre_categoria}`, usuarioId]
    );

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar categoría' });
  }
});

// Actualizar categoría
router.put('/:id', authUser, async (req, res) => {
  const { id } = req.params;
  const { nombre_categoria, descripcion_categoria, estado } = req.body;
  const usuarioId = req.user.id_usuario;

  try {
    await pool.query(
      `UPDATE Categoria 
       SET nombre_categoria = ?, descripcion_categoria = ?, estado = ?
       WHERE id_categoria = ?`,
      [nombre_categoria, descripcion_categoria, estado ? 1 : 0, id]
    );

    await pool.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES ('Categoria', 'UPDATE', ?, ?, ?)`,
      [id, `Categoría actualizada: ${nombre_categoria}`, usuarioId]
    );

    res.send('Categoría actualizada correctamente');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

module.exports = router;
