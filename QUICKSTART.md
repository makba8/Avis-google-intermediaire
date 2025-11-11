# 🚀 Guide de Démarrage Rapide

Guide ultra-rapide pour démarrer le projet "Avis Podologue" en 10 minutes.

## 📦 Prérequis

- [x] Node.js 18+ installé
- [x] Un compte Google (pour Calendar API)
- [x] Un serveur SMTP ou compte Mailtrap (pour tests)

## ⚡ Installation Express

### 1️⃣ Backend (5 minutes)

```bash
# 1. Aller dans le dossier backend
cd Avis-google-intermediraire/back

# 2. Installer les dépendances
npm install

# 3. Créer le fichier de configuration
cp env.example .env

# 4. Éditer .env avec vos informations
# Minimum requis pour tester :
#   - PORT=3000
#   - FRONTEND_URL=http://localhost:3001
#   - SMTP_* (utilisez Mailtrap pour les tests)
```

**Configuration Google Calendar** (optionnel pour premiers tests) :
```bash
# 1. Télécharger credentials.json depuis Google Cloud Console
# 2. Placer credentials.json à la racine du backend
# 3. Générer le token
npm run generate-google-token
# 4. Suivre les instructions à l'écran
```

**Démarrer le backend** :
```bash
npm run start:dev
```

✅ Backend prêt sur `http://localhost:3000`

---

### 2️⃣ Frontend (2 minutes)

```bash
# 1. Aller dans le dossier frontend (depuis la racine)
cd Avis-google-intermediraire/front

# 2. Installer les dépendances
npm install

# 3. Créer le fichier de configuration
cp env.example .env

# Le .env devrait contenir :
# REACT_APP_API_URL=http://localhost:3000
```

**Démarrer le frontend** :
```bash
npm start
```

✅ Frontend prêt sur `http://localhost:3001`

---

## 🧪 Test Rapide (3 minutes)

### Test 1 : Créer un RDV de test

```bash
curl -X POST http://localhost:3000/api/rdv \
  -H "Content-Type: application/json" \
  -d '{
    "emailClient": "votre-email@example.com",
    "dateRdv": "2025-11-06T14:00:00Z"
  }'
```

Vous recevrez une réponse avec un `token`. Copiez-le !

### Test 2 : Tester le frontend

1. Ouvrir : `http://localhost:3001/feedback?token=VOTRE_TOKEN`
2. Cliquer sur des étoiles (1 à 5)
3. Si note < 4 : remplir le formulaire
4. Si note ≥ 4 : redirection vers Google Avis

### Test 3 : Vérifier les stats

```bash
curl http://localhost:3000/api/stats
```

---

## 📧 Configuration SMTP pour Tests

### Option 1 : Mailtrap (Recommandé pour dev)

1. Créer un compte sur [Mailtrap.io](https://mailtrap.io)
2. Copier les credentials SMTP
3. Dans `.env` du backend :
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=votre_username_mailtrap
SMTP_PASS=votre_password_mailtrap
MAIL_FROM="Cabinet Test <test@example.com>"
POD_PRAT_EMAIL=votre-email@example.com
```

### Option 2 : Gmail (Pour tests rapides)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
```

⚠️ Gmail nécessite un "mot de passe d'application" (pas votre mot de passe normal)

---

## 🗓️ Configuration Google Calendar (Optionnel)

### Étapes complètes

1. **Google Cloud Console**
   - Aller sur [console.cloud.google.com](https://console.cloud.google.com)
   - Créer un nouveau projet
   - Activer "Google Calendar API"

2. **Créer les credentials**
   - Aller dans "Identifiants"
   - Créer "ID client OAuth 2.0"
   - Type : "Application de bureau"
   - Télécharger le JSON

3. **Configurer le backend**
   ```bash
   # Renommer le fichier téléchargé
   mv ~/Downloads/client_secret_*.json credentials.json
   
   # Placer dans le backend
   mv credentials.json Avis-google-intermediraire/back/
   
   # Générer le token
   cd Avis-google-intermediraire/back
   npm run generate-google-token
   ```

4. **Tester la connexion**
   ```bash
   npm run test-google-calendar
   ```

---

## 📱 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:3000 | API REST |
| Frontend | http://localhost:3001 | Interface utilisateur |
| Stats | http://localhost:3000/api/stats | Statistiques |
| Test RDV | http://localhost:3000/api/rdv | Créer un RDV |

---

## 🎯 Commandes Utiles

### Backend
```bash
# Développement avec hot-reload
npm run start:dev

# Build pour production
npm run build

# Lancer en production
npm run start:prod

# Tests
npm run test

# Générer token Google
npm run generate-google-token

# Tester Google Calendar
npm run test-google-calendar
```

### Frontend
```bash
# Développement
npm start

# Build pour production
npm run build

# Tests
npm run test
```

---

## 🐛 Problèmes Courants

### ❌ "Cannot connect to backend"
```bash
# Vérifier que le backend tourne
curl http://localhost:3000/api/stats

# Si erreur, redémarrer le backend
cd Avis-google-intermediraire/back
npm run start:dev
```

### ❌ "Token manquant" sur le frontend
```bash
# Le token doit être dans l'URL
http://localhost:3001/feedback?token=VOTRE_TOKEN

# Créer un RDV de test pour obtenir un token
curl -X POST http://localhost:3000/api/rdv \
  -H "Content-Type: application/json" \
  -d '{"emailClient":"test@example.com","dateRdv":"2025-11-06T14:00:00Z"}'
```

### ❌ "SMTP connection failed"
```bash
# Vérifier les credentials SMTP dans .env
# Pour tester, utiliser Mailtrap.io
```

### ❌ "Google token.json missing"
```bash
cd Avis-google-intermediraire/back
npm run generate-google-token
```

---

## 📚 Documentation Complète

- **Vue d'ensemble** : `README.md`
- **Architecture technique** : `architecture.md`
- **Modifications** : `CHANGELOG.md`
- **Backend détaillé** : `Avis-google-intermediraire/back/README.md`
- **Frontend détaillé** : `Avis-google-intermediraire/front/README.md`

---

## ✅ Checklist de Démarrage

- [ ] Node.js 18+ installé
- [ ] Backend : `npm install` terminé
- [ ] Backend : `.env` configuré
- [ ] Backend démarré sur :3000
- [ ] Frontend : `npm install` terminé
- [ ] Frontend : `.env` configuré
- [ ] Frontend démarré sur :3001
- [ ] Test de création RDV réussi
- [ ] Test du frontend réussi
- [ ] (Optionnel) Google Calendar configuré
- [ ] (Optionnel) SMTP configuré et testé

---

## 🎉 Vous êtes prêt !

Le projet est maintenant opérationnel. Vous pouvez :

1. ✅ Créer des RDV via l'API
2. ✅ Recevoir des emails avec liens uniques
3. ✅ Collecter des avis via le frontend
4. ✅ Voir les statistiques
5. ✅ (Si configuré) Synchroniser avec Google Calendar

Pour la production, consultez la section "Déploiement" dans `README.md`.

---

**Temps total : ~10 minutes** ⚡
**Niveau : Débutant** 👶
**Support : Voir `README.md` pour le dépannage** 🆘



