# Projet Avis Google - Version Intermédiaire

Système automatisé de collecte d'avis clients pour cabinet de podologie, intégré avec Google Calendar et Doctolib.

## 📋 Vue d'ensemble

Ce projet permet de :
- ✅ Récupérer automatiquement les RDV terminés depuis Google Calendar (synchronisé avec Doctolib)
- ✅ Envoyer un email automatique au patient avec un lien d'avis unique
- ✅ Collecter les avis via une interface web simple et moderne
- ✅ Rediriger les avis positifs (≥4★) vers Google Avis
- ✅ Envoyer les avis négatifs (<4★) par email au podologue
- ✅ Prévenir les votes multiples

## 🏗️ Architecture

```
projet/
├── architecture.md          # Documentation technique complète
├── Avis-google-intermediraire/
│   ├── back/               # Backend NestJS
│   │   ├── src/
│   │   │   ├── rdv/       # Gestion des rendez-vous
│   │   │   ├── vote/      # Gestion des votes
│   │   │   ├── mail/      # Service d'envoi d'emails
│   │   │   ├── google/    # Intégration Google Calendar
│   │   │   ├── cron/      # Tâche cron de synchronisation
│   │   │   └── config/    # Configuration
│   │   ├── scripts/       # Scripts utilitaires
│   │   └── data/          # Base de données SQLite
│   └── front/             # Frontend React
│       └── src/
│           ├── components/ # Composants UI
│           └── App.js     # Application principale
└── README.md              # Ce fichier
```

## 🚀 Installation rapide

### Prérequis
- Node.js 18+
- Compte Google avec accès à Calendar API
- Serveur SMTP (ou compte Mailtrap pour les tests)

### 1. Backend

```bash
cd Avis-google-intermediraire/back
npm install
cp env.example .env
```

Configurer `.env` avec vos paramètres (voir `back/README.md`).

**Configuration Google Calendar :**
```bash
# 1. Placer credentials.json à la racine du backend
# 2. Générer le token d'authentification
npm run generate-google-token
# 3. Tester la connexion
npm run test-google-calendar
```

**Démarrer le backend :**
```bash
npm run start:dev
```

Le backend démarre sur `http://localhost:3000`

### 2. Frontend

```bash
cd Avis-google-intermediraire/front
npm install
cp env.example .env
```

Configurer `.env` :
```env
REACT_APP_API_URL=http://localhost:3000
```

**Démarrer le frontend :**
```bash
npm start
```

Le frontend démarre sur `http://localhost:3001`

## 🔄 Flux complet

### 1. Synchronisation automatique (Backend)
```
Google Calendar (Doctolib sync)
       ↓
Cron (toutes les 15 min)
       ↓
Récupération RDV terminés
       ↓
Création entrée DB + Token unique
       ↓
Email automatique au patient
```

### 2. Vote patient (Frontend)
```
Patient clique sur lien email
       ↓
Validation du token
       ↓
Affichage étoiles 1-5
       ↓
┌─────────┴─────────┐
Note ≥ 4★         Note < 4★
    ↓                 ↓
Redirect          Formulaire
Google Avis       commentaire
                      ↓
                 Email interne
                  podologue
```

## 📡 API Endpoints

### Rendez-vous
- `POST /api/rdv` - Créer un RDV manuellement
- `POST /api/rdv/:id/send-mail` - Renvoyer l'email

### Votes
- `POST /api/vote` - Soumettre un vote
- `GET /api/vote/validate?token=xxx` - Valider un token

### Statistiques
- `GET /api/stats` - Obtenir les statistiques globales

## 🗄️ Base de données

SQLite avec 2 tables :

**rdv** : Stocke les rendez-vous
- id, emailClient, dateRdv, token (unique), calendarEventId, mailEnvoye

**vote** : Stocke les votes
- id, token (unique), note (1-5), commentaire, dateVote

## ⚙️ Configuration

### Variables d'environnement Backend

```env
# Serveur
PORT=3000
DATABASE_PATH=./data/avis.sqlite

# Frontend (CORS + emails)
FRONTEND_URL=http://localhost:3001

# Email SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
MAIL_FROM="Cabinet <no-reply@example.com>"
POD_PRAT_EMAIL=podologue@example.com

# Google Calendar
GOOGLE_CREDENTIALS_PATH=./credentials.json
GOOGLE_TOKEN_PATH=./token.json
GOOGLE_CALENDAR_ID=primary
CALENDAR_POLL_MINUTES=15

# Google Avis
GOOGLE_REVIEW_URL=https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
```

### Variables d'environnement Frontend

```env
REACT_APP_API_URL=http://localhost:3000
```

## 🧪 Tests

### Documentation complète
📖 **[TESTS.md](TESTS.md)** - Guide complet de tests avec toutes les réponses attendues

### Collection Bruno (Recommandé)
La collection Bruno inclut tous les tests API avec assertions automatiques :

1. **Installer Bruno** : https://www.usebruno.com/
2. **Ouvrir la collection** : Dossier `bruno-collection/`
3. **Exécuter les tests** : Runner dans Bruno

📂 Voir [bruno-collection/README.md](bruno-collection/README.md)

### Tests manuels

**Backend :**
```bash
cd Avis-google-intermediraire/back

# Test Google Calendar
npm run test-google-calendar

# Test création RDV
curl -X POST http://localhost:3000/api/rdv \
  -H "Content-Type: application/json" \
  -d '{"emailClient":"test@example.com","dateRdv":"2025-11-06T14:00:00Z"}'

# Test stats
curl http://localhost:3000/api/stats
```

**Frontend :**
```
http://localhost:3001/feedback?token=VOTRE_TOKEN
```

## 🐳 Déploiement

### Backend (Docker)
```bash
cd Avis-google-intermediraire/back
docker build -t avis-backend .
docker run -d -p 3000:3000 --env-file .env avis-backend
```

### Plateformes recommandées
- **Backend** : Railway, Render, Heroku, VPS
- **Frontend** : Netlify, Vercel, GitHub Pages
- **Production** : Considérer PostgreSQL au lieu de SQLite pour la scalabilité

## 🔒 Sécurité

⚠️ **Ne JAMAIS committer :**
- `.env`
- `credentials.json`
- `token.json`
- `data/avis.sqlite`

✅ **Best practices :**
- Utiliser HTTPS en production
- Configurer un rate limiter
- Sauvegarder régulièrement la base de données
- Protéger les endpoints admin avec authentification

## 📚 Documentation complète

- **Architecture technique** : Voir `architecture.md`
- **Backend** : Voir `Avis-google-intermediraire/back/README.md`
- **Frontend** : Voir `Avis-google-intermediraire/front/README.md`

## 🆘 Dépannage

### Backend ne démarre pas
- Vérifier que Node.js 18+ est installé
- Exécuter `npm install` dans le dossier back
- Vérifier le fichier `.env`

### "Google token.json missing"
```bash
cd Avis-google-intermediraire/back
npm run generate-google-token
```

### Emails non reçus
- Vérifier configuration SMTP dans `.env`
- Tester avec Mailtrap pour le développement
- Vérifier les logs du backend

### Frontend : "Token manquant"
- Accéder via le lien email avec `?token=xxx`
- Vérifier que le backend est accessible

### CORS errors
- Vérifier que `FRONTEND_URL` est correct dans `.env` backend
- Vérifier que le backend est démarré

## 🎯 Roadmap

### Version actuelle (Intermédiaire)
- ✅ Synchronisation Google Calendar
- ✅ Envoi emails automatique
- ✅ Interface de vote
- ✅ Prévention doublons
- ✅ Stats basiques

### Version future (Pro)
- ⏳ Interface d'administration
- ⏳ Multi-tenant (plusieurs cabinets)
- ⏳ Statistiques avancées et graphiques
- ⏳ Templates d'emails personnalisables
- ⏳ Intégration SMS
- ⏳ Export des données

## 📄 Licence

Projet privé - Tous droits réservés

## 👤 Support

Pour toute question, consulter :
1. Le fichier `architecture.md` (spécifications complètes)
2. Les README des sous-projets (back/ et front/)
3. Les logs du serveur backend

---

**Note :** Ce projet est conçu pour être utilisé par une IA (Claude, GPT, Cursor, etc.) pour génération et maintenance de code. Voir `architecture.md` pour les conventions détaillées.



