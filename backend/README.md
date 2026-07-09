# PM Dashboard API

API REST Express + TypeScript + Prisma pour le frontend React du projet.

## Installation

```bash
cd server
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Le serveur demarre par defaut sur `http://localhost:3001`.

## Variables d'environnement

Voir `.env.example`.

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change-me-in-production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pm_dashboard?schema=public
```

## Comptes de demo

Tous les comptes seedes utilisent le mot de passe `password`.

- `admin@test.com`
- `lead@test.com`
- `dev@test.com`
- `emma@test.com`

## Scripts

```bash
npm run dev
npm run build
npm start
npm run seed
```

## Frontend

Le frontend utilise `VITE_API_URL` si disponible, sinon `http://localhost:3001/api`.

```bash
npm run dev
```

## Documentation API

Voir `openapi.yaml`.
