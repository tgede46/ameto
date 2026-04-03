# 🏠 Système de Gestion Immobilière — Django

> Application de gestion locative complète : biens, baux, paiements, quittances et notifications.

---

## 📋 Table des matières

- [Énumérations](#-énumérations)
- [Modèles](#-modèles)
- [Signals Django](#-signals-django)
- [Règles de code globales](#-règles-de-code-globales)

---

## 🔖 Énumérations

Toutes les énumérations utilisent les `TextChoices` de Django.

### `StatusBien`
| Valeur | Description |
|---|---|
| `LOUE` | Bien actuellement loué |
| `VACANT` | Bien disponible à la location |
| `VENDRE` | Bien mis en vente |
| `EN_TRAVAUX` | Bien en cours de rénovation |

### `StatusBail`
| Valeur | Description |
|---|---|
| `EN_COURS` | Bail actif |
| `EXPIRE` | Bail arrivé à échéance |
| `RESILE` | Bail résilié avant terme |
| `EN_ATTENTE` | Bail en attente de signature/validation |

### `StatusPaiement`
| Valeur | Description |
|---|---|
| `PAYE` | Paiement effectué |
| `EN_ATTENTE` | Paiement déclaré, en attente de validation |
| `EN_RETARD` | Paiement non reçu après la date limite |
| `FIN_BAIL_PROCHE` | Notification préventive fin de bail |
| `VALIDE` | Paiement confirmé par l'admin/propriétaire |
| `IMPAYE` | Paiement annulé ou non reçu |

### `TypeNotification`
| Valeur | Description |
|---|---|
| `LOYER_IMPAYE` | Alerte loyer impayé |
| `FIN_BAIL_PROCHE` | Préavis fin de bail (3 mois) |
| `REVISION_LOYER` | Alerte révision annuelle du loyer |
| `QUITTANCE` | Quittance générée et disponible |
| `DOCUMENT` | Document généré (bail, état des lieux…) |

---

## 🗂 Modèles

### `Utilisateur` *(AbstractUser)*

Modèle utilisateur personnalisé. Défini dans `settings.py` : `AUTH_USER_MODEL = 'app.Utilisateur'`

| Champ | Type | Description |
|---|---|---|
| `nom` | `str` | Nom de famille |
| `prenom` | `str` | Prénom |
| `telephone` | `str` (unique) | Numéro de téléphone |
| `email` | `str` (unique) | Adresse email |
| `adresse` | `str` | Adresse postale |
| `mot_de_passe` | `str` | Haché automatiquement par Django |
| `actif` | `bool` (default=`True`) | Compte actif ou désactivé |
| `role` | `choices` | `ADMIN` / `PROPRIETAIRE` / `LOCATAIRE` |
| `created_at` | `datetime` | Auto — date de création |
| `updated_at` | `datetime` | Auto — date de modification |

**Méthodes :** `connexion()`, `deconnexion()`, `creation()`

---

### `Admin` *(hérite de Utilisateur)*

Accès complet à tous les biens, locataires, baux et paiements. Pas de champs supplémentaires.

---

### `Proprietaire` *(hérite de Utilisateur)*

| Champ | Type | Description |
|---|---|---|
| `nobre_logement` | `int` | Nombre de biens possédés (peut être calculé dynamiquement) |

**Relations :** `biens` → `OneToMany` vers `Bien`

---

### `Locataire` *(hérite de Utilisateur)*

| Champ | Type | Description |
|---|---|---|
| `date_naissance` | `date` | Date de naissance |
| `profession` | `str` | Profession |
| `personne_a_prevenir` | `str` | Nom + contact du garant |

**Relations :** `baux` → `OneToMany` vers `Bail` | `paiements` → `OneToMany` vers `Paiement`

---

### `Categorie`

| Champ | Type | Description |
|---|---|---|
| `libelle` | `str` | Ex : Appartement, Maison, Bureau, Parking, Local commercial, Terrain |
| `description` | `str` (nullable) | Description optionnelle |

**Méthodes :** `creer()`, `modifier()`, `supprimer()`

---

### `TypeAppartement`

| Champ | Type | Description |
|---|---|---|
| `libelle` | `str` | Ex : Studio, T1, T2, T3+, Chambre salon, Palais, Villa, Suite |
| `description` | `str` (nullable) | Description optionnelle |

**Méthodes :** `creer()`, `modifier()`, `supprimer()`

---

### `Bien`

| Champ | Type | Description |
|---|---|---|
| `adresse` | `str` | Rue, quartier, ville |
| `description` | `TextField` (max 5000) | Description du bien |
| `photos` | `JSONField` | Max 20 photos |
| `equipements` | `JSONField` | Ex : `['ascenseur', 'climatisation', 'parking']` |
| `loyer_hc` | `DecimalField` | Loyer hors charges en CFA |
| `charges` | `DecimalField` | Provisions charges |
| `latitude` | `FloatField` (nullable) | Coordonnée GPS |
| `longitude` | `FloatField` (nullable) | Coordonnée GPS |
| `statut` | `choices` | `StatusBien` — default `VACANT` |

**Relations :**
- `categorie` → `ForeignKey` → `Categorie` (`on_delete=PROTECT`)
- `type_appartement` → `ForeignKey` → `TypeAppartement` (nullable, `on_delete=SET_NULL`)
- `proprietaire` → `ForeignKey` → `Proprietaire` (`on_delete=CASCADE`)

**Méthodes :** `lister()`

**Règles métier :**
- Un `Bien` ne peut avoir qu'un seul `Bail` avec statut `EN_COURS` à la fois
- Statut → `LOUE` automatiquement à la création d'un `Bail`
- Statut → `VACANT` automatiquement à la résiliation d'un `Bail`

---

### `Bail`

| Champ | Type | Description |
|---|---|---|
| `date_entree` | `date` | Date d'entrée |
| `date_sortie` | `date` | Date de sortie prévue |
| `depot_garantie` | `DecimalField` | Max 3 × `loyer_initial` (validator custom) |
| `loyer_initial` | `DecimalField` | Loyer au moment de la signature |
| `taux_revision_annuel` | `FloatField` | Ex : `2.0` pour 2% par an |
| `statut` | `choices` | `StatusBail` — default `EN_ATTENTE` |

**Relations :**
- `bien` → `ForeignKey` → `Bien` (`on_delete=PROTECT`)
- `locataire` → `ForeignKey` → `Locataire` (`on_delete=PROTECT`)

**Méthodes :**
- `renouveler()` — prolonge `date_sortie`, crée un nouveau `Bail` `EN_COURS`
- `resilier()` — passe statut à `RESILE` + met `bien.statut` à `VACANT`
- `calculer_revision_loyer()` → retourne `loyer_initial × (1 + taux/100)`
- `generer_quittance()` → crée un objet `Quittance` lié au `Paiement` validé

**Règles métier :**
- Validator : `depot_garantie <= 3 × loyer_initial`
- Contrainte : un `Bien` ne peut avoir qu'un seul `Bail` `EN_COURS` (vérification dans `save()` ou `clean()`)
- Signal à la création → `bien.statut = LOUE`
- Signal à la résiliation → `bien.statut = VACANT`

---

### `Paiement`

| Champ | Type | Description |
|---|---|---|
| `date_paiement` | `date` | Date du paiement |
| `montant` | `DecimalField` | Montant payé |
| `reference` | `str` (unique) | Ex : numéro de reçu T-Money / Flooz |
| `statut` | `choices` | `StatusPaiement` — default `EN_ATTENTE` |

**Relations :**
- `bail` → `ForeignKey` → `Bail` (`on_delete=CASCADE`)
- `locataire` → `ForeignKey` → `Locataire` (`on_delete=PROTECT`)

**Méthodes :**
- `valider()` — passe statut à `VALIDE` + déclenche génération `Quittance` via signal
- `annuler()` — passe statut à `IMPAYE`

**Workflow statut :**
```
EN_ATTENTE → VALIDE  → (signal) → Quittance créée automatiquement
EN_ATTENTE → IMPAYE  → si non validé après délai
```

---

### `Quittance`

| Champ | Type | Description |
|---|---|---|
| `date_emission` | `date` | Auto — date du jour |
| `montant_total` | `DecimalField` | Montant total |
| `fichier_pdf` | `FileField` | Chemin vers le PDF généré |

**Relations :**
- `paiement` → `OneToOneField` → `Paiement` (`on_delete=CASCADE`)

**Méthodes :**
- `generer()` — génère le PDF avec ReportLab ou WeasyPrint
- `envoyer_quittance()` — envoie le PDF par email (et SMS avec lien)

---

### `Notification`

| Champ | Type | Description |
|---|---|---|
| `message` | `str` | Contenu de la notification |
| `date_envoi` | `datetime` | Auto — date d'envoi |
| `lue` | `bool` (default=`False`) | Notification lue ou non |
| `type` | `choices` | `TypeNotification` |

**Relations :**
- `destinataire` → `ForeignKey` → `Utilisateur` (`on_delete=CASCADE`)

**Méthodes :**
- `envoyer()` — envoie email/SMS + notification push
- `marquer_lu()` — `lue = True`

---

### `SystemeComptable`

| Champ | Type | Description |
|---|---|---|
| `periode_debut` | `date` | Début de la période comptable |
| `total_revenus` | `DecimalField` | Somme des loyers perçus sur la période |
| `total_depense` | `DecimalField` | Somme des dépenses (travaux, taxes, frais) |
| `benefice_net` | `DecimalField` | Calculé : `total_revenus - total_depense` |

**Relations :**
- `proprietaire` → `ForeignKey` → `Proprietaire` (`on_delete=CASCADE`)

**Méthodes :**
- `calculer()` — recalcule `benefice_net` à partir des `Paiement` avec statut `VALIDE` sur la période

---

## ⚡ Signals Django

| Signal | Déclencheur | Action |
|---|---|---|
| `post_save` sur `Bail` | Création d'un bail | `bien.statut = LOUE` |
| `post_save` sur `Bail` | Résiliation (`statut = RESILE`) | `bien.statut = VACANT` |
| `post_save` sur `Paiement` | Validation (`statut = VALIDE`) | Création automatique d'une `Quittance` |

---

## ⚙️ Règles de code globales

- Utiliser `AbstractUser` pour le modèle `Utilisateur` (`AUTH_USER_MODEL = 'app.Utilisateur'` dans `settings.py`)
- Héritage multi-tables Django : `Admin`, `Proprietaire`, `Locataire` héritent de `Utilisateur`
- Utiliser des classes `TextChoices` Django pour toutes les énumérations
- Ajouter `created_at` et `updated_at` (`auto_now_add` / `auto_now`) sur **tous** les modèles
- Définir `__str__` et `Meta` (`verbose_name`, `verbose_name_plural`) sur chaque modèle
- Organiser avec des commentaires de section dans `models.py`

---

