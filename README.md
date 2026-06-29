# Tijera Brava

Plataforma web de reservas de barbería masculina a domicilio.

## Estructura

- `frontend`: aplicación Next.js con App Router, TypeScript y Tailwind CSS.
- `backend`: API Node.js con Express y TypeScript.

## Variables de entorno

Copia los archivos de ejemplo antes de ejecutar cada proyecto:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

En Windows PowerShell:

```powershell
Copy-Item frontend/.env.example frontend/.env
Copy-Item backend/.env.example backend/.env
```

## Instalar dependencias

```bash
cd frontend
npm install
```

```bash
cd backend
npm install
```

## Ejecutar en desarrollo

Frontend:

```bash
cd frontend
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```

## Endpoints iniciales

- `GET http://localhost:5050/api/salud`
