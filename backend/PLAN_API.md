# PLAN D'IMPLEMENTATION

## Objectif

Remplacer les mocks du frontend React par une API REST Express TypeScript fonctionnelle, securisee et compatible avec les formats deja utilises par l'interface.

## Architecture

```text
server/
  prisma/schema.prisma
  src/
    config/env.ts
    controllers/
    middlewares/
    routes/
    services/
    utils/
    validation/
    index.ts
    seed.ts
```

## Strategie de compatibilite frontend

Le backend conserve des enums Prisma stables (`ADMIN`, `LEAD`, `DEV`, `EN_COURS`, etc.) mais expose au frontend les valeurs deja attendues :

- roles : `admin`, `lead`, `dev`
- projets : `active`, `on_hold`, `completed`
- taches : `To Do`, `In Progress`, `Blocked`, `Done`
- assignation : `assignedToUserId`

## Endpoints

### Auth

- `POST /api/auth/login` : public, retourne `{ user, token }`, pose un cookie `httpOnly`.
- `POST /api/auth/logout` : connecte, efface le cookie.
- `GET /api/auth/me` : connecte, retourne l'utilisateur courant.
- `POST /api/auth/register` : admin, cree un utilisateur.

### Projects

- `GET /api/projects` : admin tous les projets, lead/dev projets de leur equipe.
- `GET /api/projects/:id` : admin ou membre de l'equipe.
- `POST /api/projects` : admin.
- `PUT /api/projects/:id` : admin.
- `DELETE /api/projects/:id` : admin, supprime les taches liees.
- `GET /api/projects/:id/tasks` : admin/lead autorises, dev uniquement ses taches assignees.

### Tasks

- `GET /api/tasks` : admin tous, lead equipe, dev assignees.
- `GET /api/tasks/:id` : selon acces RBAC.
- `POST /api/tasks` : admin/lead.
- `PUT /api/tasks/:id` : admin/lead.
- `PATCH /api/tasks/:id/status` : admin/lead ou dev assigne.
- `DELETE /api/tasks/:id` : admin/lead.

### Teams

- `GET /api/teams` : admin tous, lead/dev leur equipe.
- `GET /api/teams/:id` : admin ou membre de l'equipe.
- `POST /api/teams` : admin.
- `PUT /api/teams/:id` : admin.
- `DELETE /api/teams/:id` : admin.
- `GET /api/teams/:id/members` : admin ou membre de l'equipe.
- `POST /api/teams/:id/members` : admin.
- `DELETE /api/teams/:id/members/:userId` : admin.

### Users

- `GET /api/users` : admin.
- `GET /api/users/:id` : admin.
- `POST /api/users` : admin.
- `PUT /api/users/:id` : admin.
- `DELETE /api/users/:id` : admin.

## Securite

- JWT signe, expiration 7 jours.
- Cookie `httpOnly`, `sameSite=strict`, `secure` en production.
- Support `Authorization: Bearer`.
- `helmet`.
- CORS limite a `FRONTEND_URL`.
- Rate limit global : 100 requetes/min.
- Rate limit login : 5 tentatives/min.
- Validation Zod.
- Hash bcrypt.
- Gestion d'erreurs centralisee.

## Tests et verification

Verification prevue :

- `npm install` dans `server/`.
- `npx prisma generate`.
- `npx prisma migrate dev`.
- `npm run seed`.
- `npm run build`.
- lancement API + frontend.
