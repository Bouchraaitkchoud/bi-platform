# 🚀 BI Platform - Démarrage Complet

## ✅ Status Actuel

| Composant | Status | Port | URL |
|-----------|--------|------|-----|
| Frontend (Next.js) | ✅ RUNNING | 3000 | http://localhost:3000 |
| Backend (FastAPI) | 🔄 À démarrer | 8000 | http://localhost:8000 |
| API Docs | 🔄 À démarrer | 8000 | http://localhost:8000/docs |
| PostgreSQL | 🔄 Docker | 5432 | localhost:5432 |
| Redis | 🔄 Docker | 6379 | localhost:6379 |
| MinIO | 🔄 Docker | 9000/9001 | http://localhost:9001 |

---

## 🎯 Étape 1: Vérifier le Frontend

Le frontend **est déjà en cours d'exécution** !

Accédez à: **http://localhost:3000**

Vous verrez:
- Page d'accueil avec options Login/SignUp
- Boutons pour accéder aux dashboards
- Design moderne avec TailwindCSS

---

## 🎯 Étape 2: Démarrer la Base de Données et Services

Ouvrez **une nouvelle terminal** et lancez:

```bash
cd c:\Users\Hp\bi-platform
pnpm docker:up
```

Cela démarrera:
- ✅ PostgreSQL (base de données)
- ✅ Redis (cache)
- ✅ MinIO (stockage de fichiers)

Attendez 30-60 secondes que tous les services soient prêts.

---

## 🎯 Étape 3: Exécuter les Migrations de Base de Données

Dans **une autre terminal**, lancez:

```bash
cd c:\Users\Hp\bi-platform
pnpm db:migrate
```

Cela créera toutes les tables dans PostgreSQL.

---

## 🎯 Étape 4: Démarrer le Backend API

Dans **une autre terminal**, lancez:

```bash
cd c:\Users\Hp\bi-platform\apps\api
poetry run uvicorn app.main:app --reload --port 8000
```

Le backend démarrera sur **http://localhost:8000**

Vérifiez: **http://localhost:8000/docs** (Swagger documentation)

---

## 🧪 Teste l'Application

### 1. Aller au Frontend
```
http://localhost:3000
```

### 2. S'inscrire
- Cliquez "Sign Up"
- Email: `test@example.com`
- Nom: `Test User`
- Mot de passe: `test123456`
- Confirmez le mot de passe

### 3. Se Connecter
- Cliquez "Login"
- Email: `test@example.com`
- Mot de passe: `test123456`
- Cliquez "Sign In"

### 4. Voir le Dashboard
Vous verrez le dashboard principal avec:
- ✅ Datasets (gestion de données)
- ✅ Charts (visualisations)
- ✅ Dashboards (tableaux de bord)

---

## 🐳 Commandes Utiles Docker

```bash
# Voir les logs des services
pnpm docker:logs

# Arrêter les services
pnpm docker:down

# Redémarrer les services
pnpm docker:down && pnpm docker:up

# Voir l'état des containers
docker-compose ps
```

---

## 📊 Console MinIO (Stockage de Fichiers)

Accédez à: **http://localhost:9001**

Identifiants:
- Username: `minioadmin`
- Password: `minioadmin`

C'est là que les fichiers uploadés seront stockés.

---

## 🔧 Dépannage

### Frontend ne charge pas
```bash
# Vérifier que le serveur tourne
lsof -i :3000
# ou sur Windows
netstat -ano | findstr :3000

# Relancer si nécessaire
cd apps/web && pnpm dev
```

### API ne répond pas
```bash
# Vérifier que le serveur API tourne
netstat -ano | findstr :8000

# Vérifier les logs Docker
pnpm docker:logs api
```

### Erreur de base de données
```bash
# Reset complet
pnpm docker:down -v
pnpm docker:up
pnpm db:migrate
```

---

## 📁 Fichiers Créés pour le Frontend

```
✅ pages
  - src/app/page.tsx (Accueil)
  - src/app/login/page.tsx (Connexion)
  - src/app/register/page.tsx (Inscription)
  - src/app/dashboard/page.tsx (Tableau de bord)

✅ components
  - src/components/ui/button.tsx
  - src/components/ui/card.tsx
  - src/components/ui/dialog.tsx
  - src/components/ui/input.tsx
  - src/components/ui/textarea.tsx

✅ configuration
  - tailwind.config.ts (Styles)
  - next.config.ts (Configuration Next.js)
  - .env.local (Variables d'environnement)

✅ utilities
  - src/lib/api.ts (Endpoints API)
  - src/lib/constants.ts (Constantes)
  - src/lib/utils.ts (Utilities)
```

---

## 🚀 Prochaines Étapes

Après avoir testé l'authentification, vous pourrez:

1. **Implémenter l'Upload de Fichiers**
   - Page d'upload de datasets
   - Traitement avec Pandas
   - Extraction de métadonnées

2. **Créer le Builder de Graphiques**
   - Interface de création de graphiques
   - Intégration ECharts
   - Sauvegarde des configurations

3. **Implémenter les Dashboards**
   - Système de drag-and-drop
   - Sauvegarde des layouts
   - Partage avec permissions

4. **Ajouter les Filtres**
   - Filtres interactifs
   - Transformations de données
   - Export de données

---

## 📞 Support Rapide

| Problème | Solution |
|----------|----------|
| Port 3000 occupé | `netstat -ano \| findstr :3000` puis `taskkill /PID <PID> /F` |
| Port 8000 occupé | `netstat -ano \| findstr :8000` puis `taskkill /PID <PID> /F` |
| PostgreSQL pas prêt | Attendez 30s après `docker-compose up` |
| Erreur de migration | `pnpm docker:down -v && pnpm docker:up && pnpm db:migrate` |

---

## 📊 Architecture Complète

```
User Browser (http://localhost:3000)
        ↓
Next.js Frontend (Node.js)
        ↓
FastAPI Backend (Python)
        ↓
PostgreSQL Database
        ↓
Redis Cache
        ↓
MinIO Storage
```

---

**Date**: 26 Mars 2026  
**Status**: ✅ Frontend Running  
**Backend**: 🔄 Ready to Start

Êtes-vous prêt à démarrer l'API ?
