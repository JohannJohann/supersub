# API Offres avec FastAPI et SQLModel

Une API REST pour gérer des offres avec FastAPI, SQLModel et PostgreSQL.

## Structure du projet

```
FastApiWork/
├── src/
│   ├── __init__.py
│   ├── main.py              # Point d'entrée de l'application
│   ├── database.py          # Configuration de la base de données
│   ├── models/
│   │   ├── __init__.py
│   │   └── offres.py        # Modèle SQLModel pour les offres
│   └── routers/
│       ├── __init__.py
│       └── offres.py        # Routes API pour les offres
├── requirements.txt         # Dépendances Python
├── .env.example            # Exemple de configuration
└── README.md
```

## Installation

1. Cloner le projet et naviguer dans le répertoire
2. Créer un environnement virtuel :

   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # ou
   source .venv/bin/activate  # Linux/Mac
   ```

3. Installer les dépendances :

   ```bash
   pip install -r requirements.txt
   ```

4. Configurer la base de données :
   - Copier `.env.example` vers `.env`
   - Modifier l'URL de la base de données PostgreSQL dans `.env`

## Configuration de la base de données

Créer un fichier `.env` avec votre configuration PostgreSQL :

```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
```

## Lancement de l'application

```bash
fastapi dev main.py
```

L'API sera disponible sur `http://localhost:8000`

## Documentation API

- Documentation interactive : `http://localhost:8000/docs`
- Documentation ReDoc : `http://localhost:8000/redoc`

## Modèle de données - Offres

La table `offres` contient les colonnes suivantes :

- `id` : Identifiant unique (auto-généré)
- `titre` : Titre de l'offre (texte, max 255 caractères)
- `description` : Description détaillée (texte)
- `prix` : Prix de l'offre (entier positif)
- `avantages` : Avantages de l'offre (texte)

## Endpoints disponibles

- `GET /` : Message de bienvenue
- `GET /health` : Vérification de l'état de l'API
- `POST /offres/` : Créer une nouvelle offre
- `GET /offres/` : Récupérer toutes les offres
- `GET /offres/{id}` : Récupérer une offre par ID
- `PATCH /offres/{id}` : Mettre à jour une offre
- `DELETE /offres/{id}` : Supprimer une offre

## Exemple d'utilisation

### Créer une offre

```bash
curl -X POST "http://localhost:8000/offres/" \
     -H "Content-Type: application/json" \
     -d '{
       "titre": "Offre Premium",
       "description": "Une offre exceptionnelle avec de nombreux avantages",
       "prix": 99,
       "avantages": "Support 24/7, Accès illimité, Formation incluse"
     }'
```

### Récupérer toutes les offres

```bash
curl -X GET "http://localhost:8000/offres/"
```
