# Projet Google Avis — Version Intermédiaire

## But du document
Ce fichier est un **blueprint** destiné à une IA (Claude 3.7, GPT-4/5, Cursor, etc.) et aux développeurs.  
Objectif : fournir une structure claire, exécutable et non ambiguë pour générer ou implémenter un backend complet relié à Google Calendar, gérer l'envoi d'e-mails post-RDV, et collecter les avis clients. Ce document contient :
- Contexte et objectifs précis.
- Stack recommandée et raisons de choix.
- Architecture technique et arborescence.
- Schéma de données (SQLite / TypeORM).
- Spécifications d’API (contrats, payloads, codes de retour).
- Flows opératoires (cron, token, vote).
- Checklist de sécurité et déploiement.
- Instructions précises pour l’IA : conventions, erreurs à éviter, tests à effectuer.

> IMPORTANT : Ce document vise la **version intermédiaire** (automatisation via Google Calendar, stockage léger, envoi automatique de mails, prévention des doublons). Il n'inclut pas d'interface d'administration complexe ni gestion multi-tenant.

---

## Contexte et objectifs
- Le podologue utilise Doctolib pour prendre des RDV. Doctolib synchronise ces RDV sur un **Google Calendar** lié.
- Backend doit :
  1. Récupérer automatiquement les RDV terminés depuis Google Calendar.
  2. Créer une entrée locale `Rdv` (si inexistante) puis envoyer un email au patient avec un lien d'avis unique.
  3. Recevoir les votes depuis le frontend : si note >= 4 → redirection vers la page Google Avis ; sinon → envoyer un email interne au podologue contenant le commentaire.
  4. Empêcher les doublons (un vote par RDV).
  5. Fonctionner avec une faible charge (2–3 utilisateurs simultanés) ; SQLite est acceptable.

---

## Stack technique (recommandé)
- Node.js 18+  
- NestJS (framework backend)  
- TypeORM + SQLite (database légère)  
- googleapis (Calendar API)  
- Nodemailer (envoi d'e-mails)  
- date-fns (gestion dates)  
- ts-node (scripts utilitaires)  
- Déploiement conseillé : Railway / Render / Docker (fichier fourni)

Raisons : simplicité, rapidité de prototypage, facilité de déploiement pour petite charge.

---

## Arborescence cible (backend)
```
/backend
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ config/
│  │  └─ config.module.ts
│  ├─ rdv/
│  │  ├─ rdv.entity.ts
│  │  ├─ rdv.controller.ts
│  │  └─ rdv.service.ts
│  ├─ vote/
│  │  ├─ vote.entity.ts
│  │  ├─ vote.controller.ts
│  │  └─ vote.service.ts
│  ├─ mail/
│  │  ├─ mail.module.ts
│  │  └─ mail.service.ts
│  ├─ google/
│  │  ├─ google.module.ts
│  │  └─ google.service.ts
│  ├─ cron/
│  │  └─ calendar-cron.service.ts
│  └─ common/
│     └─ dtos/validators/
├─ data/
│  └─ avis.sqlite
├─ scripts/
│  ├─ get_google_token.ts
│  └─ test_google_calendar.ts
├─ .env.example
├─ package.json
├─ Dockerfile
└─ README.md
```

---

## Schéma de données (TypeORM — SQLite)
### `rdv` (table)
- `id` (uuid, PK)
- `emailClient` (string, nullable)
- `dateRdv` (datetime)
- `token` (string, unique) — jeton aléatoire long
- `calendarEventId` (string, nullable) — id de l'événement Google Calendar
- `mailEnvoye` (boolean, default false)
- `createdAt`, `updatedAt` (timestamps)

### `vote` (table)
- `id` (uuid, PK)
- `token` (string, index, unique) — référence au `rdv.token`
- `note` (integer 1..5)
- `commentaire` (text, nullable)
- `dateVote` (datetime)
- `createdAt` (timestamp)

Contraintes et index :
- `vote.token` unique pour empêcher votes multiples.
- Index sur `rdv.calendarEventId` pour recherche rapide.

---

## Spécifications API (contrats)

### `POST /api/rdv`
Création manuelle d'un RDV (admin/test).
**Request**
```json
{
  "emailClient": "patient@example.com",
  "dateRdv": "2025-11-03T14:00:00Z",
  "calendarEventId": null
}
```
**Response 201**
```json
{
  "id": "uuid",
  "token": "hex-token",
  "emailClient": "patient@example.com",
  "dateRdv": "2025-11-03T14:00:00Z"
}
```
Codes :
- 400 : payload invalide
- 500 : erreur serveur

---

### `POST /api/rdv/:id/send-mail`
Forcer l'envoi du mail pour un RDV existant.
**Response**
- 200 : mail envoyé
- 404 : RDV non trouvé

---

### `POST /api/vote`
Soumission d'un vote depuis le frontend.
**Request**
```json
{
  "token": "hex-token",
  "note": 5,
  "commentaire": "optionnel"
}
```
**Behavior**
1. Vérifier `note` entre 1 et 5.
2. Rechercher `rdv` par `token`. Si introuvable -> 400.
3. Transaction :
   - Vérifier qu'aucun `vote` n'existe pour ce `token`.
   - Insérer `vote`.
4. Si `note >= 4` -> répondre `{ "redirectUrl": "<GOOGLE_REVIEW_URL>" }`.
   Si `note < 4` -> envoyer mail interne au podologue (`MAIL_FROM` ou `POD_PRAT_EMAIL`) et répondre `{ "ok": true }`.
5. Marquer `rdv.mailEnvoye = true` ou stocker `votedAt`.

**Response codes**
- 200 : ok or redirectUrl
- 400 : token invalide / note invalide
- 409 : déjà voté
- 500 : erreur serveur

---

### `GET /api/vote/validate?token=...`
Retourne `{ valid: true, alreadyVoted: false }` ou erreurs.

---

### `GET /api/stats`
Retourne statistiques basiques :
```json
{
  "totalRdv": 120,
  "totalVotes": 90,
  "averageRating": 4.6,
  "badVotes": 5
}
```

---

## Flows techniques détaillés

### 1) Récupération RDV Google Calendar (cron)
- Cron : `@Cron('*/15 * * * *')` (configurable via env `CALENDAR_POLL_MINUTES`)
- Étapes :
  1. Calculer `timeMin = now - lookback` (configurable) et `timeMax = now`.
  2. Appeler `calendar.events.list({ calendarId, timeMin, timeMax, singleEvents: true, orderBy: 'startTime' })`.
  3. Pour chaque événement terminé (end < now) :
     - Extraire `attendees` pour trouver l'email patient (`attendees[0].email` si présent).
     - Si `event.id` déjà présent en base (`rdv.calendarEventId`) -> skip.
     - Générer `token` (crypto.randomBytes(24).toString('hex')).
     - Créer `Rdv` local et appeler `mailService.sendFeedbackMail(email, token)`.
     - Marquer `mailEnvoye = true` si mail envoyé avec succès.
  4. Gérer erreurs et log.

### 2) Envoi mail
- Template simple HTML avec bouton `https://<FRONTEND_URL>/feedback?token=<token>`
- En-tête `From` configuré via `MAIL_FROM`
- En cas d'échec SMTP : log + garder `mailEnvoye=false` pour retry.

### 3) Vote
- Endpoint `POST /api/vote` (voir spécification).
- Transaction DB pour garantir atomicité.
- Envoie mail interne avec note et commentaire pour notes < 4.

---

## Variables d'environnement (obligatoires)
```
PORT=3000
DATABASE_PATH=./data/avis.sqlite
FRONTEND_URL=https://avis.example.com
MAIL_FROM="Cabinet <no-reply@ex.com>"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass

GOOGLE_CREDENTIALS_PATH=./credentials.json
GOOGLE_TOKEN_PATH=./token.json
GOOGLE_CALENDAR_ID=primary
CALENDAR_POLL_MINUTES=15

GOOGLE_REVIEW_URL=https://search.google.com/local/writereview?placeid=PLACE_ID
TOKEN_EXPIRATION_DAYS=30
```

---

## Sécurité et bonnes pratiques
- Ne jamais committer `credentials.json`, `token.json`, `.env` ou `data/avis.sqlite`.
- Toujours utiliser HTTPS en production.
- Utiliser des tokens longs et uniques pour `rdv.token`.
- Protéger endpoints admin avec auth (Basic/Auth token) si exposés publiquement.
- Rate-limit sur `/api/vote` et `/api/rdv` (par IP).
- Backup régulier du fichier SQLite ou migration vers Postgres pour montée en charge.

---

## Tests recommandés (manuels + scripts)
1. **Test Google** : `scripts/test_google_calendar.ts` pour lister events.
2. **Test DB** : `scripts/test_db.ts` qui crée un RDV de test et vérifie la présence.
3. **Test Mail** : script pour appeler `mailService.sendFeedbackMail()` vers Mailtrap.
4. **Test Endpoints** : collection Postman pour `POST /api/rdv`, `POST /api/vote`, `GET /api/stats`.
5. **Test Cron** : exécuter `calendarCronService.handleCron()` manuellement.

---

## Conventions pour une IA génératrice de code
- Respect strict des types TypeScript.
- Tous les services doivent être testables isolément.
- Les endpoints doivent renvoyer des erreurs claires (400, 401, 403, 409, 500).
- Logs concis et utiles.
- Aucun usage d'API privées non documentées.
- Générer des fichiers unit-tests basiques pour les services critiques.

---

## Checklist de livraison
- [ ] Backend NestJS démarrable en local `npm run start:dev`.
- [ ] `credentials.json` et `token.json` configurés pour Google Calendar.
- [ ] Cron opérationnel et création RDV automatique.
- [ ] Envoi d'e-mails test (Mailtrap).
- [ ] Endpoint `/api/vote` avec prévention doublons.
- [ ] Documentation et Postman collection.
- [ ] Dockerfile et instructions de déploiement.

---

## Notes finales
- Ce document est volontairement pragmatique. Il doit permettre à une IA d'écrire du code exécutable sans ambiguïté.
- Si tu veux, je peux générer aussi une **Postman collection** et des **tests unitaires** de base automatiquement.

