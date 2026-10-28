# Ágora — Sistema de Gestión Académica

Aplicación web completa basada en la propuesta académica adjunta. Incluye portal para estudiantes, espacio docente y panel administrativo, con frontend React/Vite y API REST en Node.js conectada a MySQL.

## Funcionalidades

- Autenticación con JWT y permisos para administrador, profesor y estudiante.
- Gestión de usuarios, activación/desactivación y perfiles.
- Cursos, horarios, docentes, aulas, fechas, estados y control de cupo.
- Matrícula por estudiante o administrador, con validación transaccional de cupos.
- Registro de calificaciones por concepto y ponderación.
- Registro masivo de asistencia por sesión.
- Consulta estudiantil de notas, asistencia y horario.
- Indicadores y reportes institucionales.
- Constancias de estudio descargables en PDF.
- Alertas y confirmaciones con SweetAlert2.
- Interfaz responsiva construida con Tailwind CSS.
- Contraseñas con hash bcrypt, limitación de intentos de acceso y autorización por rol.
- Migraciones automáticas al iniciar la API.

## Estructura

```text
.
├── backend/                API REST, migraciones y acceso a MySQL
│   └── src/
│       ├── config/
│       ├── database/
│       │   └── migrations/
│       ├── middleware/
│       ├── routes/
│       └── utils/
├── frontend/               Aplicación React + Vite + Tailwind
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
```

## Configuración de MySQL

Configura las variables de entorno a partir de `backend/.env.example` y `frontend/.env.example`. Guarda los valores reales en archivos `.env` locales; estos archivos están excluidos de Git.

La API acepta una URL de conexión:

```env
MYSQL_URL=mysql://usuario:contraseña@host:puerto/base_de_datos
```

También acepta `DATABASE_URL` o las variables individuales `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL` y `DB_SSL_REJECT_UNAUTHORIZED`. En producción configura además:

```env
NODE_ENV=production
JWT_SECRET=una-clave-aleatoria-segura-de-al-menos-32-caracteres
FRONTEND_URL=https://dominio-del-frontend
SEED_DEMO=false
```

En desarrollo, la API permite orígenes locales de Vite (`localhost` o `127.0.0.1`) en cualquier puerto; en producción solo permite los orígenes indicados en `FRONTEND_URL`.

Para el frontend, `VITE_API_URL` debe apuntar a la API, por ejemplo `https://api.example.com/api`.

## Ejecución

Instala las dependencias con `npm run install:all`. Copia `backend/.env.example` a `backend/.env` y `frontend/.env.example` a `frontend/.env`, configura los valores locales y asegúrate de tener MySQL disponible. Los archivos `.env` reales no se suben a Git.

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000/api`
- Salud de API: `http://localhost:3000/api/health`

En cada arranque, el backend ejecuta todas las migraciones pendientes antes de aceptar solicitudes. También pueden ejecutarse manualmente con `npm run migrate --prefix backend`.

## Datos demostrativos

En desarrollo, `SEED_DEMO=true` crea datos únicamente cuando la tabla de usuarios está vacía:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@academia.test` | `Demo1234!` |
| Profesor | `profesor@academia.test` | `Demo1234!` |
| Estudiante | `estudiante@academia.test` | `Demo1234!` |

En producción los datos de demostración están deshabilitados por defecto.

No uses las credenciales de demostración en producción. No publiques archivos `.env`, claves privadas, copias de bases de datos ni datos reales de estudiantes.

## Verificación del código

```bash
npm run check --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
```
