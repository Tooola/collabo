# INSTRUCTIONS POUR L'AGENT IA – API NODE.JS (EXPRESS) COMPLÈTE

## Contexte
Frontend React existant (généré par Lovable) utilisant actuellement des mocks. Objectif : créer une API REST Express robuste, sécurisée, avec gestion des rôles (admin, lead, dev), pour remplacer les mocks.

Tu dois **d’abord** me fournir un plan d’implémentation détaillé, puis réaliser le code backend complet.

## Objectifs
- API REST avec Node.js + Express (TypeScript)
- Authentification JWT stocké dans cookie HTTP-only (ou en header Bearer)
- Gestion des entités : Utilisateurs, Équipes, Projets, Tâches
- CRUD complet avec validation, relations (SQL : PostgreSQL ou MySQL)
- Middleware de rôle (RBAC)
- Sécurité : rate limiting, CORS, helmet, validation des entrées, protection XSS, cookies sécurisés

## Périmètre

### Étape 1 – Plan d’implémentation (à fournir en premier)
Document structuré contenant :
1. Arborescence du projet (src/ : controllers, services, routes, middlewares, models, types, utils, config)
2. Liste des endpoints : méthode, URL, rôle requis, description, corps de requête/réponse
3. Schéma de base de données (tables et relations) – utiliser Prisma ou TypeORM (à préciser)
4. Stratégie d’authentification : JWT signé, stocké dans cookie httpOnly (ou option Bearer). Endpoints /login, /logout, /me.
5. Gestion des erreurs centralisée, codes HTTP
6. Sécurité détaillée : rate limiting (express-rate-limit), CORS (origines autorisées), helmet, cookie-parser avec options Secure/HttpOnly/SameSite, validation (zod ou Joi)
7. Tests : unitaires (Jest) et intégration (Supertest)

### Étape 2 – Réalisation du code (après validation)
Tu généreras l’intégralité du projet Node.js/Express avec :
- Tous les fichiers de code nécessaires
- Instructions d’installation (npm, env, migration de base de données)
- Fichier de collection Postman ou documentation OpenAPI

## Spécifications fonctionnelles (rappel)

### Entités
- **User** : id, name, email, password (hashé), role (admin, lead, dev), teamId (null possible), createdAt, updatedAt
- **Team** : id, name, description, createdAt
- **Project** : id, name, description, status (en_cours/termine/suspendu), teamId, createdAt
- **Task** : id, title, description, projectId, assignedTo (userId), dueDate (ISO), status (a_faire/en_cours/bloque/termine), createdAt

### Relations
- Un User appartient à une Team (optionnel, nullable)
- Une Team a plusieurs Users
- Un Project appartient à une Team
- Un Project a plusieurs Tasks
- Une Task est assignée à un User

### Rôles et permissions (implémenter dans middlewares)
- **Admin** : tous droits (CRUD users, teams, projects, tasks)
- **Lead** : CRUD sur les tasks des projets de sa team ; lecture des projets de sa team ; lecture des membres de sa team
- **Dev** : lecture des projets de sa team ; peut voir et modifier le statut de ses propres tasks uniquement (changer status)

## Exigences techniques sécuritaires

### Authentification
- Endpoint POST /api/auth/login → vérifie email/password, génère JWT (exp: 7j), le place dans un cookie httpOnly (Secure en prod, SameSite=Strict). Renvoie l'utilisateur (sans password).
- POST /api/auth/logout → efface le cookie.
- GET /api/auth/me → renvoie l'utilisateur courant via token du cookie.
- Middleware `authenticate` : extrait JWT du cookie ou header Authorization, attache `req.user`.

### Rate Limiting
- Limiteur global : 100 requêtes par minute.
- Limiteur spécifique pour login : 5 tentatives par minute.
- Utiliser `express-rate-limit`.

### CORS
- Autoriser uniquement l’origine du frontend (ex: http://localhost:5173).
- Autoriser les méthodes usuelles + OPTIONS.
- Autoriser les en-têtes : Content-Type, Authorization.
- Exposer les en-têtes nécessaires.
- Support credentials: true (car cookie).

### Sécurité additionnelle
- Helmet.js pour sécuriser les headers HTTP.
- Validation des entrées avec Zod (schémas par entité/rôle).
- Hashage bcrypt pour mots de passe.
- Protection contre les attaques par injection SQL via ORM (Prisma recommandé).
- Logging des actions importantes (winston ou morgan).
- Gestion des erreurs asynchrones avec wrapper ou express-async-errors.
- Variables d’environnement avec dotenv.

## Livrables attendus

1. **Plan d’implémentation** (`PLAN_API.md`)
2. **Code source complet** (tous les fichiers avec leur chemin)
3. **Instructions d’installation** (`README.md`)
4. **Documentation OpenAPI** (`openapi.yaml`)

## Contraintes
- Utiliser TypeScript, ts-node-dev pour le développement.
- Base de données : PostgreSQL (recommandé) ou MySQL, avec Prisma ORM.
- Fournir un script de seed pour créer un admin (email: admin@test.com, password: password) et des données de démo.
- Respecter les principes REST (noms de ressources au pluriel, codes HTTP corrects).

## Format de réponse de l’agent
- Commence par **"PLAN D'IMPLEMENTATION"** puis le plan.
- Attends ma validation avant de coder.
- Pour chaque fichier, indiquer le chemin relatif (`src/controllers/authController.ts` etc.)
