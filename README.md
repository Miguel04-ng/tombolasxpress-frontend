# TombolaXpress — Frontend v1.0

> Interface React.js pour la plateforme de tombola en ligne TombolaXpress  
> Marché Cameroun / Afrique Centrale — Mobile Money MTN & Orange

---

## Stack Technique

| Technologie | Usage |
|---|---|
| React 18 + Vite | Framework UI + bundler |
| Tailwind CSS | Design system |
| React Router v6 | Navigation + route guards |
| TanStack Query | Fetching + cache API |
| Zustand | Auth state management |
| Axios | Client HTTP + intercepteurs JWT |
| Framer Motion | Animations |
| React Hot Toast | Notifications |
| Google Material Icons | Icônes UI |

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# En développement, laisser VITE_API_URL vide (proxy Vite vers localhost:5000)

# 3. Lancer en développement
npm run dev
# → http://localhost:3000

# 4. Build production
npm run build
npm run preview
```

---

## Structure

```
src/
├── App.jsx                    # Routeur principal + guards
├── main.jsx                   # Entry point + providers
├── index.css                  # Design system Tailwind
├── components/
│   ├── common/                # Spinner, Modal, EmptyState, StatCard…
│   ├── layout/                # MainLayout, AdminLayout, AuthLayout
│   ├── tombola/               # TombolaCard
│   └── paiement/              # AchatModal
├── pages/
│   ├── public/                # HomePage, TombolaDetailPage, GagnantsPage, VerifierTicketPage
│   ├── auth/                  # ConnexionPage, InscriptionPage, ResetPage, ResetPassword
│   ├── user/                  # DashboardPage, MesTicketsPage, MesPaiementsPage, PaiementPage, ProfilPage
│   └── admin/                 # AdminDashboardPage, AdminTombolasPage, AdminUsersPage,
│                              # AdminTransactionsPage, AdminTiragePage
├── services/
│   ├── api.js                 # Instance Axios + intercepteurs
│   ├── auth.service.js
│   ├── tombola.service.js
│   └── index.js               # Tous les services (paiement, ticket, tirage, admin…)
├── store/
│   └── authStore.js           # Zustand — token JWT + user
└── utils/
    └── helpers.js             # formatFCFA, formatDate, badges…
```

---

## Pages disponibles

### Publiques (sans authentification)
| Route | Page | Description |
|---|---|---|
| `/` | HomePage | Liste des tombolas actives + hero + stats |
| `/tombolas/:id` | TombolaDetailPage | Détail tombola + liste tickets + achat |
| `/gagnants` | GagnantsPage | Historique des gagnants — transparence |
| `/verifier-ticket` | VerifierTicketPage | Vérification authenticité d'un ticket |

### Auth
| Route | Page |
|---|---|
| `/auth/connexion` | Login |
| `/auth/inscription` | Inscription |
| `/auth/mot-de-passe-oublie` | Demande reset |
| `/auth/reset-password?token=...` | Reset password |

### Utilisateur (JWT requis)
| Route | Page |
|---|---|
| `/dashboard` | Vue d'ensemble + tombolas actives |
| `/mes-tickets` | Tous mes tickets avec filtres |
| `/mes-paiements` | Historique transactions |
| `/mes-participations` | Participations par tombola |
| `/notifications` | Mes notifications |
| `/profil` | Modifier profil + changer mot de passe |
| `/paiement/:tombolaId` | Flux d'achat 4 étapes (session → push MoMo → polling → résultat) |

### Admin (role admin requis)
| Route | Page |
|---|---|
| `/admin` | Dashboard — KPIs globaux + tombolas actives |
| `/admin/tombolas` | CRUD tombolas + upload photo |
| `/admin/utilisateurs` | Liste users + blocage/déblocage |
| `/admin/transactions` | Audit financier complet + export CSV |
| `/admin/tirage/:id` | Lancer tirage CSPRNG + confirmation + résultat |

---

## Flux de Paiement (Mobile Money)

```
/paiement/:tombolaId
  │
  ├── Étape 1 : Choix du nombre de tickets (1–50)
  ├── Étape 2 : Sélection opérateur (MTN / Orange) + numéro
  ├── Étape 3 : Récapitulatif + POST /api/paiements/session
  │                             + POST /api/paiements/initier
  │                             → Push MoMo envoyé sur le téléphone
  │
  └── Étape 4 : Attente confirmation (polling /api/paiements/:id/statut)
                → Confirmé → tickets générés → SMS envoyé
                → Échoué / Expiré → option retry
```

---

## Connexion au Backend

```env
# .env
VITE_API_URL=http://localhost:5000/api   # Développement
# VITE_API_URL=https://api.tombolaxpress.cm/api  # Production
```

Le proxy Vite (`vite.config.js`) redirige `/api/*` vers `localhost:5000` en développement.

---

## Build & Déploiement

```bash
npm run build
# → dist/ prêt à déployer sur Nginx / Vercel / Netlify

# Nginx : pointer root vers dist/ et rediriger tout vers index.html
# location / { try_files $uri $uri/ /index.html; }
```

---

*TombolaXpress Frontend — Version 1.0 — Cameroun*
