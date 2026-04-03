# 🏠 GestiLoc — Système de Gestion Immobilière (Lomé, Togo)

> Plateforme de gestion locative complète : biens, baux, paiements, quittances, maintenance et notifications.
> Développée avec **Django 6 + Django REST Framework**, pour une utilisation à Lomé (T-Money / Flooz).

---

## 📋 Table des matières

- [Architecture du projet](#-architecture-du-projet)
- [Technologies utilisées](#-technologies-utilisées)
- [Installation et démarrage](#-installation-et-démarrage)
- [Applications Django](#-applications-django)
- [Scénario d'utilisation complet](#-scénario-dutilisation-complet)
  - [Acteur 1 — Propriétaire (M. Koffi)](#acteur-1--propriétaire-m-koffi-investisseur-avec-5-biens)
  - [Acteur 2 — Client (Mme Afi)](#acteur-2--client-mme-afi-chercheuse-dappartement)
  - [Acteur 3 — Admin Agence (M. Yao)](#acteur-3--admin-agence-m-yao-gestionnaire)
  - [Phase Maintenance](#-phase-maintenance-1-mois-après-la-signature)
  - [Phase Vente](#-phase-vente-autre-bien)
  - [Fin de mois (automatique)](#-fin-de-mois-automatique)
- [Modèles de données](#-modèles-de-données)
- [Signals Django](#-signals-django)


---

## 🛠 Technologies utilisées

| Technologie | Version | Rôle |
|---|---|---|
| Python | 3.14+ | Langage principal |
| Django | 6.0.3 | Framework web backend |
| Django REST Framework | 3.16+ | API REST |
| SQLite | — | Base de données (développement) |
| Pillow | 12+ | Gestion des images (photos biens) |
| ReportLab | 4+ | Génération de PDF (quittances, baux) |
| python-decouple | 3.8+ | Variables d'environnement |

---

## 🚀 Installation et démarrage

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd projet_django
```

### 2. Créer et activer l'environnement virtuel

```bash
# Créer le venv (une seule fois)
python3 -m venv venv

# Activer le venv (à chaque session)
source venv/bin/activate          # Linux / macOS
# ou
venv\Scripts\activate             # Windows
```

### 3. Installer les dépendances

```bash
pip install -r location_app/requirements.txt
```

### 4. Appliquer les migrations

```bash
python location_app/manage.py migrate
```

### 5. Créer un super-utilisateur (Admin)

```bash
python location_app/manage.py createsuperuser
```

### 6. Lancer le serveur de développement

```bash
python location_app/manage.py runserver
```

🌐 Application disponible sur : **http://127.0.0.1:8000/**  
🔐 Interface admin Django : **http://127.0.0.1:8000/admin/**  
📡 API REST (DRF) : **http://127.0.0.1:8000/api/**

---

## 📦 Applications Django

| App | Modèles principaux | Description |
|---|---|---|
| `utilisateur` | `Utilisateur`, `Admin`, `Proprietaire`, `Locataire` | Gestion des comptes et rôles |
| `biens` | `Categorie`, `TypeAppartement`, `Bien`, `Bail`, `Paiement`, `Quittance` | Gestion immobilière complète |
| `comptabilite` | `SystemeComptable` | Rapports financiers par propriétaire |
| `notification` | `Notification` | Alertes email / SMS / push |

---

## 🎭 Scénario d'utilisation complet

> Scénario **end-to-end** réaliste couvrant **location, vente et maintenance**,  
> pour **3 acteurs principaux**, simulant une utilisation quotidienne à **Lomé, Togo**.  
> Plus de **100 interactions traçables** dans le système.

---

### Acteur 1 — Propriétaire : M. Koffi *(investisseur avec 5 biens)*

| Étape | Action | État système |
|---|---|---|
| **1** | M. Koffi se connecte au portail Propriétaire *(login via T-Money linked)* | Session ouverte |
| **2** | Contacte l'agence admin via chat intégré : *"Je veux louer mon T2 à Tokoin"* | Message envoyé à M. Yao |
| **3** | Admin crée fiche bien : 15 photos, adresse *"Rue des Palmiers, Tokoin"*, loyer **150 000 CFA HC**, T-Money `123456789` | `Bien` créé — statut `VACANT` |
| **4** | M. Koffi valide la fiche → Bien publié | `Bien.statut = VACANT` (disponible) |
| **5** | Dashboard : taux d'occupation **80%**, rendement net **7,2%** | `SystemeComptable.calculer()` |

---

### Acteur 2 — Client : Mme Afi *(chercheuse d'appartement)*

| Étape | Action | État système |
|---|---|---|
| **1** | Sur portail Client *(anonyme)*, filtre : *"T2, < 200k CFA, Tokoin"* → Voit fiche avec photos, Maps, coordonnées proprio | `Bien.lister()` |
| **2** | Candidature : Upload CNI, fiches de paie *(revenus 250k CFA)*, garant *(son frère)* | Dossier transmis à l'admin |
| **3** | Admin approuve, score de confiance **95%** → Visite organisée *(calendrier sync)* | Notification envoyée à Mme Afi |
| **4** | Après visite, paie caution **450 000 CFA** via Flooz → Upload reçu *(screenshot daté 05/03/2026)* | `Paiement` créé — statut `EN_ATTENTE` |
| **5** | Notification *"Paiement déclaré"* → statut passe à **"En attente confirmation"** | `TypeNotification.QUITTANCE` envoyée |

---

### Acteur 3 — Admin Agence : M. Yao *(gestionnaire)*

| Étape | Action | État système |
|---|---|---|
| **1** | Voit alerte *"Nouveau paiement T2 Tokoin"* → Vérifie les documents de Mme Afi | `Notification` reçue |
| **2** | Contacte M. Koffi pour validation → M. Koffi vérifie sur Flooz et confirme | Échange async |
| **3** | Admin clique **"Confirmer"** → Système génère : | |
| | 📄 **Bail PDF** *(dates : 01/04/2026 → 01/04/2028)* | `Bail.statut = EN_COURS` |
| | 📋 **État des lieux d'entrée** *(photos uploadées)* | Document attaché au bail |
| | 🧾 **Quittance de caution** | `Quittance` créée via signal |
| **4** | Notifications Email + SMS envoyées à tous les acteurs | `Notification.envoyer()` |
| **5** | Statut du bien mis à jour → **"Loué"** | `Bien.statut = LOUE` *(signal post_save Bail)* |

---

### 🔧 Phase Maintenance *(1 mois après la signature)*

```
Mme Afi signale une fuite de douche
  └── Upload : photos avant + description du problème
        └── 🔔 Alerte push → M. Koffi reçoit la notification
              └── M. Koffi approuve budget travaux : 50 000 CFA
                    └── Plombier intervient
                          └── Mme Afi upload : photos après + reçu
                                └── M. Koffi rembourse via T-Money
                                      └── ✅ Historique mis à jour
                                            └── Score de confiance Mme Afi : +5%
```

---

### 🏷️ Phase Vente *(autre bien de M. Koffi)*

```
M. Koffi met une villa en vente → Prix : 800 000 000 CFA
  └── Client B. voit la fiche, organise une visite
        └── Signature du compromis
              └── Acompte : 80 000 000 CFA par virement
                    └── Statut : "Sous compromis"
                          └── [Après 30j] Auto-relance notaire
                                └── Statut : "Vendu" ✅
```

---

### 📅 Fin de mois *(traitement automatique)*

| Tâche automatique | Détail |
|---|---|
| 🧾 **Génération quittance loyer** | 150 000 CFA − 10% agence = **135 000 CFA** virés au propriétaire |
| 📊 **Dashboard propriétaire** | +1 200 000 CFA de rentrées sur le mois |
| 🔔 **Alerte révision de loyer** | +3% IRL détecté → notification envoyée à M. Koffi |
| 📁 **Export rapport fiscal DGI** | Généré par l'admin pour la Direction Générale des Impôts |

---

## 🗃 Modèles de données

```
Utilisateur (AbstractUser)
 ├── Admin
 ├── Proprietaire ──────────────────────── Bien (1→N)
 │                                          ├── Categorie
 │                                          ├── TypeAppartement
 │                                          └── Bail (1→N)
 │                                               └── Paiement (1→N)
 └── Locataire ─────────────────────────── Bail (1→N)
        │                                  Paiement (1→N)
        │                                       └── Quittance (1→1)
        └── Notification (via Utilisateur)

SystemeComptable ─────────────── Proprietaire
```

---

## ⚡ Signals Django

| Signal | Déclencheur | Action automatique |
|---|---|---|
| `post_save` sur `Bail` | Création / `statut = EN_COURS` | `bien.statut = LOUE` |
| `post_save` sur `Bail` | `statut = RESILE` | `bien.statut = VACANT` |
| `post_save` sur `Paiement` | `statut = VALIDE` | Création automatique de `Quittance` + `Notification` |

---

## 👥 Rôles utilisateurs

| Rôle | Accès |
|---|---|
| `ADMIN` | Accès complet — gestion biens, baux, utilisateurs, rapports |
| `PROPRIETAIRE` | Ses propres biens, baux, paiements, comptabilité |
| `LOCATAIRE` | Ses baux, paiements, notifications, signalement maintenance |

---

## 📝 Licence

Projet académique — Semestre 6 POO — Université de Lomé, 2026.
