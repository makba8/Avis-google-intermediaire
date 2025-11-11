# Avis Podologue - Backend (Version Intermédiaire)

Backend NestJS pour la collecte automatisée d'avis clients à partir de Google Calendar.

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- Compte Google avec accès à Google Calendar API
- Serveur SMTP pour l'envoi d'emails

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Copier le fichier d'environnement :
```bash
cp env.example .env
```

3. Configurer les variables d'environnement dans `.env`

## 🔐 Configuration Google Calendar

### 1. Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet
3. Activer l'API Google Calendar
4. Créer des identifiants OAuth 2.0 (application de bureau)
5. Télécharger le fichier JSON et le renommer en `credentials.json`
6. Placer `credentials.json` à la racine du projet backend

### 2. Générer le token d'authentification

```bash
npm run generate-google-token
```

Suivez les instructions pour autoriser l'application. Un fichier `token.json` sera créé.

### 3. Tester la connexion

```bash
npm run test-google-calendar
```

## 📧 Configuration Email

Configurez votre serveur SMTP dans le fichier `.env` :

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
MAIL_FROM="Cabinet Podologie <no-reply@example.com>"
POD_PRAT_EMAIL=podologue@example.com
```

Pour les tests, vous pouvez utiliser [Mailtrap](https://mailtrap.io/) ou [Ethereal](https://ethereal.email/).

## 🏃 Démarrage

### Mode développement
```bash
npm run start:dev
```

### Mode production
```bash
npm run build
npm run start:prod
```

Le serveur démarre sur `http://localhost:3000` (configurable via `PORT` dans `.env`)

## 📡 API Endpoints

### Rendez-vous

#### `POST /api/rdv`
Créer un rendez-vous manuellement (pour tests)

**Body:**
```json
{
  "emailClient": "patient@example.com",
  "dateRdv": "2025-11-06T14:00:00Z"
}
```

#### `POST /api/rdv/:id/send-mail`
Forcer l'envoi du mail pour un RDV existant

### Votes

#### `POST /api/vote`
Soumettre un vote

**Body:**
```json
{
  "token": "hex-token-from-email",
  "note": 5,
  "commentaire": "Excellent service!"
}
```

**Response:**
- Si note >= 4: `{ "redirectUrl": "https://..." }`
- Si note < 4: `{ "ok": true }` (email envoyé au podologue)

#### `GET /api/vote/validate?token=xxx`
Valider un token

**Response:**
```json
{
  "valid": true,
  "alreadyVoted": false
}
```

### Statistiques

#### `GET /api/stats`
Obtenir les statistiques

**Response:**
```json
{
  "totalRdv": 120,
  "totalVotes": 90,
  "averageRating": 4.6,
  "badVotes": 5
}
```

## ⚙️ Fonctionnement du Cron

Le service cron s'exécute toutes les `CALENDAR_POLL_MINUTES` minutes (défaut: 15) pour :

1. Récupérer les événements terminés depuis Google Calendar
2. Extraire l'email du patient des participants
3. Créer une entrée RDV locale si elle n'existe pas
4. Envoyer automatiquement un email avec un lien unique
5. Éviter les doublons via `calendarEventId`

## 🗄️ Base de données

Le projet utilise SQLite pour sa simplicité. La base de données est créée automatiquement dans `data/avis.sqlite`.

### Schéma

**Table `rdv`:**
- `id` (UUID)
- `emailClient` (string, nullable)
- `dateRdv` (datetime)
- `token` (string, unique)
- `calendarEventId` (string, nullable, indexed)
- `mailEnvoye` (boolean)
- `createdAt`, `updatedAt`

**Table `vote`:**
- `id` (UUID)
- `token` (string, unique, indexed)
- `note` (integer 1-5)
- `commentaire` (text, nullable)
- `dateVote` (datetime)
- `createdAt`

## 🐳 Déploiement Docker

### Build l'image
```bash
docker build -t avis-podologue-backend .
```

### Lancer le container
```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/credentials.json:/app/credentials.json \
  -v $(pwd)/token.json:/app/token.json \
  --env-file .env \
  --name avis-backend \
  avis-podologue-backend
```

## 🔒 Sécurité

⚠️ **Important:**

- Ne JAMAIS committer `.env`, `credentials.json`, `token.json` ou `data/avis.sqlite`
- Utiliser HTTPS en production
- Configurer un rate limiter en production
- Sauvegarder régulièrement la base de données SQLite
- Considérer PostgreSQL pour une montée en charge

## 🧪 Tests

### Tests unitaires
```bash
npm run test
```

### Tests e2e
```bash
npm run test:e2e
```

### Tests manuels

1. **Test Google Calendar:**
```bash
npm run test-google-calendar
```

2. **Test création RDV:**
```bash
curl -X POST http://localhost:3000/api/rdv \
  -H "Content-Type: application/json" \
  -d '{"emailClient": "test@example.com", "dateRdv": "2025-11-06T14:00:00Z"}'
```

3. **Test vote:**
```bash
curl -X POST http://localhost:3000/api/vote \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN", "note": 5, "commentaire": "Super!"}'
```

4. **Test stats:**
```bash
curl http://localhost:3000/api/stats
```

## 📝 Structure du projet

```
/back
├── src/
│   ├── main.ts                 # Point d'entrée
│   ├── app.module.ts           # Module principal
│   ├── config/
│   │   └── config.module.ts    # Configuration env
│   ├── rdv/
│   │   ├── rdv.entity.ts
│   │   ├── rdv.service.ts
│   │   ├── rdv.controller.ts
│   │   └── rdv.module.ts
│   ├── vote/
│   │   ├── vote.entity.ts
│   │   ├── vote.service.ts
│   │   ├── vote.controller.ts
│   │   └── vote.module.ts
│   ├── mail/
│   │   ├── mail.service.ts
│   │   └── mail.module.ts
│   ├── google/
│   │   ├── google.service.ts
│   │   └── google.module.ts
│   ├── cron/
│   │   ├── calendar-cron.service.ts
│   │   └── cron.module.ts
│   ├── stats/
│   │   └── stats.controller.ts
│   └── common/
│       └── dtos/
├── scripts/
│   ├── get_google_token.ts
│   └── test_google_calendar.ts
├── data/
│   └── avis.sqlite
├── Dockerfile
├── env.example
└── package.json
```

## 🆘 Dépannage

### "Google token.json missing"
Exécuter `npm run generate-google-token`

### "SMTP connection failed"
Vérifier les credentials SMTP dans `.env`

### "Database is locked"
SQLite est mono-thread. En production, considérer PostgreSQL.

### Le cron ne s'exécute pas
Vérifier les logs et la variable `CALENDAR_POLL_MINUTES`

## 📚 Ressources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Google Calendar API](https://developers.google.com/calendar)
- [TypeORM Documentation](https://typeorm.io/)
- [Nodemailer Documentation](https://nodemailer.com/)

## 📄 Licence

Projet privé - Tous droits réservés
