// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const empleadoRoutes = require('./routes/employeeRoutes'); // ← NUEVO
const supplierRoutes = require('./routes/SupplierRoutes'); 
const categorieRouter = require('./routes/categoriesRoutes')
const productoRoutes = require('./routes/productoRoutes');
const entradaRoutes = require('./routes/entradaRoutes'); // ← NUEVO
const deudasRoutes = require('./routes/deudasRoutes');



const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API funcionando');
});
// Rutas

app.use('/api/auth', authRoutes);
app.use('/api/employees', empleadoRoutes);
app.use('/api', supplierRoutes);
app.use('/api/categorias', categorieRouter);
app.use('/api/productos', productoRoutes);
app.use('/api/entrada-producto', entradaRoutes);
app.use('/api/deudas', deudasRoutes);




module.exports = app;
