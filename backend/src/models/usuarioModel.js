// src/models/usuarioModel.js
const db = require('../config/db');

const crearUsuarioAdmin = async (usuario) => {
  const { nombre_completo, correo, contraseña } = usuario;

  const [result] = await db.query(
    `INSERT INTO Usuario (nombre_completo, correo, contraseña, es_admin)
     VALUES (?, ?, ?, true)`,
    [nombre_completo, correo, contraseña]
  );

  return result.insertId;
};

const obtenerUsuarioPorCorreo = async (correo) => {
  const [rows] = await db.query(
    `SELECT * FROM Usuario WHERE correo = ?`,
    [correo]
  );
  return rows[0]; // Devuelve usuario (admin o no) o undefined si no existe
};

module.exports = {
  crearUsuarioAdmin,
  obtenerUsuarioPorCorreo,
};
