# 🔧 Guide de Dépannage

Solutions aux problèmes courants du projet "Avis Podologue".

## 📑 Table des matières

- [Backend](#backend)
- [Frontend](#frontend)
- [Google Calendar](#google-calendar)
- [Email / SMTP](#email--smtp)
- [Base de données](#base-de-données)
- [Déploiement](#déploiement)

---

## Backend

### ❌ Le backend ne démarre pas

**Symptômes** : Erreur au lancement de `npm run start:dev`

**Solutions** :

1. **Vérifier la version de Node.js**
   ```bash
   node --version
   # Doit être >= 18.0.0
   ```

2. **Réinstaller les dépendances**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Vérifier le fichier .env**
   ```bash
   # S'assurer qu'il existe
   ls -la .env
   
   # Si absent, le créer
   cp env.example .env
   ```

4. **Vérifier les logs d'erreur**
   ```bash
   npm run start:dev 2>&1 | tee error.log
   ```

---

### ❌ "Cannot find module '@nestjs/config'"

**Cause** : Dépendance manquante

**Solution** :
```bash
npm install @nestjs/config
```

---

### ❌ "Database is locked"

**Cause** : SQLite ne supporte qu'une connexion d'écriture à la fois

**Solutions** :

1. **Fermer les autres connexions**
   ```bash
   # Arrêter tous les processus Node
   killall node
   
   # Redémarrer le backend
   npm run start:dev
   ```

2. **Supprimer le fichier .lock**
   ```bash
   cd data
   rm -f *.sqlite-shm *.sqlite-wal
   ```

3. **En production, utiliser PostgreSQL**
   - SQLite est limité pour les applications multi-utilisateurs
   - Migrer vers PostgreSQL pour plus de 10 utilisateurs simultanés

---

### ❌ "CORS policy blocked"

**Symptômes** : Erreur dans la console du navigateur

**Solutions** :

1. **Vérifier FRONTEND_URL dans .env**
   ```env
   FRONTEND_URL=http://localhost:3001
   ```

2. **Vérifier main.ts**
   ```typescript
   app.enableCors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3001',
     credentials: true,
   });
   ```

3. **En production, autoriser le domaine exact**
   ```env
   FRONTEND_URL=https://votre-domaine.com
   ```

---

### ❌ Cron ne s'exécute pas

**Symptômes** : Les RDV ne sont pas récupérés automatiquement

**Diagnostic** :
```bash
# Vérifier les logs
npm run start:dev
# Attendre 15 minutes et chercher "Polling Google Calendar"
```

**Solutions** :

1. **Vérifier que le ScheduleModule est importé**
   ```typescript
   // cron.module.ts
   imports: [ScheduleModule.forRoot(), ...]
   ```

2. **Tester manuellement**
   ```bash
   # Dans le code, ajouter temporairement :
   @Cron('*/1 * * * *')  // Toutes les minutes pour test
   ```

3. **Vérifier la configuration**
   ```env
   CALENDAR_POLL_MINUTES=15
   ```

---

## Frontend

### ❌ "Token manquant"

**Symptômes** : Message d'erreur au chargement de la page

**Cause** : L'URL ne contient pas de paramètre `token`

**Solutions** :

1. **URL correcte attendue**
   ```
   http://localhost:3001/feedback?token=abc123def456...
   ```

2. **Créer un RDV de test pour obtenir un token**
   ```bash
   curl -X POST http://localhost:3000/api/rdv \
     -H "Content-Type: application/json" \
     -d '{"emailClient":"test@example.com","dateRdv":"2025-11-06T14:00:00Z"}'
   ```
   Copier le `token` de la réponse

3. **Tester avec le token**
   ```
   http://localhost:3001/feedback?token=VOTRE_TOKEN_ICI
   ```

---

### ❌ "Erreur de connexion au serveur"

**Symptômes** : Impossible de valider le token ou soumettre un vote

**Solutions** :

1. **Vérifier que le backend tourne**
   ```bash
   curl http://localhost:3000/api/stats
   # Doit retourner du JSON
   ```

2. **Vérifier REACT_APP_API_URL dans .env**
   ```env
   REACT_APP_API_URL=http://localhost:3000
   ```

3. **Redémarrer le frontend après modification du .env**
   ```bash
   # IMPORTANT : React nécessite un restart pour .env
   # Ctrl+C puis
   npm start
   ```

---

### ❌ Page blanche / erreur JavaScript

**Solutions** :

1. **Ouvrir la console du navigateur** (F12)
2. **Vérifier les erreurs**
3. **Nettoyer le cache**
   ```bash
   rm -rf node_modules/.cache
   npm start
   ```

---

## Google Calendar

### ❌ "Google token.json missing"

**Cause** : Token OAuth non généré

**Solution** :
```bash
cd Avis-google-intermediraire/back

# 1. S'assurer que credentials.json existe
ls -la credentials.json

# 2. Générer le token
npm run generate-google-token

# 3. Suivre les instructions :
#    - Ouvrir l'URL dans un navigateur
#    - Se connecter avec votre compte Google
#    - Copier le code
#    - Le coller dans le terminal
```

---

### ❌ "Invalid credentials"

**Causes possibles** :
- `credentials.json` invalide
- Token expiré
- API Google Calendar non activée

**Solutions** :

1. **Vérifier credentials.json**
   ```bash
   cat credentials.json | python -m json.tool
   # Doit être un JSON valide
   ```

2. **Regénérer le token**
   ```bash
   rm token.json
   npm run generate-google-token
   ```

3. **Vérifier l'API dans Google Cloud Console**
   - Aller sur [console.cloud.google.com](https://console.cloud.google.com)
   - "APIs & Services" > "Enabled APIs"
   - Vérifier que "Google Calendar API" est activée

---

### ❌ Aucun événement récupéré

**Diagnostic** :
```bash
npm run test-google-calendar
```

**Solutions** :

1. **Vérifier GOOGLE_CALENDAR_ID**
   ```env
   GOOGLE_CALENDAR_ID=primary
   # Ou l'ID spécifique de votre agenda
   ```

2. **Vérifier la période de recherche**
   ```typescript
   // calendar-cron.service.ts
   const lookback = addMinutes(now, -60 * 24); // 24h en arrière
   ```

3. **Vérifier que les événements ont des participants**
   - Le cron cherche l'email dans `event.attendees`
   - S'assurer que Doctolib ajoute bien les participants

---

## Email / SMTP

### ❌ "SMTP connection failed"

**Causes possibles** :
- Credentials incorrects
- Port bloqué par le firewall
- Serveur SMTP non joignable

**Solutions** :

1. **Vérifier les credentials**
   ```env
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=username
   SMTP_PASS=password
   ```

2. **Tester la connexion SMTP**
   ```bash
   telnet smtp.example.com 587
   # Doit se connecter
   ```

3. **Utiliser Mailtrap pour les tests**
   ```env
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_mailtrap_user
   SMTP_PASS=your_mailtrap_pass
   ```

---

### ❌ Emails non reçus

**Diagnostic** :

1. **Vérifier les logs backend** pour erreurs SMTP
2. **Vérifier le dossier spam**
3. **Vérifier que `mailEnvoye` est true** dans la DB

**Solutions** :

1. **Forcer l'envoi d'un mail de test**
   ```bash
   # Créer un RDV
   curl -X POST http://localhost:3000/api/rdv \
     -H "Content-Type: application/json" \
     -d '{"emailClient":"VOTRE_EMAIL@example.com","dateRdv":"2025-11-06T14:00:00Z"}'
   
   # Noter l'ID du RDV, puis forcer l'envoi
   curl -X POST http://localhost:3000/api/rdv/ID_DU_RDV/send-mail
   ```

2. **Vérifier MAIL_FROM et POD_PRAT_EMAIL**
   ```env
   MAIL_FROM="Cabinet <no-reply@example.com>"
   POD_PRAT_EMAIL=podologue@example.com
   ```

---

### ❌ "Invalid email address"

**Cause** : Email mal formaté

**Solution** :
```bash
# S'assurer que l'email est valide
curl -X POST http://localhost:3000/api/rdv \
  -H "Content-Type: application/json" \
  -d '{"emailClient":"valid.email@example.com","dateRdv":"2025-11-06T14:00:00Z"}'
```

---

## Base de données

### ❌ "SQLITE_CANTOPEN: unable to open database"

**Cause** : Dossier `data/` inexistant

**Solution** :
```bash
mkdir -p data
# Redémarrer le backend
npm run start:dev
```

---

### ❌ Données corrompues / reset DB

**Solution** :
```bash
# ATTENTION : Supprime toutes les données !
cd data
rm avis.sqlite

# Redémarrer le backend
# TypeORM recréera automatiquement la DB
npm run start:dev
```

---

### ❌ Migration de SQLite vers PostgreSQL

**Quand ?** : En production ou > 50 RDV/jour

**Comment** :

1. **Installer PostgreSQL**

2. **Modifier typeorm config**
   ```typescript
   // app.module.ts
   TypeOrmModule.forRoot({
     type: 'postgres',
     host: process.env.DB_HOST,
     port: parseInt(process.env.DB_PORT),
     username: process.env.DB_USER,
     password: process.env.DB_PASS,
     database: process.env.DB_NAME,
     entities: [Rdv, Vote],
     synchronize: true, // false en production
   })
   ```

3. **Ajouter les variables d'environnement**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=password
   DB_NAME=avis_podologue
   ```

---

## Déploiement

### ❌ Build échoue

**Backend** :
```bash
# Nettoyer et rebuilder
rm -rf dist
npm run build

# Vérifier les erreurs TypeScript
npm run lint
```

**Frontend** :
```bash
# Nettoyer et rebuilder
rm -rf build
npm run build
```

---

### ❌ Variables d'environnement non prises en compte

**Backend** :
```bash
# S'assurer que .env est lu
# En production, utiliser les variables d'environnement du système
export PORT=3000
export DATABASE_PATH=/app/data/avis.sqlite
# etc.
```

**Frontend** :
```bash
# IMPORTANT : Variables React doivent commencer par REACT_APP_
# et être définies AVANT le build
REACT_APP_API_URL=https://api.example.com npm run build
```

---

### ❌ Docker : "Permission denied"

**Cause** : Problèmes de permissions sur les volumes

**Solution** :
```bash
# Donner les bonnes permissions au dossier data
chmod -R 755 data/

# Dans Dockerfile, ajouter :
RUN chown -R node:node /app
USER node
```

---

## 🆘 Toujours bloqué ?

### Checklist de diagnostic

1. **Vérifier les versions**
   ```bash
   node --version  # >= 18
   npm --version   # >= 9
   ```

2. **Vérifier les logs**
   - Backend : console du terminal
   - Frontend : console du navigateur (F12)

3. **Vérifier les ports**
   ```bash
   lsof -i :3000  # Backend
   lsof -i :3001  # Frontend
   ```

4. **Redémarrer tout**
   ```bash
   # Arrêter tout
   killall node
   
   # Nettoyer
   cd back && rm -rf node_modules dist
   cd ../front && rm -rf node_modules build
   
   # Réinstaller
   cd back && npm install
   cd ../front && npm install
   
   # Redémarrer
   cd back && npm run start:dev &
   cd ../front && npm start
   ```

---

### Obtenir de l'aide

1. **Documentation** :
   - `README.md` - Vue d'ensemble
   - `architecture.md` - Specs techniques
   - `QUICKSTART.md` - Démarrage rapide

2. **Logs détaillés** :
   ```bash
   # Backend avec logs complets
   DEBUG=* npm run start:dev
   ```

3. **Créer un rapport de bug** :
   - Version Node.js
   - OS
   - Message d'erreur complet
   - Étapes pour reproduire
   - Fichiers de configuration (sans credentials !)

---

**Dernière mise à jour** : 6 novembre 2025  
**Maintenu par** : Documentation du projet



