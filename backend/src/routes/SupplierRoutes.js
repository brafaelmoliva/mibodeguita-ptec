const express = require('express');
const pool = require('../config/db');
const authUser = require('../middlewares/authUser'); 
const router = express.Router();

// Ruta pública sin auth
router.get('/proveedores', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedor');

    // Convertimos estado de Buffer a número
    const proveedores = rows.map(prov => ({
      ...prov,
      estado: prov.estado[0]  // <-- igual que en categorias
    }));

    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
});


//AGREGAR

router.post('/proveedores', authUser, async (req, res) => {
  const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor } = req.body;
  const usuarioId = req.user.id_usuario; // <-- Aquí tienes el usuario logueado

  try {
    const [result] = await pool.query(
      `INSERT INTO proveedor (nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor)
       VALUES (?, ?, ?, ?)`,
      [nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor]
    );

    // Insertar en auditoría
    await pool.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES (?, 'INSERT', ?, ?, ?)`,
      ['proveedor', result.insertId, `Proveedor creado: ${nombre_proveedor}`, usuarioId]
    );

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar proveedor' });
  }
});


//ACTUALIZAR
router.put('/proveedores/:id', authUser, async (req, res) => {
  const { id } = req.params;
  const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, estado } = req.body;
  const usuarioId = req.user.id_usuario;

  try {
    await pool.query(
      `UPDATE proveedor 
       SET nombre_proveedor = ?, telefono_proveedor = ?, email_proveedor = ?, direccion_proveedor = ?, estado = ?
       WHERE id_proveedor = ?`,
      [nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, estado ? 1 : 0, id]
    );

    // Insertar en auditoría
    await pool.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES (?, 'UPDATE', ?, ?, ?)`,
      ['proveedor', id, `Proveedor actualizado: ${nombre_proveedor}`, usuarioId]
    );

    res.send('Proveedor actualizado correctamente');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }



});



module.exports = router;
