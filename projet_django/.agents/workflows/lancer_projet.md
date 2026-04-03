---
description: Lancer le serveur de développement Django avec l'environnement virtuel
---

## Prérequis

- Python 3.10+ installé
- Se placer à la racine du projet : `/home/gedeonkp/Documents/cours/semestre6/poo/projet_django`

---

## Étapes pour lancer le projet

### 1. Activer l'environnement virtuel

```bash
source venv/bin/activate
```

### 2. Installer / mettre à jour les dépendances

```bash
pip install -r location_app/requirements.txt
```

### 3. Appliquer les migrations

```bash
python location_app/manage.py migrate
```

### 4. Lancer le serveur de développement

```bash
python location_app/manage.py runserver
```

Le serveur sera accessible à : **http://127.0.0.1:8000/**

---

## Commandes utiles

| Commande | Description |
|---|---|
| `python manage.py makemigrations` | Générer les migrations après modification d'un modèle |
| `python manage.py migrate` | Appliquer les migrations |
| `python manage.py createsuperuser` | Créer un compte administrateur |
| `python manage.py shell` | Ouvrir le shell Django interactif |
| `python manage.py check` | Vérifier la configuration du projet |
| `deactivate` | Désactiver l'environnement virtuel |

---

## Structure des apps

| App | Contenu |
|---|---|
| `utilisateur` | Utilisateur, Admin, Proprietaire, Locataire |
| `biens` | Categorie, TypeAppartement, Bien, Bail, Paiement, Quittance |
| `comptabilite` | SystemeComptable |
| `notification` | Notification |

---

## API REST (Django REST Framework)

L'API est disponible à : **http://127.0.0.1:8000/api/**

L'interface navigable DRF est accessible directement dans le navigateur.
