# Docker Setup pour Supersub

Ce guide explique comment lancer l'application Supersub complète avec Docker Compose.

## Prérequis

- Docker
- Docker Compose

## Architecture

Le docker-compose.yml lance 4 services :

1. **PostgreSQL** - Base de données principale
2. **Redis** - Cache et sessions
3. **Backend** - API FastAPI (port 8000)
4. **Frontend** - Application Next.js (port 3000)

## Configuration

### Variables d'environnement

Créez un fichier `.env` dans le dossier `supersub_backend` en copiant le .env.example

## Lancement

### Démarrer tous les services

```bash
cd supersub_backend
docker-compose up -d
```

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Arrêter les services

```bash
docker-compose down
```

### Reconstruire les images

```bash
docker-compose up --build
```

## Accès aux services

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs
- **PostgreSQL** : localhost:5432
- **Redis** : localhost:6379

## Développement

### Mode développement

Les volumes sont configurés pour le hot-reload :

- **Backend** : Les changements de code Python sont automatiquement rechargés
- **Frontend** : Les changements Next.js sont automatiquement rechargés

### Accéder aux conteneurs

```bash
# Backend
docker exec -it supersub_backend bash

# Frontend
docker exec -it supersub_frontend sh

# PostgreSQL
docker exec -it supersub_postgres psql -U johann -d supersub_db
```

### Réinitialiser les données

```bash
# Arrêter et supprimer les volumes
docker-compose down -v

# Redémarrer
docker-compose up -d
```

## Résolution de problèmes

### Port déjà utilisé

Si les ports sont déjà utilisés, modifiez les variables d'environnement dans `.env` :

```env
BACKEND_PORT=8001
FRONTEND_PORT=3001
```

### Problèmes de réseau

Vérifiez que tous les services sont sur le même réseau :

```bash
docker network ls
docker network inspect supersub_backend_supersub-network
```

### Logs d'erreur

```bash
# Vérifier l'état des services
docker-compose ps

# Voir les logs détaillés
docker-compose logs backend
docker-compose logs frontend