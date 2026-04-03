# Scénarios d'utilisation - Authentification à double facteur (2FA)

## Prérequis
- Utilisateur doit être authentifié (avoir un token JWT)
- Ajouter le token dans les headers : `Authorization: Bearer <votre_token>`

---

## Scénario 1 : Activer 2FA avec Google Authenticator (TOTP)

### Étape 1 : Activer TOTP
```http
POST http://localhost:8000/api/2fa/enable/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "methode": "TOTP"
}
```

**Réponse attendue :**
```json
{
  "message": "TOTP configuré. Veuillez scanner le QR code et vérifier avec un code.",
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backup_codes": [
    "1234-5678-9012",
    "2345-6789-0123",
    "3456-7890-1234",
    "4567-8901-2345",
    "5678-9012-3456",
    "6789-0123-4567",
    "7890-1234-5678",
    "8901-2345-6789",
    "9012-3456-7890",
    "0123-4567-8901"
  ],
  "methode": "TOTP"
}
```

### Étape 2 : Scanner le QR code
1. Ouvrir Google Authenticator sur votre téléphone
2. Cliquer sur "+" pour ajouter un compte
3. Choisir "Scanner un code QR"
4. Scanner l'image du `qr_code` (vous pouvez afficher le base64 dans un navigateur)
5. OU entrer manuellement le `secret` dans l'application

### Étape 3 : Vérifier avec le code TOTP
```http
POST http://localhost:8000/api/2fa/verify/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "code": "123456"
}
```
*Remplacer "123456" par le code affiché dans Google Authenticator*

**Réponse attendue :**
```json
{
  "message": "2FA activée avec succès.",
  "backup_codes": [
    "1234-5678-9012",
    "2345-6789-0123",
    ...
  ]
}
```

### Étape 4 : Sauvegarder les codes de secours
**IMPORTANT** : Conserver les backup_codes dans un endroit sûr. Ils permettent de se connecter si vous perdez votre téléphone.

---

## Scénario 2 : Activer 2FA avec code par EMAIL

### Étape 1 : Activer EMAIL
```http
POST http://localhost:8000/api/2fa/enable/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "methode": "EMAIL"
}
```

**Réponse attendue :**
```json
{
  "message": "Code envoyé par email. Veuillez vérifier votre boîte de réception.",
  "methode": "EMAIL"
}
```

### Étape 2 : Récupérer le code dans votre email
Vous recevrez un email avec un code à 6 chiffres, valide pendant **10 minutes**.

Exemple d'email :
```
Sujet: Code de vérification 2FA

Votre code de vérification à deux facteurs est : 987654

Ce code expire dans 10 minutes.
```

### Étape 3 : Vérifier avec le code EMAIL
```http
POST http://localhost:8000/api/2fa/verify/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "code": "987654"
}
```

**Réponse attendue :**
```json
{
  "message": "2FA activée avec succès.",
  "backup_codes": [
    "1234-5678-9012",
    "2345-6789-0123",
    ...
  ]
}
```

---

## Scénario 3 : Vérifier le statut 2FA

```http
GET http://localhost:8000/api/2fa/status/
Authorization: Bearer <votre_token>
```

**Réponse si 2FA activée :**
```json
{
  "id": 1,
  "is_enabled": true,
  "methode": "TOTP",
  "methode_display": "Google Authenticator (TOTP)",
  "backup_codes_count": 10,
  "verified_at": "2026-03-20T10:30:00Z",
  "created_at": "2026-03-20T10:25:00Z",
  "updated_at": "2026-03-20T10:30:00Z"
}
```

**Réponse si 2FA non activée :**
```json
{
  "is_enabled": false,
  "methode": null,
  "backup_codes_count": 0
}
```

---

## Scénario 4 : Utiliser un code de secours (backup code)

**Cas d'usage :** Vous avez perdu votre téléphone ou ne pouvez pas recevoir d'email.

```http
POST http://localhost:8000/api/2fa/verify/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "code": "1234-5678-9012"
}
```

**Note :** Le code de secours est supprimé après utilisation (usage unique).

**Réponse :**
```json
{
  "message": "2FA activée avec succès.",
  "backup_codes": [
    "2345-6789-0123",
    "3456-7890-1234",
    ...
  ]
}
```

---

## Scénario 5 : Régénérer les codes de secours

**Cas d'usage :** Vous avez utilisé plusieurs codes de secours et souhaitez en générer de nouveaux.

```http
POST http://localhost:8000/api/2fa/regenerate-backup/
Authorization: Bearer <votre_token>
```

**Réponse :**
```json
{
  "message": "Codes de secours régénérés.",
  "backup_codes": [
    "9876-5432-1098",
    "8765-4321-0987",
    "7654-3210-9876",
    "6543-2109-8765",
    "5432-1098-7654",
    "4321-0987-6543",
    "3210-9876-5432",
    "2109-8765-4321",
    "1098-7654-3210",
    "0987-6543-2109"
  ]
}
```

**IMPORTANT :** Les anciens codes sont remplacés par les nouveaux.

---

## Scénario 6 : Changer de méthode (TOTP → EMAIL)

**Cas d'usage :** Vous utilisez TOTP mais souhaitez passer à EMAIL.

```http
POST http://localhost:8000/api/2fa/change-method/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "methode": "EMAIL"
}
```

**Réponse :**
```json
{
  "message": "Méthode changée vers EMAIL. Code envoyé par email.",
  "methode": "EMAIL"
}
```

**Note :** La 2FA est temporairement désactivée. Vous devez vérifier le code reçu par email avec `POST /api/2fa/verify/`.

---

## Scénario 7 : Changer de méthode (EMAIL → TOTP)

```http
POST http://localhost:8000/api/2fa/change-method/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "methode": "TOTP"
}
```

**Réponse :**
```json
{
  "message": "Méthode changée vers TOTP. Veuillez scanner le QR code et vérifier.",
  "secret": "NEWJBSWY3DPEHPK3PXP",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "methode": "TOTP"
}
```

**Note :** Vous devez scanner le nouveau QR code et vérifier avec `POST /api/2fa/verify/`.

---

## Scénario 8 : Désactiver la 2FA

**Cas d'usage :** Vous souhaitez complètement désactiver la 2FA.

### Avec code TOTP (si méthode = TOTP)
```http
POST http://localhost:8000/api/2fa/disable/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "code": "123456"
}
```

### Avec code EMAIL (si méthode = EMAIL)
```http
POST http://localhost:8000/api/2fa/disable/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "code": "987654"
}
```

### Avec code de secours
```http
POST http://localhost:8000/api/2fa/disable/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "code": "1234-5678-9012"
}
```

**Réponse :**
```json
{
  "message": "2FA désactivée avec succès."
}
```

---

## Scénario 9 : Gestion des erreurs courantes

### Erreur : Code expiré (EMAIL)
```http
POST http://localhost:8000/api/2fa/verify/
{
  "code": "987654"
}
```

**Réponse (après 10 minutes) :**
```json
{
  "detail": "Code email invalide ou expiré."
}
```

**Solution :** Redemander un nouveau code avec `POST /api/2fa/enable/` avec `methode: EMAIL`.

### Erreur : Code TOTP invalide
```json
{
  "detail": "Code TOTP invalide."
}
```

**Causes possibles :**
- Code déjà utilisé (les codes TOTP changent toutes les 30 secondes)
- Horloge du téléphone désynchronisée
- Mauvais secret scanné

### Erreur : 2FA non configurée
```json
{
  "detail": "2FA non configurée. Veuillez d'abord activer la 2FA."
}
```

**Solution :** Activer d'abord avec `POST /api/2fa/enable/`.

### Erreur : Format de code invalide
```json
{
  "code": ["Le code doit contenir uniquement des chiffres."]
}
```

**Solution :** Envoyer un code à 6 chiffres uniquement.

---

## Scénario 10 : Intégration dans le flux de connexion

**Flux complet avec 2FA :**

### 1. Connexion normale
```http
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponse :**
```json
{
  "utilisateur": {
    "id": 1,
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    ...
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. Vérifier si 2FA activée
```http
GET http://localhost:8000/api/2fa/status/
Authorization: Bearer <access_token>
```

### 3. Si 2FA activée et méthode = EMAIL
L'application doit demander à l'utilisateur d'activer l'envoi du code :
```http
POST http://localhost:8000/api/2fa/enable/
Authorization: Bearer <access_token>

{
  "methode": "EMAIL"
}
```

### 4. Demander le code à l'utilisateur et vérifier
```http
POST http://localhost:8000/api/2fa/verify/
Authorization: Bearer <access_token>

{
  "code": "123456"
}
```

---

## Tests avec curl

### Activer TOTP
```bash
curl -X POST http://localhost:8000/api/2fa/enable/ \
  -H "Authorization: Bearer <votre_token>" \
  -H "Content-Type: application/json" \
  -d '{"methode": "TOTP"}'
```

### Vérifier code
```bash
curl -X POST http://localhost:8000/api/2fa/verify/ \
  -H "Authorization: Bearer <votre_token>" \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

### Vérifier statut
```bash
curl -X GET http://localhost:8000/api/2fa/status/ \
  -H "Authorization: Bearer <votre_token>"
```

---

## Notes importantes

1. **Codes TOTP** : Changent toutes les 30 secondes
2. **Codes EMAIL** : Valides pendant 10 minutes
3. **Backup codes** : Usage unique, conservez-les en sécurité
4. **QR code** : Format base64, peut être affiché directement dans un `<img>` HTML
5. **Configuration email** : Nécessaire pour la méthode EMAIL (SMTP dans settings.py)
