// routes/SupplierRoutes.js
const express = require('express');
const pool = require('../config/db'); // ajusta si es necesario

const router = express.Router();

router.get('/', (req, res) => res.send('API funcionando'));

router.get('/proveedores', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedor');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
});

router.post('/proveedores', async (req, res) => {
  const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, usuario_id } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO proveedor (nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor)
       VALUES (?, ?, ?, ?)`,
      [nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor]
    );

    const proveedorId = result.insertId;

    await pool.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'proveedor',
        'INSERT',
        proveedorId,
        `Se agregó el proveedor: ${nombre_proveedor}`,
        usuario_id || null
      ]
    );

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar proveedor' });
  }
});

router.put('/proveedores/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, estado, usuario_id } = req.body;

  try {
    await pool.query(
      `UPDATE proveedor 
       SET nombre_proveedor = ?, telefono_proveedor = ?, email_proveedor = ?, direccion_proveedor = ?, estado = ?
       WHERE id_proveedor = ?`,
      [nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, estado ? 1 : 0, id]
    );

    await pool.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'proveedor',
        'UPDATE',
        id,
        `Se actualizó el proveedor: ${nombre_proveedor}`,
        usuario_id || null
      ]
    );

    res.send('Proveedor actualizado correctamente');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
});

module.exports = router;
