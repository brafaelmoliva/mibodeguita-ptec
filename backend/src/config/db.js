const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'mibodeguita',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
   typeCast: function (field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return field.string() === '1'; // devuelve booleano
    }
    return next();
  }
});

module.exports = db;
