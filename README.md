# Botica – Inventario & Ventas (Fullstack)

Aplicación web para gestionar **productos, ventas, clientes y usuarios** de una botica.
Stack: **Frontend** (React + Vite) · **Backend** (Node.js + Express) · **DB** (MySQL/MariaDB en XAMPP).

> Para detalles específicos, ver: [`/frontend/README.md`](./frontend/README.md) y [`/backend/README.md`](./backend/README.md).

---

## 🗂 Estructura

```.
├── backend/     # API REST (Express + MySQL)
├── frontend/    # SPA (React + Vite)
├── database/    # SQLs (opcional: schema/seed)
└── README.md    # este archivo
```

---

## ⚙️ Requisitos

* **XAMPP** (MySQL/MariaDB activo en `localhost:3306`)
* **Node.js 18+** y **npm**
* Navegador moderno

---

## 🚀 Puesta en marcha (rápida)

1. **Base de datos (XAMPP / phpMyAdmin)**

   * Crea la BD **`botica_db`** (utf8mb4) o importa el SQL provisto (si lo tienes en: `backend/database/botica_xampp_full.sql`).
   * Credenciales por defecto en XAMPP: `root` sin contraseña.

2. **Backend**

   ```bash
   cd backend
   npm i
   cp .env.sample .env     # Ajusta si cambiaste host/puerto/credenciales
   npm run dev             # http://127.0.0.1:8080
   ```

3. **Frontend**

   ```bash
   cd frontend
   npm i
   cp .env.sample .env
   # Asegúrate:
   # VITE_API_URL=http://127.0.0.1:8080/api
   npm run dev             # http://localhost:5173
   ```

4. **Login demo**

   * **usuario:** `admin`
   * **email:** `admin@demo.com`
   * **clave:** `admin123`

---

## 👤 Roles

* **administrador**: gestiona usuarios y CRUD completo de productos.
* **empleado**: puede registrar ventas y clientes.

> El backend valida `rol` (admin/empleado) y protege rutas sensibles.

---

## 🔌 Endpoints (resumen)

* `POST /api/auth/login` · `GET /api/auth/profile`
* `GET/POST/PUT/DELETE /api/productos` *(crear/editar/eliminar = admin)*
* `GET/POST/PUT /api/clientes`
* `POST /api/ventas` *(descuenta stock y registra detalle)*
* `GET /api/dashboard/metricas`

---

## 🧪 Prueba rápida (cURL)

```bash
curl -X POST http://127.0.0.1:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🛠️ Problemas comunes

* **401 Unauthorized al iniciar sesión**
  Revisa que importaste el SQL (existe usuario `admin`) y que el front apunte a
  `VITE_API_URL=http://127.0.0.1:8080/api`.
* **CORS o puerto**
  Asegúrate de tener el backend en **:8080** y frontend en **:5173** por defecto.

---

## 📄 Licencia

Uso educativo/estudiantil. Ajusta a tus necesidades.

---
