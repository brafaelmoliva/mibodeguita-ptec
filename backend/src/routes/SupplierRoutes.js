// routes/SupplierRoutes.js
const express = require('express');
const pool = require('../config/db'); // o './db' si está en raíz

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
  const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor } = req.body;
  try {
    await pool.query(
      `INSERT INTO proveedor (nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor)
       VALUES (?, ?, ?, ?)`,
      [nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor]
    );
    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar proveedor' });
  }
});

router.put('/proveedores/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, estado } = req.body;
  try {
    await pool.query(
      `UPDATE proveedor 
       SET nombre_proveedor = ?, telefono_proveedor = ?, email_proveedor = ?, direccion_proveedor = ?, estado = ?
       WHERE id_proveedor = ?`,
      [nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, estado ? 1 : 0, id]
    );
    res.send('Proveedor actualizado correctamente');
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
});

module.exports = router;
