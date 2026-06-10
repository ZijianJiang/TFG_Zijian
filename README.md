# TFG_Zijian

## Deploy

La forma más simple de publicarlo es como un solo servicio Node que sirva el frontend y el backend desde la misma URL.

1. Crea un servicio web en Render usando el archivo [render.yaml](render.yaml).
2. Configura estas variables de entorno: `OPENAI_API_KEY` y `JWT_SECRET`.
3. Si usas un dominio personalizado o frontend separado, añade `FRONTEND_URL` con la URL pública.
4. La base de datos SQLite usa `/tmp/content.db` en producción si no defines `DATABASE_PATH`.

Comandos locales:

```bash
cd backend
npm install
npm start
```

