const bcrypt = require('bcrypt');
const db = require('../config/db');

const crearEmpleado = async (req, res) => {
  const { nombre_completo, correo, contraseña, es_admin, puede_eliminar, estado } = req.body;

  if (!nombre_completo || !correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

    const [result] = await db.query(
      `INSERT INTO Usuario (nombre_completo, correo, contraseña, es_admin, puede_eliminar, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_completo, correo, contraseñaHasheada, es_admin, puede_eliminar, estado]
    );

    const nuevoUsuarioId = result.insertId;

    // Asegúrate de que el middleware authAdmin esté funcionando y añade req.user
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
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar empleado' });
  }
};

module.exports = { crearEmpleado };
