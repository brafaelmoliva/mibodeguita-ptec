require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const empleadoRoutes = require('./routes/employeeRoutes');
const supplierRoutes = require('./routes/SupplierRoutes'); 

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Ruta raíz para probar conexión
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/employees', empleadoRoutes);
app.use('/api', supplierRoutes);

module.exports = app;
