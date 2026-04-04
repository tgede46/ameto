# Guide API Frontend - Location App

Date: 2026-04-03

## 1) Informations de base

- Base URL locale: `http://127.0.0.1:8000/api`
- Documentation interactive: `http://127.0.0.1:8000/swagger/`
- Authentification: JWT Bearer
- Header a envoyer apres login/register:

```http
Authorization: Bearer <access_token>
```

## 2) Authentification (commun Client et Admin/Proprietaire)

### 2.1 Inscription

Endpoint:
- `POST /auth/register/`

Important:
- `role` accepte `LOCATAIRE` ou `PROPRIETAIRE`
- Si le frontend envoie `CLIENT`, le backend le mappe vers `LOCATAIRE`

Exemple payload Client:

```json
{
  "nom": "Diallo",
  "prenom": "Amina",
  "email": "amina.client@example.com",
  "telephone": "+221771112233",
  "adresse": "Dakar",
  "date_naissance": "2000-01-01",
  "profession": "Etudiante",
  "personne_a_prevenir": "Mere",
  "password": "Secret123!",
  "role": "CLIENT"
}
```

Exemple payload Proprietaire:

```json
{
  "nom": "Ndiaye",
  "prenom": "Moussa",
  "email": "moussa.proprio@example.com",
  "telephone": "+221770001122",
  "adresse": "Dakar",
  "nobre_logement": 3,
  "password": "Secret123!",
  "role": "PROPRIETAIRE"
}
```

Reponse succes (201):

```json
{
  "utilisateur": {
    "id": 12,
    "nom": "Diallo",
    "prenom": "Amina",
    "email": "amina.client@example.com",
    "telephone": "+221771112233",
    "adresse": "Dakar",
    "role": "LOCATAIRE",
    "role_display": "Locataire",
    "actif": true,
    "created_at": "...",
    "updated_at": "..."
  },
  "refresh": "...",
  "access": "...",
  "role": "LOCATAIRE",
  "nom": "Amina Diallo"
}
```

Erreurs frequentes:
- email deja existant
- telephone deja existant
- role invalide

### 2.2 Connexion

Endpoint:
- `POST /auth/login/`

Payload:

```json
{
  "email": "amina.client@example.com",
  "password": "Secret123!"
}
```

Reponse succes (200):
- Meme format de tokens que register

Erreurs:
- `400`: email/password manquants
- `401`: identifiants incorrects

### 2.3 Profil utilisateur

Endpoints:
- `GET /auth/profile/`
- `PATCH /auth/profile/`

### 2.4 JWT utilitaires

Endpoints:
- `POST /auth/token/refresh/` avec `{ "refresh": "..." }`
- `POST /auth/token/verify/` avec `{ "token": "..." }`

## 3) Frontend Client (Locataire)

## 3.1 Parcours principal recommande

1. Login ou register
2. Lister les biens disponibles
3. Lire detail bien
4. Consulter ses notifications
5. Echanger via messagerie
6. Signaler/consulter maintenance

### 3.2 Endpoints utiles Client

Biens (lecture publique ou authentifiee):
- `GET /biens/` (filtres possibles: `categorie`, `type`, `loyer_min`, `loyer_max`)
- `GET /biens/recents/`
- `GET /biens/{id}/`

Baux/Paiements/Quittances (auth requis):
- `GET /bail/`
- `GET /bail/{id}/`
- `GET /bail/{id}/paiements/`
- `GET /paiements/`
- `GET /paiements/{id}/`
- `GET /paiements/{id}/quittance/`
- `GET /quittances/`
- `GET /quittances/{id}/`

Notifications (auth requis):
- `GET /notifications/`
- `GET /notifications/non-lues/`
- `POST /notifications/{id}/marquer-lu/`
- `POST /notifications/marquer-tout-lu/`

Messages (auth requis):
- `GET /messages/`
- `POST /messages/`
- `GET /messages/conversations/`
- `GET /messages/conversation/{user_id}/`

Maintenance (auth requis):
- `GET /maintenances/`
- `POST /maintenances/`
- `GET /maintenances/{id}/`

Exemple payload creation maintenance:

```json
{
  "bien": 5,
  "titre": "Fuite dans la cuisine",
  "description": "Le robinet fuit depuis hier",
  "priorite": "MOYENNE"
}
```

## 4) Frontend Admin/Proprietaire

## 4.1 Parcours principal recommande

1. Login proprietaire/admin
2. Charger dashboard proprio (`mes-biens`, `mes-stats`)
3. Creer/mettre a jour biens
4. Gerer medias (photos/videos)
5. Gerer baux et paiements
6. Suivre comptabilite et maintenance

### 4.2 Endpoints utiles Admin/Proprietaire

Proprietaire:
- `GET /proprietaires/`
- `POST /proprietaires/`
- `GET /proprietaires/{id}/`
- `PUT/PATCH /proprietaires/{id}/`
- `POST /proprietaires/{id}/desactiver/`
- `GET /proprietaires/{id}/biens/`
- `GET /proprietaires/{id}/comptabilite/`

Locataires:
- `GET /locataires/`
- `POST /locataires/`
- `GET /locataires/{id}/`
- `PUT/PATCH /locataires/{id}/`
- `GET /locataires/{id}/baux/`
- `GET /locataires/{id}/paiements/`

Biens:
- `POST /biens/`
- `PUT/PATCH /biens/{id}/`
- `DELETE /biens/{id}/`
- `GET /biens/mes-biens/`
- `GET /biens/mes-stats/`
- `POST /biens/{id}/photos/`
- `DELETE /biens/{id}/photos/{photo_pk}/`
- `POST /biens/{id}/videos/`
- `DELETE /biens/{id}/videos/{video_pk}/`

Baux:
- `POST /bail/`
- `POST /bail/{id}/resilier/`
- `POST /bail/{id}/renouveler/`

Paiements:
- `POST /paiements/`
- `POST /paiements/{id}/valider/`
- `POST /paiements/{id}/annuler/`

Comptabilite:
- `GET /comptabilite/`
- `POST /comptabilite/`
- `POST /comptabilite/{id}/calculer/`

## 5) Exemples payloads (Admin/Proprietaire)

Creation bien:

```json
{
  "adresse": "Sacre-Coeur 3",
  "description": "Appartement 3 pieces",
  "equipements": "Climatisation, parking",
  "loyer_hc": 250000,
  "charges": 25000,
  "latitude": 14.7167,
  "longitude": -17.4677,
  "categorie_id": 1,
  "type_appartement_id": 2
}
```

Creation bail:

```json
{
  "bien": 10,
  "locataire": 22,
  "date_entree": "2026-04-01",
  "date_sortie": "2027-03-31",
  "depot_garantie": 250000,
  "loyer_initial": 250000,
  "taux_revision_annuel": 2.0
}
```

Creation paiement:

```json
{
  "bail": 7,
  "locataire": 22,
  "date_paiement": "2026-04-03",
  "montant": 275000,
  "reference": "PAY-2026-04-0001",
  "statut": "EN_ATTENTE"
}
```

## 6) Codes HTTP a gerer cote frontend

- `200`: succes lecture/action
- `201`: ressource creee
- `204`: suppression sans contenu
- `400`: erreur de validation
- `401`: non authentifie (token absent/invalide)
- `403`: permission refusee (role insuffisant)
- `404`: ressource introuvable

## 7) Conseils integration frontend

- Stocker `access` et `refresh` de maniere securisee
- Mettre un interceptor HTTP pour refresh token automatique
- En cas de `401`, tenter refresh puis rejouer la requete
- En cas de `403`, afficher un message role insuffisant
- Afficher les erreurs de validation champ par champ (JSON d'erreurs Django)

## 8) Raccourci de verification rapide

1. Ouvrir Swagger: `http://127.0.0.1:8000/swagger/`
2. Faire login via `/api/auth/login/`
3. Copier le token access dans Authorize: `Bearer <token>`
4. Tester les endpoints selon le role
