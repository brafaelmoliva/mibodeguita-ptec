const bcrypt = require('bcrypt');
const db = require('../config/db');
const axios = require('axios');

// Crear empleado
const crearEmpleado = async (req, res) => {
  const {
    nombre_completo,
    correo,
    contraseña,
    es_admin = false,
    puede_eliminar = false,
    estado = 1,
    dni
  } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Validar formato de DNI
  if (dni && !/^\d{8}$/.test(dni)) {
    return res.status(400).json({ error: 'El DNI debe tener exactamente 8 dígitos numéricos.' });
  }

  let nombre = nombre_completo;

  // Si se proporcionó DNI, consultar ApiPeruDev para obtener nombre completo
  if (dni) {
    try {
      const response = await axios.get(`https://apiperu.dev/api/dni/${dni}`, {
        headers: {
          Authorization: `Bearer ${process.env.APIPERU_API_KEY}`
        }
      });

      const { success, data } = response.data;

      if (!success || !data) {
        return res.status(404).json({ error: 'DNI no encontrado en ApiPeruDev' });
      }

      nombre = `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`;
    } catch (error) {
      console.error('Error al consultar ApiPeruDev para el DNI:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Error al consultar ApiPeruDev para el DNI' });
    }
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

    const [result] = await db.query(
      `INSERT INTO Usuario (nombre_completo, correo, contraseña, es_admin, puede_eliminar, estado, dni)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, correo, contraseñaHasheada, es_admin, puede_eliminar, estado, dni]
    );

    const nuevoUsuarioId = result.insertId;

    const adminId = req.user?.id_usuario;
    const adminNombre = req.user?.nombre_completo;

    if (!adminId) {
      return res.status(403).json({ error: 'Usuario no autorizado para registrar empleados' });
    }

    await db.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'Usuario',
        'INSERT',
        nuevoUsuarioId,
        `El administrador ${adminNombre} (ID ${adminId}) registró al empleado ${correo}`,
        adminId
      ]
    );

    res.status(201).json({ mensaje: 'Empleado creado correctamente', id: nuevoUsuarioId });
  } catch (error) {
    console.error('Error al registrar empleado:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar empleado' });
  }
};

// Consultar nombre completo desde API por DNI
const consultarDNI = async (req, res) => {
  const { dni } = req.params;

  if (!/^\d{8}$/.test(dni)) {
    return res.status(400).json({ error: 'DNI inválido. Debe tener 8 dígitos numéricos.' });
  }

  try {
    const response = await axios.get(`https://apiperu.dev/api/dni/${dni}`, {
      headers: {
        Authorization: `Bearer ${process.env.APIPERU_API_KEY}`
      }
    });

    const { success, data } = response.data;

    if (!success || !data) {
      return res.status(404).json({ error: 'DNI no encontrado' });
    }

    const nombre_completo = `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`;
    res.json({ dni: data.numero, nombre_completo });
  } catch (error) {
    console.error('Error al consultar ApiPeruDev:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al consultar ApiPeruDev' });
  }
};

const obtenerTodosEmpleados = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id_usuario, nombre_completo, dni, correo, es_admin, puede_eliminar, estado FROM Usuario`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
};

// También un endpoint para actualizar empleado
const actualizarEmpleado = async (req, res) => {
  const id = req.params.id;
  const {
    nombre_completo,
    correo,
    es_admin,
    puede_eliminar,
    estado,
    dni,
  } = req.body;

  try {
    await db.query(
      `UPDATE Usuario SET nombre_completo = ?, correo = ?, es_admin = ?, puede_eliminar = ?, estado = ?, dni = ? WHERE id_usuario = ?`,
      [nombre_completo, correo, es_admin, puede_eliminar, estado, dni, id]
    );
    res.json({ mensaje: "Empleado actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    res.status(500).json({ error: "Error al actualizar empleado" });
  }
};

module.exports = { crearEmpleado, consultarDNI, obtenerTodosEmpleados, actualizarEmpleado };
