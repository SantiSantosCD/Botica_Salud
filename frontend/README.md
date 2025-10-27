# Botica – Frontend (React + Vite)

Frontend listo para conectar con el backend de **Inventario & Ventas**.

## 🚀 Arranque rápido

1) **Descomprime** este proyecto.
2) Copia `.env.sample` a `.env` y ajusta `VITE_API_URL` si tu backend no está en `http://127.0.0.1:8080/api`.
3) Instala dependencias y arranca:

```bash
npm i
npm run dev
```

Abre `http://localhost:5173`

## 🔌 Endpoints esperados

- **Auth**: `POST /auth/login` (devuelve `{ token }` o `{ accessToken }`), `GET /auth/profile`
- **Productos**: `GET /productos`, `POST /productos`, `PUT /productos/:id`, `DELETE /productos/:id`
- **Clientes**: `GET /clientes`, `POST /clientes`, `PUT /clientes/:id`
- **Ventas**: `POST /ventas`
- **Dashboard**: `GET /dashboard/metricas`

> Si tu backend tiene el prefijo `/api`, mantén `VITE_API_URL=http://HOST:PUERTO/api` en el `.env`.

## 🧭 Rutas principales

- `/login`
- `/dashboard`
- `/productos`
- `/ventas`
- `/clientes`

## 🛡️ Autenticación

- Se guarda `token` en `localStorage`.
- Los 401 fuerzan redirección a `/login`.
- `Authorization: Bearer <token>` se adjunta automáticamente.

## 🧱 Estructura

- `src/context/AuthContext.jsx`: sesión (login/logout).
- `src/services/api.js`: cliente Axios con interceptores.
- `src/pages/*`: páginas funcionales.
- `src/components/*`: Navbar, Sidebar.
- `src/styles.css`: estilos base (dark moderno).

## 🧪 Notas

- El dashboard admite distintas claves del backend (p.ej. `ventasHoy` o `ventas_hoy`). Ajusta si tu API usa otras.
- Si tu backend expone `/api`, no dupliques el prefijo en rutas de `api.js`.
