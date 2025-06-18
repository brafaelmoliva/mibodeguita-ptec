const express = require('express');
const pool = require('../config/db');
const authUser = require('../middlewares/authUser');
const axios = require('axios');
const router = express.Router();

// Obtener todos los proveedores (activos e inactivos)
router.get('/proveedores', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         id_proveedor, ruc, nombre_razon_social, direccion, direccion_completa,
         estado_sunat, condicion_sunat, departamento, provincia, distrito, ubigeo_sunat,
         estado_negocio
       FROM Proveedor`
    );

    const proveedores = rows.map(prov => ({
      ...prov,
      estado_negocio: prov.estado_negocio[0]
    }));

    res.json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

// Consultar datos por RUC usando ApiPeruDev
router.get('/proveedores/ruc/:ruc', async (req, res) => {
  const { ruc } = req.params;
  const API_KEY = process.env.APIPERU_API_KEY;

  try {
    const response = await axios.get(`https://apiperu.dev/api/ruc/${ruc}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    if (!response.data.success) {
      return res.status(404).json({ error: 'RUC no encontrado' });
    }

    const data = response.data.data;

    res.json({
      ruc: data.ruc,
      nombre_razon_social: data.nombre_o_razon_social,
      direccion: data.direccion,
      direccion_completa: data.direccion_completa,
      estado_sunat: data.estado,
      condicion_sunat: data.condicion,
      departamento: data.departamento,
      provincia: data.provincia,
      distrito: data.distrito,
      ubigeo_sunat: data.ubigeo_sunat
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Error al consultar ApiPeruDev' });
  }
});

// AGREGAR proveedor
router.post('/proveedores', authUser, async (req, res) => {
  const {
    ruc,
    nombre_razon_social,
    direccion,
    direccion_completa,
    estado_sunat,
    condicion_sunat,
    departamento,
    provincia,
    distrito,
    ubigeo_sunat
  } = req.body;

  const usuarioId = req.user.id_usuario;

  try {
    const [result] = await pool.query(
      `INSERT INTO Proveedor 
       (ruc, nombre_razon_social, direccion, direccion_completa, estado_sunat, condicion_sunat,
        departamento, provincia, distrito, ubigeo_sunat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ruc,
        nombre_razon_social,
        direccion,
        direccion_completa,
        estado_sunat,
        condicion_sunat,
        departamento,
        provincia,
        distrito,
        ubigeo_sunat
      ]
    );

    const descripcion = `Proveedor creado:
RUC: ${ruc},
Razón Social: ${nombre_razon_social},
Dirección: ${direccion},
Dirección completa: ${direccion_completa},
Estado SUNAT: ${estado_sunat},
Condición SUNAT: ${condicion_sunat},
Departamento: ${departamento},
Provincia: ${provincia},
Distrito: ${distrito},
Ubigeo SUNAT: ${ubigeo_sunat}`;

    await pool.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES (?, 'INSERT', ?, ?, ?)`,
      ['Proveedor', result.insertId, descripcion, usuarioId]
    );

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar proveedor' });
  }
});

// ACTUALIZAR proveedor
router.put('/proveedores/:id', authUser, async (req, res) => {
  const { id } = req.params;
  const {
    ruc,
    nombre_razon_social,
    direccion,
    direccion_completa,
    estado_sunat,
    condicion_sunat,
    departamento,
    provincia,
    distrito,
    ubigeo_sunat,
    estado_negocio
  } = req.body;

  const usuarioId = req.user.id_usuario;

  try {
    await pool.query(
      `UPDATE Proveedor SET
         ruc = ?,
         nombre_razon_social = ?,
         direccion = ?,
         direccion_completa = ?,
         estado_sunat = ?,
         condicion_sunat = ?,
         departamento = ?,
         provincia = ?,
         distrito = ?,
         ubigeo_sunat = ?,
         estado_negocio = ?
       WHERE id_proveedor = ?`,
      [
        ruc,
        nombre_razon_social,
        direccion,
        direccion_completa,
        estado_sunat,
        condicion_sunat,
        departamento,
        provincia,
        distrito,
        ubigeo_sunat,
        estado_negocio ? 1 : 0,
        id
      ]
    );

    const descripcion = `Proveedor actualizado:
RUC: ${ruc},
Razón Social: ${nombre_razon_social},
Dirección: ${direccion},
Dirección completa: ${direccion_completa},
Estado SUNAT: ${estado_sunat},
Condición SUNAT: ${condicion_sunat},
Departamento: ${departamento},
Provincia: ${provincia},
Distrito: ${distrito},
Ubigeo SUNAT: ${ubigeo_sunat},
Estado negocio: ${estado_negocio ? 'Activo' : 'Inactivo'}`;

    await pool.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES (?, 'UPDATE', ?, ?, ?)`,
      ['Proveedor', id, descripcion, usuarioId]
    );

    res.send('Proveedor actualizado correctamente');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
});

module.exports = router;
