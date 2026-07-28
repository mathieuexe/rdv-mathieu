# Studio RDV Mathieu

Application web complète de prise de rendez-vous en ligne, pensée pour une micro-entreprise, avec :
- un front public accessible par lien unique de catégorie ;
- un back-office administrateur sécurisé ;
- une architecture `Next.js + Supabase + Vercel` prête à être configurée.

## Fonctionnalités livrées

### Côté client
- page publique par catégorie : `/rdv/[slug]`
- affichage du titre, de la description, de la durée et du mode de rendez-vous
- affichage des créneaux calculés selon les règles de disponibilité
- blocage des créneaux déjà pris, passés ou couverts par une indisponibilité
- formulaire de demande de rendez-vous
- page de confirmation après envoi
- page de maintenance globale
- gestion du statut hors ligne d'une catégorie

### Côté administrateur
- page de connexion : `/admin/login`
- tableau de bord : `/admin`
- liste des catégories
- création et édition de catégorie
- liste des demandes de rendez-vous
- page de détail d'une demande avec acceptation ou refus
- page de paramètres globaux et mode maintenance

### Données et backend
- clients Supabase `browser`, `server` et `admin`
- migrations SQL Supabase
- règles RLS et grants de base
- seeds d'exemple
- fallback démo si Supabase n'est pas encore configuré
- notifications email via Resend si les variables d'environnement sont présentes

## Stack technique

- Frontend : `Next.js` App Router + `React` + `TypeScript`
- UI : `Tailwind CSS`
- Backend : Route Handlers Next.js
- Base de données : `Supabase PostgreSQL`
- Auth : `Supabase Auth`
- Emails : API Resend optionnelle
- Déploiement : `Vercel`

## Installation locale

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer l'environnement

Copiez `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Variables disponibles :

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=
RESEND_FROM_NAME=NOREPLY
RESEND_FROM_EMAIL=info@mathieucerenzia.fr
```

### 3. Lancer le projet

```bash
npm run dev
```

Application locale : [http://localhost:3000](http://localhost:3000)

## Configuration Supabase

### 1. Créer le projet Supabase

- créez un nouveau projet sur [https://supabase.com](https://supabase.com)
- récupérez :
  - l'URL du projet
  - la clé `anon`
  - la clé `service_role`

### 2. Appliquer la migration

Depuis l'interface SQL Editor de Supabase ou via la CLI :

- exécutez `supabase/migrations/20260727143000_init_rdv_schema.sql`
- puis exécutez `supabase/seed.sql` si vous souhaitez des données de démonstration

### 3. Créer le premier compte admin

L'authentification admin repose sur `Supabase Auth`.

Procédure :
- créez l'utilisateur administrateur dans `Authentication > Users`
- notez son email et placez-le dans `ADMIN_EMAIL`
- récupérez son `user_id`
- ajoutez-le dans la table `admin_users`

Exemple SQL :

```sql
insert into public.admin_users (user_id, email)
values ('UUID_DE_L_UTILISATEUR', 'admin@example.com');
```

### 4. Vérifier l'accès admin

- connectez-vous via `/admin/login`
- si Supabase n'est pas configuré, le mode démonstration reste disponible :
  - email : la valeur de `ADMIN_EMAIL`
  - mot de passe : `demo-admin`

## Déploiement sur Vercel

### 1. Importer le dépôt

- connectez le projet à Vercel
- sélectionnez le dossier racine du projet

### 2. Définir les variables d'environnement

Ajoutez dans Vercel :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_NAME`
- `RESEND_FROM_EMAIL`

### 3. Déployer

```bash
npm run build
```

Le projet est compatible avec le déploiement Vercel standard pour Next.js.

## Scripts utiles

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run check
```

## Structure utile

```text
src/app
src/components
src/lib
src/types
supabase/migrations
supabase/seed.sql
.trae/documents
```

## Remarques importantes

- sans variables Supabase, l'application utilise un mode démo pour permettre la prévisualisation
- avec Supabase configuré, les lectures et écritures basculent sur la base réelle
- l'envoi d'emails est silencieusement ignoré si Resend n'est pas configuré
- le back-office vérifie l'authentification avant les actions d'acceptation et de refus
