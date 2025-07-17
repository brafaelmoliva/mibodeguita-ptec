const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db'); // Asegúrate que este archivo exporte un pool/query MySQL
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { dni, correo, contraseña, es_admin, puede_eliminar, estado } = req.body;

  if (!dni || !correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    // Consultar RENIEC para obtener nombre completo
    const respuesta = await axios.get(`https://apiperu.dev/api/dni/${dni}`, {
      headers: { Authorization: `Bearer ${process.env.APIPERU_DNI_KEY}` }
    });

    const dataReniec = respuesta.data?.data;
    if (!dataReniec) {
      return res.status(404).json({ error: 'DNI no encontrado en RENIEC' });
    }

    const nombre_completo = `${dataReniec.nombres} ${dataReniec.apellido_paterno} ${dataReniec.apellido_materno}`;

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

    // Insertar en la tabla Usuario
    const [result] = await db.query(
      `INSERT INTO Usuario (nombre_completo, correo, contraseña, es_admin, puede_eliminar, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_completo, correo, contraseñaHasheada, es_admin || false, puede_eliminar || false, estado ? 1 : 0]
    );

    const nuevoUsuarioId = result.insertId;

    // (Opcional) Auditoría si tienes middleware que inyecte req.user con admin info
    const adminId = req.user?.id_usuario;
    const adminNombre = req.user?.nombre_completo;

    if (adminId) {
      await db.query(
        `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          'Usuario',
          'INSERT',
          nuevoUsuarioId,
          `El administrador ${adminNombre} (ID ${adminId}) registró al empleado ${correo} con DNI ${dni}`,
          adminId
        ]
      );
    }

    res.status(201).json({ mensaje: 'Empleado creado correctamente', id: nuevoUsuarioId, nombre_completo });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar empleado' });
  }
});

module.exports = router;
