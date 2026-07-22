# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Tijera Brava is a home-service barbershop booking platform ("barbería masculina a domicilio"). Monorepo with two independent apps:

- `backend/`: Express + TypeScript API, Prisma ORM over PostgreSQL, Supabase Storage for images.
- `frontend/`: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS.

All domain code — variable names, DB columns, routes, messages, error text — is in **Spanish**. Keep new code consistent with this (e.g. `crearReserva`, `idUsuario`, `"Autenticación requerida"`).

## Commands

Run from within `backend/` or `frontend/` respectively — there is no root package.json/workspace tooling.

Backend:
```bash
npm install
npm run dev              # tsx watch src/server.ts — dev server on :5050
npm run build             # tsc -> dist/
npm start                 # node dist/server.js
npm run prisma:generate   # regenerate Prisma client after schema.prisma changes
npm run prisma:migrate    # create/apply a dev migration
npm run prisma:studio     # Prisma Studio GUI
npm run prisma:seed       # tsx prisma/seed.ts
```

Frontend:
```bash
npm install
npm run dev     # next dev -p 3000
npm run build
npm start        # next start -p 3000
```

There are no lint, typecheck, or test scripts configured in either package — do not assume `npm test`/`npm run lint` exist. Verify TypeScript correctness via `npm run build` (`tsc` for backend, `next build` for frontend) when checking your own work.

Environment setup (see `backend/.env.example`, `frontend/.env.example`):
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Backend requires `DATABASE_URL` (Postgres), `JWT_SECRET`, and Supabase credentials (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) plus per-bucket names for `perfiles`/`portafolios`/`lookia` uploads. Frontend requires `NEXT_PUBLIC_API_URL`.

## Architecture

### Backend layering

Every feature follows the same strict pipeline, and files are named after the feature in kebab-case (e.g. `reservas`, `zonas-cobertura`):

```
routes/*.routes.ts → middlewares (auth/roles/validation) → controllers/*.controller.ts → services/*.service.ts → repositories/*.repository.ts → Prisma
```

- **Routes** (`src/routes/`) wire an Express `Router`, always start with `router.use(autenticarUsuario)` when the whole resource requires auth, then per-route `autorizarRoles(...roles)` and `validarSolicitud`/`validarConsulta`/`validarParametros` (Zod schemas from `src/validators/`) before the controller.
- **Controllers** (`src/controllers/`) are thin `RequestHandler`s: pull data from `req`, call one service method, `try/catch` → `next(error)`, and respond with the uniform envelope `{ exito, mensaje, datos? }` (list endpoints spread pagination fields instead of `datos`).
- **Services** (`src/services/`) hold business logic and authorization checks (e.g. verifying the acting user owns the resource) and throw `ErrorAplicacion(message, statusCode, errores?)` (`src/errors/error-aplicacion.ts`) for any domain-level failure. `src/middlewares/error-handler.ts` is the single place that turns `ErrorAplicacion` into the JSON error response; anything else becomes a generic 500.
- **Repositories** (`src/repositories/`) are the only layer that talks to Prisma (`src/config/prisma.ts`).
- **Validators** (`src/validators/`) are Zod schemas per feature; `src/validators/comun.validator.ts` holds shared pieces like `uuidParam`.

New features should add one file per layer following this naming convention and register the router in `src/app.ts`.

Auth: JWT stored in an httpOnly cookie (`obtenerCookieSesion`/`verificarTokenSesion` in `src/utils/jwt.ts`), read by `autenticarUsuario` middleware which populates `req.usuario = { idUsuario, rol }` (see `src/types/express.d.ts` for the Express `Request` augmentation). Role checks are done with `autorizarRoles("CLIENTE" | "BARBERO" | "ADMINISTRADOR")`.

File uploads: `multer` middlewares in `src/middlewares/subida-*.middleware.ts` parse the upload, then `src/services/storage.service.ts` (`subirImagenASupabaseStorage`) pushes the buffer to the appropriate Supabase Storage bucket and returns a public URL. There's also a local `uploads/` directory (served statically at `/uploads`) used as a fallback/legacy path — check which one a given feature actually uses before changing upload logic.

### Data model (Prisma)

`backend/prisma/schema.prisma` is the source of truth. Key shape:
- `Usuario` (1 per person) has a role (`Rol`) and optionally a `Cliente` or `Barbero` profile (1:1).
- `Barbero` has an `EstadoAprobacion` (admin approval workflow), services (`ServicioBarbero`), specialties, coverage zones (`ZonaBarbero`), weekly schedule (`HorarioDisponibilidad`) and time-off blocks (`BloqueoHorario`), portfolio images (`PortafolioCorte`), and ratings (`Calificacion`).
- `Reserva` (booking) is the central transactional entity: links cliente/barbero/servicio/zona, has an `EstadoReserva` state machine (`PENDIENTE → CONFIRMADA → EN_CAMINO → EN_SERVICIO → FINALIZADA`, plus rejection/cancellation variants), and every transition is appended to `HistorialEstadoReserva`. Each `Reserva` has one `Pago` (own `EstadoPago` state machine + its own `HistorialEstadoPago`) and optionally one `Calificacion`.
- "LookIA" (`EstiloLookIA`, `SimulacionLookIA`) is an AI hairstyle-preview feature independent of bookings.
- `Notificacion` is a simple per-user in-app notification log (`TipoNotificacion` enum covers all system events).
- All models use `@map`/`@@map` to snake_case Postgres columns/tables while keeping camelCase in Prisma/TS; ids are UUIDs (except `Rol.idRol`, an autoincrement int).

When adding fields/models, update `schema.prisma` and run `prisma:migrate`, then `prisma:generate`.

### Frontend structure

- App Router pages under `app/` are split by role area: `app/cliente/**`, `app/barbero/**`, `app/administrador/**`, plus public `app/login`, `app/registro*`. Each role's pages are gated client-side with `components/auth/ProtectedRoute.tsx`, which calls `obtenerSesionActual()` and redirects to `/login` (no session) or the correct role's home via `rutaPorRol` (wrong role).
- `components/` mirrors the same role split (`administrador/`, `barbero/`, `cliente/`, `auth/`, `layout/`, `landing/`, plus a shared `ui/` kit — Button, Card, Badge, Input, Loading, MetricCard, etc.).
- `lib/` holds one `*-api.ts` file per backend resource (e.g. `barbero-reservas-api.ts`, `admin-catalogos-api.ts`, `cliente-api.ts`), all built on `lib/api.ts`'s `apiFetch<T>()` helper. `apiFetch` always sends `credentials: "include"` (cookie-based auth) and unwraps the backend's `{ exito, mensaje, datos }` envelope, throwing `ApiError` (with `status`) on non-2xx responses. Use `resolverUrlArchivo()` from `lib/api.ts` to resolve relative `/uploads/...` URLs against the API origin.
- `lib/auth.ts` wraps the auth endpoints (`iniciarSesion`, `registrarCliente`, `registrarBarbero`, `obtenerSesionActual`, `cerrarSesion`) and defines `rutaPorRol`.
- `lib/types.ts` holds shared frontend types (`RolUsuario`, `UsuarioSesion`, `ApiResponse<T>`, etc.) — mirror backend response shapes here when adding a new resource.
- Local dev talks directly to the backend via `NEXT_PUBLIC_API_URL` (`http://localhost:5050/api`). In production, `next.config.ts` rewrites `/api/:path*` and `/uploads/:path*` to the deployed Render backend (`https://tijera-brava.onrender.com`) — this is a Vercel-proxy workaround for cookie/CORS behavior, not a general-purpose proxy; keep both the env var and the rewrite in mind when debugging connectivity issues in different environments.

### Cross-cutting conventions

- API responses are always the envelope `{ exito: boolean, mensaje: string, datos?: {...} }` (or spread fields for paginated lists) — match this shape for any new endpoint and any new frontend type.
- CORS in `backend/src/app.ts` explicitly allowlists `FRONTEND_URL` + localhost, plus any `*.vercel.app` HTTPS preview origin — update `esPreviewVercel`/`origenesPermitidos` if allowed origins change, not by disabling CORS checks.
- Error handling always flows through `ErrorAplicacion` → `next(error)` → `errorHandler`; don't send error responses directly from controllers/services.
