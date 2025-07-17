// src/middlewares/authAdmin.js
const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
  try {
    // Esperamos un token JWT en headers.authorization (por ejemplo: "Bearer token")
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado, token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No autorizado, token inválido' });
    }

    // Verificar token (usa la misma secret que usaste para firmar)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Decoded debe tener info del usuario, ej: { id_usuario, es_admin, ... }
    if (!decoded.es_admin) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }

    // Pasar info de usuario al request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = authAdmin;
