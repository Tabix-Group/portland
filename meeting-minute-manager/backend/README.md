# meeting-minute-manager Backend

Este proyecto es el backend para meeting-minute-manager, construido con Node.js, Express y Prisma ORM, conectado a PostgreSQL.

## Endpoints disponibles
- `/users` CRUD de usuarios
- `/projects` CRUD de proyectos
- `/minutes` CRUD de items de minuta
- `/tasks` CRUD de tareas
- `/attachments` CRUD de archivos adjuntos
- `/tags` CRUD de etiquetas

## Configuración
1. Configura la variable `DATABASE_URL` en `.env` con tu cadena de conexión de Railway.
2. Ejecuta las migraciones de Prisma:
   ```
   npx prisma migrate dev --name init
   ```
3. Inicia el servidor:
   ```
   node src/app.js
   ```

## Uso
Consume los endpoints desde tu frontend para persistencia real en PostgreSQL.
