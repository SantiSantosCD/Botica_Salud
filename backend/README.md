# Botica – Backend MySQL (sin clientes, boletas)
- Guarda DNI y nombre en `ventas` y los productos en `detalle_venta`.
- Endpoints:
  - POST /api/ventas
  - GET  /api/ventas/:id
  - GET  /api/boletas
  - GET  /api/integraciones/dni?dni=########

## XAMPP
1) Crea `botica_db` (utf8mb4).
2) Importa `database/schema.sql` (o ejecuta la migración si vienes de una versión con clientes).
3) `.env` → completa API_PERU_TOKEN y credenciales MySQL.
4) `npm i` y `npm run dev`.
