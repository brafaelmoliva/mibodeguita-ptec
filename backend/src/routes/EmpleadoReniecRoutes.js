const express = require('express');
const axios = require('axios');
const router = express.Router();

// Ruta GET para consultar nombre completo por DNI (RENIEC)
router.get('/empleados/dni/:dni', async (req, res) => {
  const { dni } = req.params;
  const API_KEY = process.env.APIPERU_DNI_KEY;

  if (!dni || dni.length !== 8 || isNaN(dni)) {
    return res.status(400).json({ error: 'DNI inválido. Debe tener 8 dígitos numéricos.' });
  }

  try {
    const response = await axios.get(`https://apiperu.dev/api/dni/${dni}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });

    if (!response.data.success) {
      return res.status(404).json({ error: 'DNI no encontrado en RENIEC' });
    }

    const data = response.data.data;
    const nombre_completo = `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`;

    res.json({ dni: data.numero, nombre_completo });
  } catch (error) {
    console.error('Error al consultar RENIEC:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al consultar el servicio RENIEC' });
  }
});

module.exports = router;
