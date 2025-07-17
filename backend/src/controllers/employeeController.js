const bcrypt = require('bcrypt');
const db = require('../config/db');
const axios = require('axios');
require('dotenv').config(); // Asegúrate de tener .env con APIPERU_DNI_KEY

const crearEmpleado = async (req, res) => {
  const { dni, correo, contraseña, es_admin, puede_eliminar, estado } = req.body;

  if (!dni || !correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    // Obtener datos desde RENIEC usando API
    const respuesta = await axios.get(`https://api.apiperu.dev/api/dni/${dni}`, {
      headers: {
        Authorization: `Bearer ${process.env.APIPERU_DNI_KEY}`
      }
    });

    const data = respuesta.data?.data;
    if (!data) {
      return res.status(404).json({ error: 'DNI no encontrado en RENIEC' });
    }

    const nombre_completo = `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`;

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

    // Insertar en la base de datos
    const [result] = await db.query(
      `INSERT INTO Usuario (nombre_completo, correo, contraseña, es_admin, puede_eliminar, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_completo, correo, contraseñaHasheada, es_admin, puede_eliminar, estado]
    );

    res.status(201).json({ message: 'Empleado creado exitosamente' });
  } catch (error) {
    console.error('Error al crear empleado:', error.message);
    res.status(500).json({ error: 'Error al crear el empleado' });
  }
};

module.exports = { crearEmpleado };
