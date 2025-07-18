const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { enviarCodigoVerificacion } = require('../utils/emailUtil');
const { registrarAuditoria } = require('../utils/auditoriaUtil'); // ✅ importar util de auditoría

// 1️⃣ Enviar código de verificación
const reenviarCodigo = async (req, res) => {
  const { correo } = req.body;

  if (!correo) return res.status(400).json({ error: 'Correo obligatorio' });

  try {
    const [usuarios] = await pool.query("SELECT * FROM Usuario WHERE correo = ?", [correo]);
    if (usuarios.length > 0) {
      return res.status(400).json({ error: "Este correo ya está registrado" });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      "REPLACE INTO CodigosVerificacion (correo, codigo, creado_en) VALUES (?, ?, NOW())",
      [correo, codigo]
    );

    await enviarCodigoVerificacion(correo, codigo);
    res.status(200).json({ mensaje: "Código enviado. Revisa tu correo." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al enviar código" });
  }
};

// 2️⃣ Verificar código
const verificarCorreo = async (req, res) => {
  const { correo, codigo } = req.body;

  if (!correo || !codigo) {
    return res.status(400).json({ error: 'Correo y código son obligatorios' });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM CodigosVerificacion WHERE correo = ? AND codigo = ?",
      [correo, codigo]
    );

    if (rows.length === 0) {
      return res.status(400).json({ mensaje: "Código incorrecto o correo inválido" });
    }

    res.status(200).json({ mensaje: "Código verificado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al verificar el código" });
  }
};

// 3️⃣ Registro final del usuario con auditoría
const register = async (req, res) => {
  const { nombre_completo, correo, contraseña } = req.body;

  if (!nombre_completo || !correo || !contraseña) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [verificado] = await pool.query(
      "SELECT * FROM CodigosVerificacion WHERE correo = ?",
      [correo]
    );

    if (verificado.length === 0) {
      return res.status(400).json({ error: "Primero debes verificar tu correo" });
    }

    const contraseñaHasheada = await bcrypt.hash(contraseña, 10);

    // ✅ Insertar usuario y obtener ID
    const [result] = await pool.query(
      `INSERT INTO Usuario (nombre_completo, correo, contraseña, verificado, es_admin)
       VALUES (?, ?, ?, true, true)`,
      [nombre_completo, correo, contraseñaHasheada]
    );

    const idUsuario = result.insertId;

    // 🧼 Limpiar código verificado
    await pool.query("DELETE FROM CodigosVerificacion WHERE correo = ?", [correo]);

    // ✅ Registrar auditoría
    await registrarAuditoria(
      "Usuario", // tabla_afectada
      "INSERT",  // tipo_operacion
      idUsuario, // id_registro
      `Se registró el usuario con correo ${correo}`,
      idUsuario  // usuario_id
    );

    res.status(201).json({ mensaje: "Administrador registrado correctamente" });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

// 4️⃣ Login normal
const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM Usuario WHERE correo = ?", [correo]);
    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const validPass = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!validPass) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    if (!usuario.verificado) {
      return res.status(403).json({ error: "Tu correo no ha sido verificado" });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        es_admin: usuario.es_admin,
        nombre_completo: usuario.nombre_completo,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        es_admin: usuario.es_admin,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

module.exports = {
  register,
  reenviarCodigo,
  verificarCorreo,
  login,
};
