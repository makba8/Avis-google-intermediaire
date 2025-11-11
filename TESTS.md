# 🧪 Guide de Tests - Avis Podologue

Documentation complète des tests API avec réponses attendues.

---

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Tests Backend API](#tests-backend-api)
- [Tests Frontend](#tests-frontend)
- [Tests avec Bruno](#tests-avec-bruno)
- [Tests manuels](#tests-manuels)
- [Cas d'erreur](#cas-derreur)

---

## 🔧 Prérequis

### Backend démarré
```bash
cd Avis-google-intermediraire/back
npm run start:dev
```

Vérifier : `http://localhost:3000` doit être accessible

### Frontend démarré (pour tests UI)
```bash
cd Avis-google-intermediraire/front
npm start
```

Vérifier : `http://localhost:3001` doit être accessible

---

## 🎯 Tests Backend API

### Test 1 : GET /api/stats - Statistiques globales

**Description** : Récupère les statistiques du système

**Requête :**
```http
GET http://localhost:3000/api/stats
```

**Réponse attendue (200 OK) :**
```json
{
  "totalRdv": 0,
  "totalVotes": 0,
  "averageRating": 0,
  "badVotes": 0
}
```

**Explication des champs :**
- `totalRdv` : Nombre total de rendez-vous créés
- `totalVotes` : Nombre total de votes enregistrés
- `averageRating` : Note moyenne (0 si aucun vote)
- `badVotes` : Nombre de votes avec note < 4

---

### Test 2 : POST /api/rdv - Créer un rendez-vous

**Description** : Crée un nouveau rendez-vous et génère un token unique

**Requête :**
```http
POST http://localhost:3000/api/rdv
Content-Type: application/json

{
  "emailClient": "test@example.com",
  "dateRdv": "2025-11-07T14:00:00Z"
}
```

**Réponse attendue (201 Created) :**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "emailClient": "test@example.com",
  "dateRdv": "2025-11-07T14:00:00.000Z",
  "mailEnvoye": false,
  "calendarEventId": null,
  "createdAt": "2025-11-07T10:00:00.000Z",
  "updatedAt": "2025-11-07T10:00:00.000Z"
}
```

**💡 Important :** Sauvegarder le `token` pour les tests suivants !

**Cas d'erreur (400 Bad Request) :**
```json
{
  "statusCode": 400,
  "message": [
    "emailClient must be an email",
    "dateRdv must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

---

### Test 3 : POST /api/rdv/:id/send-mail - Renvoyer l'email

**Description** : Force l'envoi de l'email pour un RDV existant

**Requête :**
```http
POST http://localhost:3000/api/rdv/550e8400-e29b-41d4-a716-446655440000/send-mail
```

**Réponse attendue (200 OK) :**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "emailClient": "test@example.com",
  "dateRdv": "2025-11-07T14:00:00.000Z",
  "mailEnvoye": true,
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "calendarEventId": null,
  "createdAt": "2025-11-07T10:00:00.000Z",
  "updatedAt": "2025-11-07T10:01:00.000Z"
}
```

**Cas d'erreur (404 Not Found) :**
```json
{
  "statusCode": 404,
  "message": "RDV not found",
  "error": "Not Found"
}
```

---

### Test 4 : GET /api/vote/validate - Valider un token

**Description** : Vérifie si un token est valide et s'il a déjà été utilisé

**Requête :**
```http
GET http://localhost:3000/api/vote/validate?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Réponse attendue - Token valide et non utilisé (200 OK) :**
```json
{
  "valid": true,
  "alreadyVoted": false
}
```

**Réponse - Token valide mais déjà utilisé (200 OK) :**
```json
{
  "valid": true,
  "alreadyVoted": true
}
```

**Réponse - Token invalide (200 OK) :**
```json
{
  "valid": false,
  "alreadyVoted": false
}
```

---

### Test 5 : POST /api/vote - Soumettre un vote positif (note ≥ 4)

**Description** : Enregistre un vote avec une bonne note, retourne l'URL de redirection vers Google Avis

**Requête :**
```http
POST http://localhost:3000/api/vote
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "note": 5,
  "commentaire": "Excellent service, très professionnel !"
}
```

**Réponse attendue (200 OK) :**
```json
{
  "redirectUrl": "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
}
```

**Comportement attendu :**
- ✅ Vote enregistré dans la base de données
- ✅ `redirectUrl` fournie pour redirection vers Google Avis
- ❌ Aucun email envoyé au podologue

---

### Test 6 : POST /api/vote - Soumettre un vote négatif (note < 4)

**Description** : Enregistre un vote négatif, envoie un email interne au podologue

**Requête :**
```http
POST http://localhost:3000/api/vote
Content-Type: application/json

{
  "token": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7",
  "note": 2,
  "commentaire": "Service décevant, attente trop longue"
}
```

**Réponse attendue (200 OK) :**
```json
{
  "ok": true
}
```

**Comportement attendu :**
- ✅ Vote enregistré dans la base de données
- ✅ Email envoyé au podologue avec note et commentaire
- ❌ Pas de redirection vers Google

---

### Test 7 : POST /api/vote - Tentative de double vote

**Description** : Essaie de voter deux fois avec le même token (doit échouer)

**Requête :**
```http
POST http://localhost:3000/api/vote
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "note": 3,
  "commentaire": "Deuxième tentative"
}
```

**Réponse attendue (409 Conflict) :**
```json
{
  "statusCode": 409,
  "message": "Vote already exists for this token",
  "error": "Conflict"
}
```

---

### Test 8 : POST /api/vote - Token invalide

**Description** : Essaie de voter avec un token inexistant

**Requête :**
```http
POST http://localhost:3000/api/vote
Content-Type: application/json

{
  "token": "token_inexistant_123456",
  "note": 5,
  "commentaire": "Test"
}
```

**Réponse attendue (400 Bad Request) :**
```json
{
  "statusCode": 400,
  "message": "Invalid token",
  "error": "Bad Request"
}
```

---

### Test 9 : POST /api/vote - Note invalide

**Description** : Essaie de voter avec une note hors limite

**Requête :**
```http
POST http://localhost:3000/api/vote
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "note": 6,
  "commentaire": "Test note invalide"
}
```

**Réponse attendue (400 Bad Request) :**
```json
{
  "statusCode": 400,
  "message": [
    "note must not be greater than 5"
  ],
  "error": "Bad Request"
}
```

---

### Test 10 : GET /api/stats - Statistiques après votes

**Description** : Vérifie que les stats sont mises à jour

**Requête :**
```http
GET http://localhost:3000/api/stats
```

**Réponse attendue (200 OK) :**
```json
{
  "totalRdv": 2,
  "totalVotes": 2,
  "averageRating": 3.5,
  "badVotes": 1
}
```

**Calculs :**
- Si votes : 5★ et 2★
- Moyenne : (5 + 2) / 2 = 3.5
- Avis négatifs (< 4) : 1 (le vote à 2★)

---

## 🌐 Tests Frontend

### Test UI 1 : Page sans token

**URL :**
```
http://localhost:3001/feedback
```

**Comportement attendu :**
- ❌ Message : "Token manquant. Veuillez utiliser le lien reçu par email."
- ❌ Pas d'étoiles affichées

---

### Test UI 2 : Page avec token invalide

**URL :**
```
http://localhost:3001/feedback?token=token_invalide_xyz
```

**Comportement attendu :**
- ❌ Message : "Token invalide ou expiré."
- ❌ Pas d'étoiles affichées

---

### Test UI 3 : Page avec token valide

**URL :**
```
http://localhost:3001/feedback?token=VOTRE_TOKEN_VALIDE
```

**Comportement attendu :**
- ✅ 5 étoiles affichées
- ✅ Possibilité de cliquer sur les étoiles
- ✅ Pas d'erreur affichée

---

### Test UI 4 : Vote positif (5 étoiles)

**Actions :**
1. Ouvrir : `http://localhost:3001/feedback?token=TOKEN_VALIDE`
2. Cliquer sur la 5ème étoile

**Comportement attendu :**
- ✅ Redirection automatique vers Google Avis
- ✅ URL contient `writereview?placeid=`

---

### Test UI 5 : Vote négatif (2 étoiles)

**Actions :**
1. Ouvrir : `http://localhost:3001/feedback?token=TOKEN_VALIDE_2`
2. Cliquer sur la 2ème étoile
3. Remplir le formulaire (nom optionnel + commentaire)
4. Cliquer sur "Envoyer mon avis"

**Comportement attendu :**
- ✅ Formulaire de commentaire affiché
- ✅ Champs nom et message visibles
- ✅ Bouton "Envoyer mon avis" cliquable
- ✅ Après soumission : message "Merci, votre avis a bien été envoyé"
- ✅ Icône de validation (✓) affichée

---

### Test UI 6 : Token déjà utilisé

**URL :**
```
http://localhost:3001/feedback?token=TOKEN_DEJA_VOTE
```

**Comportement attendu :**
- ✅ Message : "Vous avez déjà soumis votre avis pour ce rendez-vous."
- ❌ Pas d'étoiles affichées

---

## 🔧 Tests avec Bruno

### Installation de Bruno

1. **Télécharger Bruno** : https://www.usebruno.com/
2. **Installer** l'application desktop

### Importer la collection

1. Ouvrir Bruno
2. Cliquer sur "Open Collection"
3. Sélectionner le dossier : `bruno-collection/`
4. La collection "Avis Podologue API" apparaît

### Structure de la collection

```
📁 Avis Podologue API
├── 📁 RDV Management
│   ├── ✉️ Get Stats
│   ├── ✉️ Create RDV
│   └── ✉️ Send Mail for RDV
├── 📁 Vote Management
│   ├── ✉️ Validate Token
│   ├── ✉️ Submit Positive Vote (≥4)
│   ├── ✉️ Submit Negative Vote (<4)
│   ├── ✉️ Try Double Vote (should fail)
│   └── ✉️ Invalid Token (should fail)
└── 📁 Stats
    └── ✉️ Get Updated Stats
```

### Variables d'environnement Bruno

**Fichier : `bruno.json`**
```json
{
  "baseUrl": "http://localhost:3000",
  "token": "{{généré par Create RDV}}",
  "rdvId": "{{généré par Create RDV}}"
}
```

---

## 🧪 Scénario de test complet

### Étape 1 : Reset (optionnel)
Supprimer la base de données pour repartir de zéro :
```bash
cd Avis-google-intermediraire/back/data
rm avis.sqlite
# Redémarrer le backend pour recréer la DB
```

### Étape 2 : Vérifier l'état initial
```
GET /api/stats
✅ totalRdv: 0, totalVotes: 0
```

### Étape 3 : Créer 2 RDV
```
POST /api/rdv (email: test1@example.com) → token1
POST /api/rdv (email: test2@example.com) → token2
```

### Étape 4 : Vérifier les stats
```
GET /api/stats
✅ totalRdv: 2, totalVotes: 0
```

### Étape 5 : Valider les tokens
```
GET /api/vote/validate?token=token1 → valid: true, alreadyVoted: false
GET /api/vote/validate?token=token2 → valid: true, alreadyVoted: false
```

### Étape 6 : Voter (1 positif, 1 négatif)
```
POST /api/vote (token1, note: 5) → redirectUrl
POST /api/vote (token2, note: 2) → ok: true
```

### Étape 7 : Vérifier double vote
```
POST /api/vote (token1, note: 3) → 409 Conflict ✅
```

### Étape 8 : Stats finales
```
GET /api/stats
✅ totalRdv: 2
✅ totalVotes: 2
✅ averageRating: 3.5
✅ badVotes: 1
```

### Étape 9 : Test frontend
```
http://localhost:3001/feedback?token=token1 → "Déjà voté" ✅
http://localhost:3001/feedback?token=nouveau_token → Étoiles affichées ✅
```

---

## ❌ Cas d'erreur à tester

### 1. Champs manquants

**POST /api/rdv sans dateRdv :**
```json
{
  "emailClient": "test@example.com"
}
```
→ **400 Bad Request** : "dateRdv must be a valid ISO 8601 date string"

### 2. Email invalide

**POST /api/rdv avec email invalide :**
```json
{
  "emailClient": "pas_un_email",
  "dateRdv": "2025-11-07T14:00:00Z"
}
```
→ **400 Bad Request** : "emailClient must be an email"

### 3. Note hors limites

**POST /api/vote avec note = 0 :**
```json
{
  "token": "valid_token",
  "note": 0,
  "commentaire": "Test"
}
```
→ **400 Bad Request** : "note must not be less than 1"

### 4. Backend non démarré

**GET http://localhost:3000/api/stats**
→ **Connection refused** ou timeout

**Solution :** Démarrer le backend avec `npm run start:dev`

### 5. CORS error (frontend)

**Console navigateur :**
```
Access to fetch at 'http://localhost:3000/api/vote' from origin 'http://localhost:3001' 
has been blocked by CORS policy
```

**Solution :** Vérifier `FRONTEND_URL` dans `.env` du backend

---

## 📊 Checklist de validation

### Backend
- [ ] Backend démarre sans erreur
- [ ] GET /api/stats retourne 200
- [ ] POST /api/rdv crée un RDV et retourne un token
- [ ] POST /api/rdv/:id/send-mail fonctionne
- [ ] GET /api/vote/validate valide correctement
- [ ] POST /api/vote (note ≥4) retourne redirectUrl
- [ ] POST /api/vote (note <4) retourne ok: true
- [ ] POST /api/vote (double) retourne 409
- [ ] POST /api/vote (token invalide) retourne 400
- [ ] POST /api/vote (note invalide) retourne 400
- [ ] Stats mises à jour correctement

### Frontend
- [ ] Frontend s'ouvre sans erreur
- [ ] Sans token → message d'erreur
- [ ] Token invalide → message d'erreur
- [ ] Token valide → étoiles affichées
- [ ] Clic 5★ → tentative redirection Google
- [ ] Clic 2★ → formulaire affiché
- [ ] Soumission formulaire → confirmation
- [ ] Token déjà voté → message approprié

### Intégration
- [ ] Frontend communique avec backend via CORS
- [ ] Votes enregistrés en base de données
- [ ] Emails envoyés (si SMTP configuré)
- [ ] Aucun doublon possible

---

## 🎯 Résultats attendus finaux

Après avoir effectué tous les tests :

**Base de données SQLite** (`data/avis.sqlite`) :
- Table `rdv` : 2+ entrées
- Table `vote` : 2+ entrées
- Tokens uniques
- Pas de doublons

**Console backend** :
- Logs de création de RDV
- Logs de votes
- Warnings si Google Calendar non configuré
- Aucune erreur critique

**Console frontend** :
- Aucune erreur CORS
- Logs de validation de token
- Logs de soumission de votes

---

## 📝 Notes importantes

- **Tokens** : Toujours utiliser des tokens frais pour chaque test de vote
- **Base de données** : SQLite stockée dans `back/data/avis.sqlite`
- **Emails** : Configurez SMTP ou utilisez Mailtrap pour voir les emails
- **Google Calendar** : Optionnel pour les tests de base
- **CORS** : Le backend doit autoriser `http://localhost:3001`

---

## 🆘 En cas de problème

### Le backend ne démarre pas
→ Voir [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Les tests échouent
1. Vérifier que le backend est démarré
2. Vérifier l'URL : `http://localhost:3000`
3. Vérifier les logs du backend
4. Tester `/api/stats` en premier

### CORS errors
1. Vérifier `FRONTEND_URL` dans `.env` backend
2. Redémarrer le backend
3. Vérifier que le frontend utilise `http://localhost:3001`

---

**Dernière mise à jour** : 7 novembre 2025  
**Version** : 1.0
