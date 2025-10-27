-- Botica DB for XAMPP (MySQL/MariaDB)
-- Import this file in phpMyAdmin (Import tab). It creates schema + seed + admin user.

CREATE DATABASE IF NOT EXISTS botica_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE botica_db;

-- Tables
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  username VARCHAR(60) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  rol ENUM('admin','empleado') NOT NULL DEFAULT 'empleado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150),
  descripcion VARCHAR(255),
  precio DECIMAL(10,2),
  stock INT,
  categoria VARCHAR(100),
  fecha_vencimiento DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME,
  total DECIMAL(10,2),
  id_usuario INT,
  dni VARCHAR(8),
  nombre_cliente VARCHAR(150),
  telefono VARCHAR(20),
  email VARCHAR(120),
  CONSTRAINT fk_ventas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detalle_venta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT,
  id_producto INT,
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  CONSTRAINT fk_det_venta FOREIGN KEY (id_venta) REFERENCES ventas(id),
  CONSTRAINT fk_det_producto FOREIGN KEY (id_producto) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed admin (username: admin / email: admin@demo.com / password: admin123)
INSERT INTO usuarios (nombre, username, email, password_hash, rol)
VALUES ('Administrador', 'admin', 'admin@demo.com', '$2b$10$2v139XvTvlNrVAWT9XQ.6.ClcG5.crqkJcf6LCk9eBrDbv3BLEabq', 'admin')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Seed products
INSERT INTO productos (nombre, descripcion, precio, stock, categoria, fecha_vencimiento) VALUES
('Paracetamol 500mg', 'Analgesico', 1.80, 50, 'Analgesico', DATE_ADD(CURDATE(), INTERVAL 180 DAY)),
('Ibuprofeno 400mg', 'Antiinflamatorio', 2.50, 35, 'Antiinflamatorio', DATE_ADD(CURDATE(), INTERVAL 365 DAY)),
('Amoxicilina 500mg', 'Antibiotico', 3.20, 12, 'Antibiotico', DATE_ADD(CURDATE(), INTERVAL 120 DAY)),
('Omeprazol 20mg', 'Gastritis', 1.50, 8, 'Gastro', DATE_ADD(CURDATE(), INTERVAL 200 DAY)),
('Loratadina 10mg', 'Antihistaminico', 1.20, 60, 'Alergia', DATE_ADD(CURDATE(), INTERVAL 400 DAY));