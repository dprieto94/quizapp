# QuizApp

Plataforma personal de exámenes tipo test para preparar un máster universitario. Uso privado, multi-usuario aislado: cada cuenta tiene su propio histórico, estadísticas y configuración. Banco de preguntas compartido.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first con `@theme inline` en `globals.css`, sin `tailwind.config.ts`)
- **Supabase** (PostgreSQL) — schema y migraciones manuales en `db/`
- **recharts** para las gráficas de estadísticas
- **sonner** para toasts
- **bcryptjs** + **jose** (JWT HS256) para autenticación con cookie de sesión propia
- **zod** para validación de payloads
- **Vercel** como hosting (deploy automático en `main`)

> ⚠️ Next.js 16 renombra `middleware.ts` a `proxy.ts`. Tailwind v4 ya no usa `tailwind.config.ts`. Detalles en `AGENTS.md`.

## Requisitos previos

- Node.js 20.x (recomendado vía `nvm`)
- Cuenta en Supabase y Vercel
- Variables de entorno configuradas (ver `.env.example`)

## Setup local

1. Clona el repo:
   ```bash
   git clone git@github.com:TU_USUARIO/quizapp.git
   cd quizapp
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Copia `.env.example` a `.env.local` y rellena los valores de Supabase + `SESSION_SECRET`:
   ```bash
   openssl rand -base64 32   # genera SESSION_SECRET
   ```

4. Aplica el schema y las migraciones SQL en el SQL Editor de Supabase, en orden:
   - `db/01_schema.sql` — tablas base
   - `db/02_seed_config.sql` — fila de configuración global
   - `db/03_seed_asignaturas_temas.sql` — asignaturas + temas
   - `db/04_migracion_8_5.sql` — preguntas configurables, multi-tema, justificación + fuente
   - `db/10_migracion_multi_usuario.sql` — multi-usuario (`tests.user_id`, `config.user_id`)
   - `db/11_migracion_shuffle_seed.sql` — shuffle determinista de opciones por test
   - `db/13_migracion_examen_real.sql` — columna `examen_real` (marca preguntas de examen/ejemplo real)

5. Crea los usuarios necesarios:
   ```bash
   SEED_USER_PASSWORD=<tu-password> npm run seed:user <username>
   ```
   El script es idempotente — para resetear contraseña basta con relanzarlo con la nueva.

6. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```

7. Abre [http://localhost:3000](http://localhost:3000) y entra con un usuario creado.

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR (Turbopack) |
| `npm run build` | Build de producción |
| `npm run start` | Arranca el build de producción |
| `npm run lint` | ESLint |
| `npm run test:scoring` | Tests unitarios de la fórmula de nota y del shuffle (`scripts/test-scoring.ts`) |
| `npm run seed:user [username]` | Crea o resetea un usuario y su fila de `config`. Lee `SEED_USER_PASSWORD` del entorno |

## Despliegue

Push a `main` → deploy automático en Vercel.

Antes del primer deploy en producción:
1. Configurar las variables de entorno en Vercel (Production / Preview / Development).
2. Aplicar las migraciones SQL en orden contra la BBDD de producción.
3. Ejecutar `seed:user` para cada usuario que vaya a usar la app.

## Estructura del repositorio

```
src/
├── app/
│   ├── (auth)/login/                        Pantalla de login pública
│   ├── (app)/                               Rutas protegidas (proxy.ts redirige a /login si no hay sesión)
│   │   ├── page.tsx                         Home: lista de asignaturas con counts
│   │   ├── asignaturas/[id]/                Configurar test (modalidad, modo, temas)
│   │   ├── test/[id]/resultado/             Resultado de un test (hero + lista expandible)
│   │   ├── historico/                       Listado filtrable + estadísticas con gráficas
│   │   ├── configuracion/                   Editar penalización, timer y preguntas por test
│   │   └── admin/                           CRUD de preguntas (asignaturas y temas son read-only)
│   └── api/auth/                            Endpoints de login y logout
├── proxy.ts                                 Middleware de Next.js 16 — protección de rutas
├── components/
│   ├── ui/                                  Primitivos reutilizables (Button, Card, Modal, …)
│   ├── test/                                TestRunner, Timer, QuestionCard
│   ├── admin/                               AdminTab, ConfirmDeleteModal
│   ├── historico/                           Filtros, lista, gráficas (recharts)
│   └── Nav.tsx                              Navbar global con drawer móvil
├── lib/
│   ├── supabase.ts / supabase-client.ts     Clientes Server/Browser de Supabase
│   ├── auth.ts                              Hash de password, sesión JWT, cookies
│   ├── db.ts                                Capa de datos centralizada — todas las queries
│   ├── scoring.ts                           Fórmula de nota (función pura testeada)
│   ├── shuffle.ts                           Shuffle determinista de opciones por test
│   ├── cn.ts                                Util de clases (clsx + tailwind-merge)
│   └── validation/admin.ts                  Schemas zod
└── types/index.ts                           Tipos del dominio (Pregunta, Test, Config, …)

db/                                          Schema y migraciones SQL (commiteable)
scripts/                                     Tests de scoring + seed user
```
