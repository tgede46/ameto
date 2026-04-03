# Bilan d'analyse - Projet Django Location App

Date: 2026-03-20

## 1. Vue d'ensemble

Le projet est une API Django REST structurée par domaines metier:
- `utilisateur`: gestion des utilisateurs/roles/authentification.
- `biens`: gestion des biens immobiliers et photos.
- `comptabilite`: baux, paiements, quittances.
- `notification`: notifications metier.

Configuration centrale:
- `location_app/location_app/settings.py`
- `location_app/location_app/urls.py`

## 2. Architecture technique

- Framework principal: Django + Django REST Framework.
- Authentification: JWT via `djangorestframework-simplejwt` + `dj-rest-auth` + `allauth`.
- Base de donnees: PostgreSQL (nom DB `location_db`, host `localhost`, port `5432`).
- Documentation API: Swagger/Redoc via `drf_yasg`.
- Modele utilisateur personnalise: `AUTH_USER_MODEL = 'utilisateur.Utilisateur'`.

Points d'entree API principaux:
- `/` page JSON d'accueil
- `/api/` routes des applications metier
- `/api/dj-rest-auth/` auth
- `/swagger/` documentation Swagger
- `/redoc/` documentation Redoc

## 3. Points forts

- Separation claire des couches: models/serializers/views/services.
- Apps decouplees par responsabilite metier.
- Stack API moderne (DRF + JWT).
- Outillage qualite present (`pytest`, `black`, `isort`, `flake8`, `pylint`, `bandit`).

## 4. Risques et points d'attention

1. **Securite (important)**
- `SECRET_KEY` hardcodee dans `settings.py`.
- `DEBUG = True`.
- `ALLOWED_HOSTS = []`.

2. **Configuration d'execution**
- Le projet depend de PostgreSQL local (`location_db`, user/password `root`).
- Si la base n'est pas demarree/configuree, l'application ne demarrera pas.

3. **Complexite auth**
- Combinaison `allauth` + `dj-rest-auth` + `simplejwt` qui demande une config coherente (cookies JWT, providers sociaux, etc.).

## 5. Etat de verification dans cette session

- Analyse statique effectuee sur les fichiers de configuration et routes.
- Verification runtime (commandes Docker, checks Django, lancement serveur) **non finalisee** car les executions terminal ont ete annulees.

## 6. Procedure recommandee pour lancer et tester

Depuis `location_app/`:

```bash
# 1) Demarrer PostgreSQL via Docker
docker compose up -d db

# 2) Installer les dependances Python (dans ton venv actif)
pip install -r requirements.txt

# 3) Appliquer les migrations
python manage.py migrate

# 4) (Optionnel) Creer un superuser
python manage.py createsuperuser

# 5) Lancer le serveur
python manage.py runserver
```

Ensuite tester:
- API home: `http://127.0.0.1:8000/`
- Swagger: `http://127.0.0.1:8000/swagger/`
- Admin: `http://127.0.0.1:8000/admin/`

## 7. Recommandations immediates

- Externaliser `SECRET_KEY`, `DEBUG`, credentials DB dans des variables d'environnement (`python-decouple` deja present).
- Ajouter un fichier `.env.example`.
- Definir des profils de settings (`dev`, `prod`) pour eviter les erreurs de deploiement.
- Verifier les tests unitaires/integration apres demarrage (`pytest`).
