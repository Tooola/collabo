# GestPro

**Plateforme de gestion de projet collaborative** — suivi de tâches, organisation en équipes et pilotage par l'analyse de données.

> Backend **Express / TypeScript / MongoDB** · Frontend **React / Vite / Tailwind**

---

## Sommaire

1. [Qu'est-ce que GestPro ?](#1-quest-ce-que-gestpro)
2. [Les trois rôles](#2-les-trois-rôles)
3. [Démarrage rapide](#3-démarrage-rapide)
4. [Comptes de démonstration](#4-comptes-de-démonstration)
5. [Parcours utilisateur — de la landing page au tableau de bord](#5-parcours-utilisateur)
6. [Règles d'accès](#6-règles-daccès)
7. [Architecture technique](#7-architecture-technique)
8. [L'analyse de données](#8-lanalyse-de-données)
9. [Déploiement](#9-déploiement)
10. [Limitations connues](#10-limitations-connues)
11. [Dépannage](#11-dépannage)

---

## 1. Qu'est-ce que GestPro ?

GestPro permet à une organisation de **suivre l'avancement de ses projets** en découpant le travail en une hiérarchie simple :

```
EPIC  ── regroupe ──▶  TÂCHE  ── se décompose en ──▶  SOUS-TÂCHE
```

Chaque tâche a un **statut**, une **échéance**, un **responsable** et un **projet** d'appartenance. Le travail est réparti en **équipes**, et chaque projet est rattaché à une équipe.

Ce que l'application offre concrètement :

- un **tableau Kanban** à 4 colonnes pour visualiser l'avancement ;
- une vue **épique** avec des couloirs (*swimlanes*) par épique, repliables ;
- des **règles d'accès par rôle** et une visibilité limitée à vos équipes ;
- un **import en masse** de hiérarchies depuis un fichier texte ou CSV ;
- un module d'**analyse de données** avec indicateurs, corrélations, prévisions et avis d'intelligence artificielle ;
- une interface **français / anglais** et un **mode sombre**.

---

## 2. Les trois rôles

| Rôle | Ce qu'il peut faire |
|---|---|
| **Administrateur** (`ADMIN`) | Vue complète sur l'espace de travail. Crée et supprime projets, équipes et utilisateurs, gère les membres. |
| **Chef d'équipe** (`LEAD`) | Voit les projets de **ses** équipes. Crée et modifie les tâches des projets qu'il encadre. |
| **Développeur** (`DEV`) | Voit **ses propres tâches**. Peut changer leur statut, rien d'autre. |

À cela s'ajoute un **rôle d'équipe** : un même utilisateur peut être *développeur* dans une équipe et *chef d'équipe* dans une autre. Un chef d'équipe global n'a pas besoin de ce rôle d'équipe pour agir.

---

## 3. Démarrage rapide

### Prérequis

- **Node.js** ≥ 18
- Une instance **MongoDB** (locale ou Atlas)

### 1. Installer les dépendances

```bash
cd backend  && npm install
cd ../frontend && npm install
```

### 2. Configurer le backend

Créez `backend/.env` (voir `backend/.env.example`) :

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/project-gest
JWT_SECRET=<une chaîne secrète longue et aléatoire>
FRONTEND_URL=http://localhost:5173
```

Variables optionnelles :

| Variable | Rôle | Défaut |
|---|---|---|
| `SEED_ON_BOOT` | Jeu de données de démonstration au démarrage | `true` |
| `SEED_PASSWORD` | Mot de passe des comptes de démo | `password` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Envoi réel des e-mails | — |
| `ANALYTICS_API_URL`, `ANALYTICS_API_KEY`, `ANALYTICS_APP_SLUG` | Service d'analyse externe | — |

> **Sans variables `SMTP_*`**, les e-mails ne sont pas envoyés : les **codes OTP et de réinitialisation sont imprimés dans la console du serveur**. C'est le comportement normal en développement.

### 3. Lancer

```bash
# Terminal 1 — API (port 3000)
cd backend && npm run dev

# Terminal 2 — interface (port 5173)
cd frontend && npm run dev
```

Le backend se connecte à MongoDB, insère le jeu de démonstration et affiche :

```
✅ Demo data seeded — workspace …
   teams     : 5
   users     : 19
   projects  : 12
   tasks     : 301

API running on http://localhost:3000
```

Ouvrez ensuite **http://localhost:5173**.

### Commandes utiles (backend)

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur en surveillance (`tsx watch`) |
| `npm run build` | Compilation TypeScript vers `dist/` |
| `npm start` | Exécution du code compilé |
| `npm run seed` | Insertion idempotente du jeu de démo |
| `npm run seed:reset` | **Vide l'espace de démonstration** (refusé en production) |
| `npm run seed:check` | Vérifie les invariants du jeu de données |

Le seed est **ajoutiste** : il ne réécrit jamais une donnée existante. Relancer le serveur ne casse donc rien.

---

## 4. Comptes de démonstration

Le seed crée **5 équipes**, **19 utilisateurs**, **12 projets** et **301 tâches** réparties sur environ 200 jours — dont 150 terminées et **33 en retard**, pour que les alertes soient visibles dès la première connexion.

| Identifiant | Rôle | Intérêt |
|---|---|---|
| `admin@test.com` | Administrateur | Vue complète, gestion des projets/équipes/utilisateurs |
| `lead@test.com` | Chef d'équipe | Encadre l'équipe *Frontend Team* |
| `dev@test.com` | Développeur | Volontairement **surchargé** (3,0) — sert à tester les alertes de charge |
| `fayomijesutola@gmail.com` | Administrateur (compte **protégé**) | Chef des 5 équipes ; non supprimable par le seed:reset |

Mot de passe commun : **`password`** (variable `SEED_PASSWORD`).

Les autres comptes suivent le schéma `lead.<équipe>@test.com` et `dev.<n>@test.com`.

---

## 5. Parcours utilisateur

### 5.1 La page d'accueil — `/`

Premier contact avec l'application, **accessible sans compte**.

| Section | Contenu |
|---|---|
| En-tête fixe | Logo **GestPro**, sélecteur de **langue** (globe), interrupteur de **thème** (soleil/lune), bouton *Se connecter* |
| Bandeau principal | Badge « La plateforme de gestion de projets », titre *Gérez vos projets avec GestPro*, boutons **Commencer** → `/register` et **Se connecter** → `/login` |
| Statistiques | 4 chiffres de communication (*10k+ projets*, *98 % satisfaction*…) |
| Rôles | 3 cartes présentant Administrateur, Chef d'équipe et Développeur |
| Atouts | 6 tuiles : déploiement, sécurité, analytics, multi-langue, historique, e-mails |
| Tarifs | 3 formules — **Gratuit 0 $**, **Pro 29 $/mois** (mise en avant), **Entreprise 99 $/mois** |
| Témoignages | 2 citations notées |
| FAQ | 4 questions en accordéon, dont l'explication du **code OTP** |
| Appel à l'action | Bandeau final *Prêt à booster votre équipe ?* |
| Pied de page | © 2026 GestPro |

> Les trois boutons de tarification renvoient tous vers `/register` : les formules sont **présentes à titre commercial**, il n'existe pas encore de paiement ni de limitation liée au plan choisi.

### 5.2 La connexion — `/login`

La connexion se fait en **trois étapes**.

**Étape 1 — Choisir son rôle.** Trois cartes : *Admin*, *Chef d'équipe*, *Développeur*. Ce choix doit correspondre au rôle enregistré pour votre compte, sinon la connexion est refusée avec « Accès refusé pour ce rôle ».

> Les e-mails d'invitation contiennent un lien direct du type `/login?role=admin`, qui saute cette étape.

**Étape 2 — Identifiants.** Adresse e-mail et mot de passe, avec un lien *Mot de passe oublié ?*.

> **Créer un compte** — bouton *Commencer* de la page d'accueil, ou lien *Vous avez déjà un compte ?* — ouvre `/register` : nom, e-mail, mot de passe (**8 caractères minimum**), puis connexion automatique suivie du même passage par le code OTP.
>
> ⚠️ L'inscription publique crée **toujours un compte administrateur** : le rôle y est codé en dur. Voir [Limitations connues](#10-limitations-connues).

**Étape 3 — Code à 6 chiffres.** L'application génère un code **valable 5 minutes**, vous l'envoie par e-mail et vous invite à le saisir. Ce n'est qu'après cette vérification que la session est ouverte.

> **Pas de boîte mail ?** Le code apparaît en clair dans la **console du backend**, sous la forme :
> `🔐 OTP pour admin@test.com : 123456`

**Récupération de mot de passe.** Un code à 6 chiffres **valable 15 minutes** est envoyé ; saisissez-le avec votre nouveau mot de passe.

> L'application répond toujours « succès » à une demande de réinitialisation, même pour une adresse inconnue — c'est volontaire, cela empêche de deviner quels comptes existent.

**Jeton.** La session dure **7 jours**. Le jeton est conservé à la fois dans `localStorage` et dans un *cookie* `httpOnly` (attribut `SameSite: strict`).

### 5.3 Le tableau de bord — `/dashboard`

Première page après connexion.

- **Bannière d'accueil** « Bon retour, {prénom} ».
- **Bannière d'alerte** listant le nombre de tâches **en retard**.
- **Bannière bleue « Prochainement »** : suggestions de charge et priorisation par IA — fonctionnalité annoncée, pas encore active.
- **Deux onglets** :

| Onglet | Contenu |
|---|---|
| **Vue Projets** | Une carte par projet : badge de statut, description, **barre de progression** avec pourcentage, et trois compteurs — total des tâches, terminées, **en retard** (en rouge). Chaque carte ouvre le projet. |
| **Vue Équipes** | Une carte par équipe avec ses membres. Chaque membre affiche ses compteurs *total / actif / terminé*. |

> Cette page sert de synthèse visuelle : elle ne contient pas de graphique, uniquement des cartes et des barres de progression.

### 5.4 Les projets — `/projects`

Tableau listant tous les projets visibles : nom et description, **équipe responsable**, badge de statut, **barre de progression**, compteurs de tâches (*terminées / total*, avec « (n) en retard » en rouge), date de création, et actions.

- **« Nouveau Projet »** — réservé à l'**administrateur**.
- Le formulaire demande un **nom**, une description, un **statut** et une **équipe**.
- La suppression demande confirmation et **supprime toutes les tâches du projet**.

Les statuts possibles sont :

| Affiché dans l'application | Valeur en base |
|---|---|
| `active` | `EN_COURS` |
| `on_hold` | `SUSPENDU` |
| `completed` | `TERMINE` |

### 5.5 Le détail d'un projet — `/projects/:id`

C'est le cœur de l'application.

**Haut de page** : nom, description, statut, date de création, boutons *Modifier* / *Supprimer* (administrateur uniquement), puis **4 cartes de statistiques** — Total, Terminées, En cours, Bloquées — et une **barre de progression globale**.

**Filtres** : `Tout` · `À faire` · `En cours` · `Bloqué` · `Terminé`.

**Actions** : *Import* et *Ajouter une tâche*. Ces boutons ne sont actifs que pour un **administrateur**, ou pour le **chef d'équipe de l'équipe propriétaire du projet**. Sinon ils sont désactivés avec le message « Action non autorisée. Veuillez informer votre Lead. »

**Le tableau** (`TaskBoard`) adopte deux formes :

- **Kanban simple**, si le projet ne contient pas de hiérarchie : 4 colonnes *À faire / En cours / Bloqué / Terminé* avec leur nombre.
- **Couloirs par épique**, dès qu'il existe des tâches racines : chaque épique devient une ligne repliable, marquée du badge **EPIC**, avec son compteur *x/y terminées*, son sélecteur de statut, un bouton ✓ *terminer*, et un bouton **« + Sous-tâche »**. Sous l'épique, les 4 colonnes Kanban accueillent ses tâches filles.

**Sur chaque carte de tâche** : titre, description, responsable, échéance (**affichée en rouge si dépassée et non terminée**), et une **liste de contrôle des sous-tâches** dépliable. Cliquer sur une sous-tâche bascule son statut.

> **Règle importante** : un bouton ✓ *Terminer* est **désactivé tant que toutes les sous-tâches ne sont pas terminées**. L'application affiche alors « Sous-tâches incomplètes » avec le nombre restant. Toute mise à jour de statut demande une confirmation.

> **Pas de glisser-déposer.** Le statut se change via un **sélecteur** ou le bouton ✓. Le cahier des charges mentionnait le *drag & drop* ; il n'est pas implémenté.

### 5.6 L'import en masse

Le bouton *Import* ouvre un assistant qui accepte du **texte collé** ou un **fichier CSV/TXT** (seule la première colonne est lue).

Le format est celui de la hiérarchie — c'est exactement le rappel affiché par l'application :

```
Format (tirets = niveau de hiérarchie) :

Créer le site web          ← EPIC (pas de tiret)
- Design frontend          ← Tâche (1 tiret)
-- Maquette accueil        ← Sous-tâche (2 tirets)
-- Maquette contact        ← Sous-tâche
- Développer le backend    ← Tâche
```

> Attention : l'application **ignore les espaces de début de ligne**. Une ligne indentée mais sans tiret est lue comme une **épique**, pas comme une tâche — il faut bien un `- ` ou `-- `.

Un **aperçu en direct** montre les badges `EPIC` / `Task` / `Sub` et le nombre total, puis *Importer (n)* crée la hiérarchie. Les tâches importées sont créées avec le statut *À faire*, la date du jour comme échéance, et **sans responsable**.

### 5.7 Les équipes — `/teams`

Grille de cartes : nom, description, date de création, liste des membres avec leur **rôle d'équipe**. Les boutons d'ajout, de modification, de suppression et **« Gérer les membres »** sont réservés à l'**administrateur**.

La fenêtre *Gérer les membres* permet de changer le rôle d'un membre (`dev` / `lead`), de le retirer, ou d'ajouter un utilisateur.

> **Règle du chef unique** : une équipe ne peut avoir **qu'un seul chef**. L'option « Lead » est désactivée si un chef est déjà en place ; en attribuer un nouveau rétrograde automatiquement l'ancien.

La suppression d'une équipe **cascade** : tâches → projets → appartenances → équipe. Les membres ne sont alors plus rattachés à aucune équipe.

### 5.8 Les utilisateurs — `/users` *(administrateur uniquement)*

Cette page n'apparaît que pour les administrateurs ; une URL directe renvoie vers le tableau de bord sinon.

- Compteur de membres et **champ de recherche** (filtre sur le nom et l'e-mail).
- Tableau : utilisateur (avatar, nom, e-mail), **badge de rôle**, **puces d'équipes**, actions *Modifier* / *Supprimer*.
- Bouton **« Ajouter »**.

Le formulaire de création demande le nom, l'e-mail, le rôle (3 cartes à choisir) et une équipe. **Si vous laissez le mot de passe vide, un mot de passe est généré et envoyé par e-mail** à l'utilisateur ; une fenêtre de confirmation explique ensuite que l'invitation a été envoyée avec un lien de connexion direct.

> Lors d'une **modification**, l'équipe s'affiche en lecture seule : l'appartenance aux équipes se gère depuis la page *Équipes*.

### 5.9 Le profil — `/profile`

- Avatar, nom, e-mail, badge de rôle et liste des équipes avec votre rôle dans chacune.
- **« Modifier le profil »** : nouveau nom complet.
- **« Sécurité »** : changement de mot de passe (actuel, nouveau, confirmation — 8 caractères minimum).

### 5.10 L'analyse de données — `/analytics`

Voir la section [8](#8-lanalyse-de-données).

---

## 6. Règles d'accès

| Capacité | Admin | Chef d'équipe | Développeur |
|---|:---:|:---:|:---:|
| Voir tous les projets de l'espace | ✔ | — | — |
| Voir les projets de **ses** équipes | ✔ | ✔ | ✔ |
| Voir les tâches | toutes | celles de ses équipes | **les siennes uniquement** |
| Créer / modifier / supprimer un **projet** | ✔ | — | — |
| Gérer les **équipes** et leurs membres | ✔ | — | — |
| Créer / modifier / supprimer une **tâche** | ✔ | ✔ (projets de ses équipes) | — |
| Changer le **statut** d'une tâche | ✔ | ✔ | ✔ (les siennes) |
| Importer une hiérarchie | ✔ | ✔ | — |
| Gérer les **utilisateurs** | ✔ | — | — |
| Consulter l'**analyse** | ✔ | ✔ | ✔ |
| Profil et mot de passe | ✔ | ✔ | ✔ |

Ces règles sont appliquées **deux fois** : dans l'interface (boutons masqués ou désactivés) et côté API (les requêtes non autorisées reçoivent un `403`). Les requêtes d'analyse utilisent exactement les mêmes filtres de visibilité que la liste des tâches : **une analyse ne peut pas divulguer davantage que ce que vous voyez déjà**.

---

## 7. Architecture technique

```
project-gest/
├── backend/                     API REST — Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── index.ts             Démarrage, middlewares, seed au boot
│   │   ├── config/              env, catalogue d'analyse, persistance de clé
│   │   ├── models/              User · Team · Project · Task
│   │   ├── routes/              auth · projects · tasks · teams · users · analytics
│   │   ├── controllers/         Contrôleurs par domaine
│   │   ├── services/            Logique métier + client d'analyse
│   │   ├── middlewares/         authenticate · authorize · errorHandler
│   │   ├── validation/          Schémas Zod
│   │   └── seed/                Jeu de démonstration
│   └── dist/                    Compilation (non versionnée)
└── frontend/                    Interface — React + Vite + Tailwind
    └── src/
        ├── pages/               Landing · Login · Register · Dashboard ·
        │                        Projects · ProjectDetail · Teams · Users ·
        │                        Profile · Analytics
        ├── components/          Layout · Sidebar · TaskBoard · modales…
        ├── contexts/            Auth · Data · Theme · Language
        ├── services/api.js      Client HTTP
        └── utils/translations.js Dictionnaire FR / EN
```

### Modèle de données

Quatre modèles seulement, tous rattachés à un **espace de travail** (`workspaceId`) qui isole les données :

**Utilisateur** — nom, e-mail, mot de passe (bcrypt), rôle global (`ADMIN | LEAD | DEV`), tableau d'appartenances `{ équipe, rôle }`, code OTP et dates d'expiration.

**Équipe** — nom, description.

**Projet** — nom, description, équipe responsable, statut (`EN_COURS | TERMINE | SUSPENDU`).

**Tâche** — titre, description, projet, **`parentId`** (auto-référence vers la tâche mère), responsable, échéance, statut (`A_FAIRE | EN_COURS | BLOQUE | TERMINE`).

> La hiérarchie *épique → tâche → sous-tâche* n'utilise **pas** de champ de niveau : elle est déduite de `parentId`. Une tâche sans mère est une épique ; une tâche fille d'une épique est une tâche ; une tâche fille d'une tâche est une sous-tâche.

### Sécurité

- **helmet** (en-têtes), **CORS** en liste blanche, limitation de débit (100 req/min, 5 req/min sur la connexion),
- validation **Zod** sur toute écriture, **bcrypt** à 10 tours,
- JWT de 7 jours + *cookie* `httpOnly` / `SameSite: strict`,
- isolation **équipe et espace de travail** appliquée côté serveur.

---

## 8. L'analyse de données

La page `/analytics` transforme vos données de projet en **analyse décisionnelle**, en interrogeant un service d'analyse externe.

### Principe

1. Le backend agrège **localement** vos données MongoDB en **trois jeux** :
   - `flux-mensuel` — création, clôture, stock ouvert et retards, mois par mois ;
   - `taches` — une ligne par tâche (statut, projet, équipe, responsable, échéance, retard) ;
   - `projets` — une ligne par projet (avancement, répartition des statuts, ancienneté).
2. Ces jeux sont envoyés au service d'analyse, qui calcule **statistiques, tendances, anomalies, prévisions, corrélations et segments**.
3. Les deux jeux mensuels sont **jointurés** sur la clé `periode`, ce qui permet des corrélations croisées (par exemple *tâches terminées* ↔ *délai moyen*).

> La **clé d'API** ne quitte **jamais** le serveur. Elle n'est ni affichée, ni journalisée, ni transmise au navigateur.

### Utilisation

- Le sélecteur **« Découpage »** choisit le segment d'analyse : `Aucun`, `projet`, `statut` ou `equipe`.
- **« Lancer l'analyse »** démarre l'analyse ; elle s'exécute automatiquement une fois au chargement de la page.
- Un badge en haut de page indique l'état du service : vert *branché*, rouge *clé révoquée*, ambre *non configuré*.

### Ce que l'analyse affiche

| Bloc | Contenu |
|---|---|
| **État à l'instant T** | 8 indicateurs : tâches, ouvertes, terminées, bloquées, **en retard** (rouge si > 0), taux d'achèvement, délai moyen, projets |
| **Avis de l'IA** | Modèle utilisé, taux de confiance, résumé, puis *Points clés* / *Recommandations* / *Plan d'action*, et un panneau *Risques identifiés* |
| **Synthèse décisionnelle** | Verdict (`positif`, `équilibre`, `tension`, `surveiller`), jeux analysés, résumé et risques |
| **Liens entre jeux** | Clé de jointure, nombre de clés alignées, **corrélations croisées** avec coefficient `r` et force de la relation |
| **Signaux détectés** | Sévérité (élevée / moyenne / faible), type, métrique concernée et valeur |
| **Résultats détaillés** | Pour chaque jeu : tableau statistique (effectif, moyenne, médiane, min, max, écart-type), **tendance** (↑/↓ %), anomalies, **prévision**, corrélations, distribution, et tableau de **segments** (part, moyenne, total) |
| **Pied de page** | Durée d'exécution, nombre de lignes analysées, avertissement |

> **À noter** : l'analyse s'appuie sur `updatedAt` pour approcher la date de fin d'une tâche, car le modèle ne porte pas de champ `completedAt`. L'interface le signale. Les résultats sont présentés sous forme de **tableaux et de listes**, sans graphique.

### Entretien du service d'analyse

La plateforme d'analyse **réinitialise périquement sa base** : ses applications et leurs jeux de données disparaissent, et l'ancienne clé renvoie alors `401 Invalid or revoked API key`. GestPro se **répare tout seul** dans ce cas : il recrée l'application, redéclare les trois jeux, **réécrit les deux lignes concernées de `backend/.env`**, puis rejoue la requête — sans erreur visible.

Les garde-fous : une sonde précède toute création, un signal ambigu ne déclenche rien, une seule réparation à la fois, et 3 réparations maximum par tranche de 10 minutes.

---

## 9. Déploiement

### Backend sur Render

Créez un *Web Service* à partir du dépôt, avec :

| Variable | Valeur |
|---|---|
| `MONGO_URI` | chaîne de connexion Atlas |
| `JWT_SECRET` | chaîne longue et aléatoire — **ne jamais réutiliser la valeur de développement** |
| `FRONTEND_URL` | URL exacte du frontend déployé (pour le CORS) |
| `ANALYTICS_API_URL` | URL du service d'analyse |
| `ANALYTICS_API_KEY` | clé de l'application (affichée **une seule fois**) |
| `ANALYTICS_APP_SLUG` | slug de l'application |
| `SEED_ON_BOOT` | `false` en production |

Commande de démarrage : `npm run build && npm start`.

> Sur Render, il n'existe pas de fichier `.env` : après une réparation automatique, la clé reste en mémoire jusqu'au prochain redéploiement. Un disque persistant côté plateforme éliminerait cette limite.

### Frontend sur Vercel

```bash
cd frontend && npm run build
```

Définissez `VITE_API_URL` sur l'URL de l'API (avec `/api`) **avant** la construction, puis redéployez. Le CORS du backend accepte les domaines `*.vercel.app`.

---

## 10. Limitations connues

Points à garder en tête, documentés pour être honnêtes :

- **L'inscription publique crée toujours un compte administrateur.** Le champ rôle est codé en dur côté interface. À corriger avant toute mise en production.
- **Pas de glisser-déposer** sur le tableau Kanban : le statut se change par sélecteur ou bouton.
- **La suppression d'une tâche ne supprime pas ses filles.** En revanche, supprimer un projet ou une équipe **bien** supprime toute la hiérarchie.
- **Un chef d'équipe qui n'est pas `ADMIN` globalement** peut voir les boutons de création de tâches, mais l'API les refuse (rôle vérifié sur le rôle global).
- **La bannière « tâches bloquées »** du tableau de bord ne s'affiche jamais : le filtre compare un code français à une valeur anglaise.
- **Pas de commentaires, de pièces jointes, de notifications internes, de journal d'activité, de calendrier ni de recherche globale.** Les notifications se limitent aux e-mails.
- **Priorité et dépendances** entre tâches n'existent pas — seulement la relation parent/enfant.
- **L'interface n'est pas intégralement traduite** : navigation, tableau de bord, en-têtes de pages, page d'accueil et analyse le sont ; les libellés des modales de tâches et de projets restent en anglais.
- **Les tarifs de la page d'accueil sont fictifs** : aucun paiement ni limitation par plan.

---

## 11. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| « Accès refusé pour ce rôle » | Le rôle choisi à la connexion ne correspond pas au compte | Reconnectez-vous en choisissant le bon rôle, ou utilisez le lien d'invitation |
| Pas d'e-mail de code OTP | Variables `SMTP_*` absentes | Le code s'affiche dans la **console du backend** |
| Code refusé | Le code a expiré (5 min pour la connexion) | Redemandez un nouveau code |
| Page blanche ou échec des requêtes | API non démarrée ou URL incorrecte | Vérifiez que `VITE_API_URL` vaut `http://localhost:3000/api` et que le backend tourne |
| `ECONNREFUSED` au démarrage | MongoDB inaccessible | Vérifiez `MONGO_URI` et que l'instance est démarrée |
| Le badge d'analyse est rouge | La plateforme d'analyse a purgé sa base | **Lancez une analyse** : la réparation est automatique |
| Le badge d'analyse est ambre | Variables `ANALYTICS_*` manquantes | Renseignez-les dans `backend/.env`, redémarrez le backend |
| Bouton *Ajouter une tâche* grisé | Vous n'êtes ni admin ni chef de l'équipe du projet | Demandez à un administrateur de vous attribuer le rôle de chef dans l'équipe |
| Un épique refuse de se terminer | Des sous-tâches restent ouvertes | Terminez-les d'abord, ou repliez la liste pour les voir |
| `npm run seed:reset` refuse | `NODE_ENV=production` | Commande réservée au développement |

---

*Documentation de GestPro — projet de gestion de projet collaborative.*
