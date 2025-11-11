# Guide de déploiement Docker

Ce guide explique comment déployer l'application Avis Google avec Docker.

## 📋 Prérequis

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Fichiers de configuration Google :
  - `back/credentials.json` (téléchargé depuis Google Cloud Console)
  - `back/token.json` (généré avec `npm run generate-google-token`)

## 🚀 Déploiement rapide

### 1. Configuration

Créez un fichier `.env` à la racine du projet en copiant `.env.example` :

```bash
cp .env.example .env
```

Éditez le fichier `.env` et configurez toutes les variables nécessaires :

```env
# Backend Configuration
BACKEND_PORT=3000
FRONTEND_PORT=80

# Frontend URL (utilisé pour CORS et liens email)
FRONTEND_URL=http://localhost

# Backend API URL (utilisé par le frontend)
REACT_APP_API_URL=http://localhost:3000

# Email Configuration
MAIL_FROM="Cabinet <no-reply@example.com>"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
POD_PRAT_EMAIL=podologue@example.com

# Google Calendar Configuration
GOOGLE_CALENDAR_ID=primary
CALENDAR_POLL_MINUTES=15
GOOGLE_REVIEW_URL=https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
TOKEN_EXPIRATION_DAYS=30

# EmailJS Configuration (optionnel)
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_USER_ID=your_user_id
```

### 2. Préparation des fichiers Google

Assurez-vous que les fichiers suivants existent dans le dossier `back/` :

- `credentials.json` : Fichier de credentials Google (téléchargé depuis Google Cloud Console)
- `token.json` : Token d'authentification (généré avec `npm run generate-google-token`)

### 3. Création du dossier de données

Le dossier `back/data/` sera créé automatiquement, mais vous pouvez le créer manuellement :

```bash
mkdir -p back/data
```

### 4. Construction et démarrage

À la racine du projet, exécutez :

```bash
docker-compose up -d --build
```

Cette commande va :
- Construire les images Docker pour le backend et le frontend
- Démarrer les conteneurs en arrière-plan
- Configurer le réseau entre les services

### 5. Vérification

Vérifiez que les conteneurs sont en cours d'exécution :

```bash
docker-compose ps
```

Vous devriez voir :
- `avis-podologue-backend` (port 3000)
- `avis-podologue-frontend` (port 80)

Accédez à l'application :
- Frontend : http://localhost
- Backend API : http://localhost:3000

## 📊 Commandes utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend
```

### Arrêter les services

```bash
docker-compose down
```

### Redémarrer les services

```bash
docker-compose restart
```

### Reconstruire les images

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Vérifier la santé des services

```bash
# Backend
curl http://localhost:3000/api/stats

# Frontend
curl http://localhost/health
```

## 🔧 Configuration avancée

### Variables d'environnement

Toutes les variables d'environnement peuvent être configurées dans le fichier `.env` à la racine du projet.

### Volumes persistants

Les données SQLite sont stockées dans `back/data/` et sont persistantes grâce aux volumes Docker.

### Ports personnalisés

Modifiez les ports dans le fichier `.env` :

```env
BACKEND_PORT=3000
FRONTEND_PORT=8080
```

Puis mettez à jour `FRONTEND_URL` et `REACT_APP_API_URL` en conséquence.

## 🐛 Dépannage

### Les conteneurs ne démarrent pas

1. Vérifiez les logs : `docker-compose logs`
2. Vérifiez que les fichiers `credentials.json` et `token.json` existent
3. Vérifiez que le fichier `.env` est correctement configuré

### Erreur de connexion à la base de données

1. Vérifiez que le dossier `back/data/` existe et a les bonnes permissions
2. Vérifiez les logs du backend : `docker-compose logs backend`

### Le frontend ne peut pas se connecter au backend

1. Vérifiez que `REACT_APP_API_URL` dans `.env` correspond à l'URL du backend
2. Vérifiez que `FRONTEND_URL` dans `.env` correspond à l'URL du frontend
3. Vérifiez que CORS est correctement configuré dans le backend

### Problèmes de permissions

Si vous avez des problèmes de permissions avec les fichiers :

```bash
sudo chown -R $USER:$USER back/data
```

## 🚢 Déploiement en production

### Recommandations

1. **Sécurité** :
   - Utilisez HTTPS avec un reverse proxy (nginx, traefik)
   - Ne commitez jamais les fichiers `.env`, `credentials.json`, ou `token.json`
   - Utilisez des secrets Docker ou un gestionnaire de secrets

2. **Performance** :
   - Configurez des limites de ressources dans `docker-compose.yml`
   - Utilisez un CDN pour les assets statiques du frontend
   - Configurez la compression gzip dans nginx

3. **Monitoring** :
   - Configurez des alertes basées sur les health checks
   - Utilisez un outil de monitoring (Prometheus, Grafana)

### Exemple avec HTTPS (nginx reverse proxy)

Créez un fichier `nginx-proxy.conf` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📝 Notes

- Les images Docker utilisent des builds multi-stage pour optimiser la taille
- Le frontend est servi via nginx pour de meilleures performances
- Les health checks sont configurés pour surveiller l'état des services
- Les conteneurs utilisent un utilisateur non-root pour la sécurité

