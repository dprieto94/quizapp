# QuizApp

Plataforma personal de exámenes tipo test para preparar un máster.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- Hosting: Vercel

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

3. Copia `.env.example` a `.env.local` y rellena los valores.

4. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000).

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run start` | Arranca el build de producción |
| `npm run lint` | Ejecuta ESLint |

## Despliegue

Push a `main` → deploy automático en Vercel.

## Estructura

El código vive bajo `src/` siguiendo las convenciones del App Router de Next.js:

| Ruta | Descripción |
| --- | --- |
| `src/app/(auth)/login` | Pantalla de login |
| `src/app/(app)` | Rutas protegidas (home, asignaturas, test, histórico, configuración, admin) |
| `src/app/api/auth` | Endpoints de login/logout |
| `src/proxy.ts` | Protección de rutas (Next.js 16 — antes `middleware.ts`) |
| `src/components/ui` | Primitivos de UI reutilizables |
| `src/components/test` | Componentes específicos del flujo de test |
| `src/lib` | Cliente Supabase, auth, queries, scoring |
| `src/types` | Tipos compartidos |
