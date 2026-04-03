# Charte Graphique - Amétô

Cette charte graphique documente les choix de design, les couleurs, la typographie et les principes d'interface utilisés dans le projet Amétô.

## 1. Identité Visuelle et Couleurs

L'interface utilise une approche "clean" (beaucoup d'espace blanc) avec une couleur de marque forte pour guider l'action de l'utilisateur.

### Couleur Principale (Brand)
La couleur principale est un rouge/rose vibrant, utilisé pour les boutons d'action principaux (Call to Action), les icônes actives (Favoris) et les badges.
- **Brand 500 (Primaire)** : `#FF385C` (Couleur d'accentuation principale)
- **Brand 600 (Hover/Active)** : `#e8152e`
- **Brand 50 (Fond léger)** : `#fff0f1` (Utilisé pour les fonds de badges ou alertes légères)

### Couleurs Neutres (Textes et Fonds)
Les gris sont utilisés pour hiérarchiser l'information sans surcharger l'œil.
- **Surface / Background** : `#FFFFFF` (Blanc pur) ou `#F9FAFB` (Gris très clair)
- **Texte Primaire (Titres)** : `#222222` ou `text-gray-900`
- **Texte Secondaire (Descriptions)** : `#717171` ou `text-gray-500`
- **Bordures et Séparateurs** : `#EBEBEB` ou `border-gray-200`

### Couleurs de Feedback (Statuts)
- **Succès / Validé** : Vert (`#10B981` ou `text-green-500`)
- **Avertissement / En attente** : Orange/Or (`#E9A319` ou `text-orange-500`)
- **Erreur / Urgent** : Rouge/Brand (`#FF385C`)

## 2. Typographie

L'application utilise une police sans-serif moderne, optimisée pour la lisibilité sur les écrans numériques.

- **Famille de police principale** : `Inter`, system-ui, sans-serif
- **Titres (h1, h2, h3)** : Poids `font-extrabold` (800) ou `font-bold` (700). Espacement des lettres légèrement réduit (`tracking-tight`).
- **Corps de texte (p)** : Poids normal (`font-normal`), taille de base `15px` ou `16px`.
- **Labels / Badges** : Souvent en majuscules (`uppercase`), texte très petit (`text-[10px]` ou `text-xs`), avec un espacement des lettres large (`tracking-widest`) et en `font-bold`.

## 3. Formes et Conteneurs

Amétô utilise des formes arrondies pour un rendu moderne, accueillant et "premium".

- **Boutons standards** : Rayon de bordure important (`rounded-xl` ou `rounded-2xl`).
- **Pillules (Recherche, Badges)** : Totalement arrondies (`rounded-full`).
- **Cartes (Propriétés, Dashboard)** : Coins très arrondis (`rounded-3xl` ou `rounded-[40px]`).
- **Ombres (Shadows)** : Ombres douces et diffuses (`shadow-sm`, `shadow-xl`) pour détacher les éléments du fond blanc, parfois teintées avec la couleur de la marque (ex: `shadow-brand-500/20`).

## 4. Principes d'Animation (Motion)

La fluidité est au cœur de l'expérience ImmoTech, gérée principalement via **Framer Motion** et les transitions CSS natives.

- **Durée standard** : `0.2s` à `0.3s` avec une courbe de bézier (`ease-out`).
- **Boutons et Liens** : Effet de réduction au clic (`active:scale-95`).
- **Cartes de propriétés** : Léger zoom sur l'image au survol (`group-hover:scale-105`) avec une transition lente (`duration-500` ou `duration-700`).
- **Transitions de pages** : Fondu enchaîné (`opacity: 0 -> 1`) avec un léger mouvement vertical (`y: 10 -> 0`).
- **Modales** : Apparition depuis le bas avec un effet de rebond léger (`type: "spring"`).

## 5. Iconographie

Les icônes proviennent de la bibliothèque **Lucide React**.
- **Style** : Lignes épurées (stroke-width entre `1.5` et `2.5` selon le contexte).
- **Tailles standards** : 
  - Micro-infos (localisation, étoile) : `14px` - `16px`
  - Boutons / Actions : `20px` - `24px`
  - Features clés (Détails) : `28px` - `32px`

## 6. Structure UI (Page d'accueil)

1. **Header Sticky** : Blanc translucide avec effet de flou (`backdrop-blur-md`). Contient le logo, une barre de recherche "Pill" et le menu utilisateur.
2. **Category Bar** : Barre de défilement horizontal cachée (`no-scrollbar`). L'élément actif est souligné par une ligne animée noire.
3. **Grille de Propriétés** : Design aéré, ratio d'image carré (`aspect-square`), informations alignées proprement en dessous de l'image.
4. **Hero 3D** : Élément de fond interactif apportant une touche technologique subtile sans perturber la lecture.
