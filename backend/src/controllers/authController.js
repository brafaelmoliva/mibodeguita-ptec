const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');
const db = require('../config/db');

const registrarAdmin = async (req, res) => {
  const { nombre_completo, correo, contraseña } = req.body;

  if (!nombre_completo || !correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

    const nuevoUsuarioId = await usuarioModel.crearUsuarioAdmin({
      nombre_completo,
      correo,
      contraseña: contraseñaHasheada,
    });

    // Detectar si hay un usuario autenticado (admin) haciendo el registro
    const adminId = req.user?.id_usuario || null;

    const descripcion = adminId
      ? `El administrador con ID ${adminId} registró un nuevo administrador (${correo})`
      : `Registro inicial del administrador (${correo}) sin sesión activa`;

    await db.query(
      `INSERT INTO Auditoria (tabla_afectada, tipo_operacion, id_registro, descripcion, usuario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'Usuario',
        'INSERT',
        nuevoUsuarioId,
        descripcion,
        adminId,
      ]
    );

    res.status(201).json({ mensaje: 'Usuario administrador creado', id: nuevoUsuarioId });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const usuario = await usuarioModel.obtenerUsuarioPorCorreo(correo);

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const passwordValido = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Generar token JWT con id_usuario y es_admin
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        es_admin: usuario.es_admin,
        nombre_completo: usuario.nombre_completo, // ← útil para auditoría
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        es_admin: usuario.es_admin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { registrarAdmin, login };
