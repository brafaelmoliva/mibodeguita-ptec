-- Usamos la base de datos
DROP DATABASE IF EXISTS mibodeguita;

CREATE DATABASE IF NOT EXISTS mibodeguita;
USE mibodeguita;

-- Tabla de categorías
CREATE TABLE Categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre_categoria VARCHAR(100),
  descripcion_categoria VARCHAR(200),
  estado BIT DEFAULT 1
);

-- Tabla de proveedores
CREATE TABLE Proveedor (
  id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
  ruc VARCHAR(11) NOT NULL UNIQUE,
  nombre_razon_social VARCHAR(150),
  direccion VARCHAR(255),
  direccion_completa VARCHAR(255),
  estado_sunat VARCHAR(20),         -- ej: ACTIVO
  condicion_sunat VARCHAR(20),      -- ej: HABIDO
  departamento VARCHAR(50),
  provincia VARCHAR(50),
  distrito VARCHAR(50),
  ubigeo_sunat VARCHAR(6),
  estado_negocio BIT DEFAULT 1      -- tu propio control interno (activo/inactivo)
);


-- Tabla de usuarios
CREATE TABLE Usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(100),
  correo VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  es_admin BOOLEAN DEFAULT FALSE,
  puede_eliminar BOOLEAN DEFAULT FALSE,
  estado BIT DEFAULT 1
);


-- En esta tabla se ingresaran datos del formulario productos, es solo un catalogo, 
-- se registran productos antes de que hayan entrado al inventario {tabla Entrada producto},
-- entidades como stock deberian dejarse en 0 ya que se actualizara cuando un paquete
-- entre al negocio. precio_ venta y costo_compra tambien podrian dejarse vacios ya que
-- tomaran valores de EntradaProducto cuando hayan entradas. La entidad precio ha quedado
-- OBSOLETA y puede borrarse si no da errores.

-- Tabla de productos
CREATE TABLE Producto (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_proveedor INT,
  id_categoria INT,
  nombre_producto VARCHAR(100),
  descripcion_producto VARCHAR(100),
  unidad_medida ENUM('unidad', 'kg', 'litro') DEFAULT 'unidad',
  stock DECIMAL(10,2),
  stock_min DECIMAL(10,2),
  precio DOUBLE,
  costo_compra DOUBLE,
  precio_venta DOUBLE,
  created_by INT,
  updated_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  estado BIT DEFAULT 1,
  FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria),
  FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor),
  FOREIGN KEY (created_by) REFERENCES Usuario(id_usuario),
  FOREIGN KEY (updated_by) REFERENCES Usuario(id_usuario)
);

-- Tabla de auditoría
CREATE TABLE Auditoria (
  id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
  tabla_afectada VARCHAR(100),
  tipo_operacion ENUM('INSERT', 'UPDATE', 'DELETE'),
  id_registro INT,
  descripcion TEXT,
  usuario_id INT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES Usuario(id_usuario)
);



-- La tabla EntradaProducto pasara datos como Costo_unitario_calculado a costo_compra
-- de la tabla Productos, al igual que precio_venta_sugerido sera pasado a precio_venta de
-- la tabla productos

-- Tabla de historial de entradas de productos (incluye estado de pago)
CREATE TABLE EntradaProducto (
  id_entrada INT AUTO_INCREMENT PRIMARY KEY,
  numero_factura VARCHAR(50) NOT NULL, -- Campo extra para número de factura
   ruc_emisor VARCHAR(11),
  fecha_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
  esta_cancelado BOOLEAN DEFAULT TRUE,
  monto_pagado DECIMAL(10,2) DEFAULT 0 NOT NULL,
  monto_pendiente DECIMAL(10,2) DEFAULT 0 NOT NULL,
  fecha_cancelacion DATETIME NULL,
  fecha_pago DATETIME NULL,
  usuario_id INT NOT NULL,
  observaciones VARCHAR(255) NULL,
  
  FOREIGN KEY (usuario_id) REFERENCES Usuario(id_usuario)
);


CREATE TABLE DetalleEntradaProducto (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_entrada INT NOT NULL,
  id_producto INT NOT NULL,
  tipo_entrada ENUM('unidad', 'kg', 'litro') DEFAULT 'unidad',
  cantidad_total DECIMAL(10,2) NOT NULL,
  cantidad_paquetes INT NULL,
  productos_por_paquete INT NULL,
  precio_por_paquete DOUBLE NULL,
  monto_total DECIMAL(10,2) NOT NULL,
  costo_unitario_calculado DOUBLE NOT NULL,
  precio_venta_sugerido DOUBLE NOT NULL,

  FOREIGN KEY (id_entrada) REFERENCES EntradaProducto(id_entrada) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);



-- ESTA VISTA ES PARA MOSTRAR LAS DEUDAS PENDIENTES


CREATE OR REPLACE VIEW VistaDeudas AS
SELECT 
  ep.id_entrada,
  p.nombre_producto,
  ep.ruc_emisor AS ruc_proveedor,
ep.numero_factura,              -- Agregado aquí

  SUM(dep.monto_total) AS monto_total,       -- Sumamos monto_total de los detalles
  ep.monto_pagado,
  ep.monto_pendiente,
  ep.esta_cancelado,
  ep.fecha_cancelacion,
  ep.fecha_pago
FROM EntradaProducto ep
JOIN DetalleEntradaProducto dep ON ep.id_entrada = dep.id_entrada
JOIN Producto p ON dep.id_producto = p.id_producto
GROUP BY
  ep.id_entrada,
  p.nombre_producto,
  ep.ruc_emisor,
  ep.monto_pagado,
  ep.monto_pendiente,
  ep.esta_cancelado,
  ep.fecha_cancelacion,
  ep.fecha_pago;

