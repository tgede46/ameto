# Amétô - Plateforme de Gestion Immobilière

Amétô est une application web moderne de gestion immobilière conçue pour simplifier la recherche, la location et la gestion quotidienne des biens immobiliers au Togo. L'interface a été pensée pour offrir une expérience utilisateur haut de gamme, fluide et intuitive.

## 🌟 Fonctionnalités Principales

### Pour les locataires / candidats :
- **Exploration interactive** : Recherche de biens avec filtres avancés, affichage en grille ou sur carte interactive.
- **Galerie immersive** : Visualisation des biens en plein écran avec un système de carrousel fluide.
- **Candidature numérique** : Soumission de dossier directement depuis l'annonce.
- **Gestion des favoris** : Sauvegarde des biens préférés (Coup de cœur).

### Espace Client (Dashboard) :
- **Suivi financier** : Visualisation des paiements et de l'évolution du loyer via des graphiques interactifs (Chart.js).
- **Mon Dossier** : Gestion sécurisée des pièces justificatives (CNI, fiches de paie, garant).
- **Paiements en ligne** : Workflow de déclaration de paiement intégré (support T-Money, Flooz, Virement) avec upload de preuve.
- **Maintenance** : Système de signalement d'incidents (plomberie, électricité, etc.) avec suivi d'urgence.

## 🎨 Design & Expérience Utilisateur
L'application met l'accent sur les micro-interactions et la fluidité :
- Transitions de pages douces avec **Framer Motion**.
- Éléments 3D interactifs (globe) propulsés par **React Three Fiber**.
- Typographie soignée (Inter) et espacements généreux.
- Composants "Sticky" (carte de réservation, filtres) pour une navigation sans effort.

## 🛠️ Technologies Utilisées

- **Cœur** : React 19, Vite, React Router v7
- **Style** : Tailwind CSS v4
- **Animations & 3D** : Framer Motion, Three.js, @react-three/fiber, @react-three/drei
- **Visualisation de données** : Chart.js, react-chartjs-2
- **Cartographie** : React Leaflet
- **Icônes** : Lucide React
- **Gestion d'état** : Redux Toolkit (pré-configuré)

## 🚀 Installation et Lancement

1. **Cloner le projet et installer les dépendances**
   ```bash
   # Utiliser l'option legacy-peer-deps si vous rencontrez des conflits de version avec React 19 / Vite 8
   npm install --legacy-peer-deps
   ```

2. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:5173`.

3. **Compiler pour la production**
   ```bash
   npm run build
   ```
   *Note : Le projet utilise le "Code Splitting" dynamique (Lazy Loading) pour garantir un chargement initial rapide.*

## 📂 Structure du projet (src/)

- `/assets` : Images, logos et ressources statiques.
- `/components` : Composants réutilisables (Header, CategoryBar, PageTransition, Hero3D...).
- `/pages` : Vues principales de l'application (Home, Dashboard, PropertyDetails, Login...).
- `/store` : Configuration Redux (Slices utilisateurs et propriétés).
- `App.jsx` : Configuration du routage avec Lazy Loading et Suspense.
- `index.css` : Configuration globale Tailwind et charte graphique CSS (variables).

## 📝 Charte Graphique
Voir le fichier `CharteGraphique.md` pour le détail des couleurs, de la typographie et des principes UI utilisés dans l'application.
