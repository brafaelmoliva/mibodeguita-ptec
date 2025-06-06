// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const empleadoRoutes = require('./routes/employeeRoutes'); // ← NUEVO
const supplierRoutes = require('./routes/SupplierRoutes'); 
const inputProductsRouter = require('./routes/inputProductRoutes');
const productRouter = require('./routes/productRoutes')
const categorieRouter = require('./routes/categoriesRoutes')

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
app.use('/api/ingresos', inputProductsRouter);
app.use('/api/productos', productRouter);
app.use('/api/categorias', categorieRouter);

module.exports = app;
