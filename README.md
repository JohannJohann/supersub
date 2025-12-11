# Supersub

Application de gestion d'abonnements avec FastAPI (backend) et Next.js (frontend).

## 📋 Prérequis

- Docker
- Docker Compose

## 🛠️ Configuration

<!-- 1. Copiez les fichiers d'environnement :
   ```bash
   cp supersub_backend/.env.example supersub_backend/.env
   cp supersub_frontend/.env.example supersub_frontend/.env
   ``` -->

2. Lancez l'application :
   ```bash
   cd supersub_backend
   docker-compose up -d
   ```

**Accès :**

- Frontend : http://localhost:3000
- Backend API : http://localhost:8000

## 🏗️ Architecture

- **Backend** : FastAPI + PostgreSQL + Redis
- **Frontend** : Next.js + TypeScript + Tailwind CSS
- **Authentification** : JWT avec cookies HTTP-only
- **Base de données** : PostgreSQL avec SQLModel
- **Cache** : Redis
