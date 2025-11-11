# Avis Podologue - Frontend

Interface de collecte d'avis clients pour cabinet de podologie.

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Copier le fichier d'environnement :
```bash
cp env.example .env
```

3. Configurer les variables dans `.env` :

**Option 1 : Avec backend API (recommandé)**
```env
REACT_APP_API_URL=http://localhost:3000
```

**Option 2 : Avec EmailJS comme solution de secours**
```env
REACT_APP_API_URL=http://localhost:3000

# EmailJS (optionnel - utilisé si API échoue)
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_USER_ID=your_user_id
```

💡 **Système hybride** : Le frontend essaie d'abord l'API backend. Si elle échoue et qu'EmailJS est configuré, il utilise EmailJS automatiquement comme solution de secours.

## 🏃 Démarrage

### Mode développement
```bash
npm start
```

L'application démarre sur `http://localhost:3001`

### Build pour production
```bash
npm run build
```

Les fichiers de production sont générés dans le dossier `build/`.

## 📋 Fonctionnement

### Flux utilisateur

1. **Token dans l'URL** : L'utilisateur reçoit un email avec un lien contenant un token unique :
   ```
   http://localhost:3001/feedback?token=abc123...
   ```

2. **Validation du token** : Au chargement, l'application valide le token auprès du backend :
   - Token valide → affiche les étoiles pour noter
   - Token invalide → affiche un message d'erreur
   - Déjà voté → affiche un message de remerciement

3. **Notation** :
   - Note >= 4 étoiles → redirection vers la page Google Avis
   - Note < 4 étoiles → affiche le formulaire de commentaire

4. **Formulaire** (notes < 4) :
   - Champs : Nom (optionnel) et Commentaire (optionnel)
   - Envoi au backend → email interne au podologue
   - Message de confirmation

## 🎨 Structure des composants

```
src/
├── App.js                    # Composant principal, gestion du token et du flux
├── components/
│   ├── Header.js            # En-tête avec logo
│   ├── Stars.js             # Système de notation par étoiles
│   └── FeedbackForm.js      # Formulaire de commentaire (notes < 4)
├── App.css                  # Styles principaux
├── index.css               # Styles globaux
└── Ressources/
    └── logo.png            # Logo du cabinet
```

## 🔗 API Backend

L'application communique avec le backend via les endpoints suivants :

### `GET /api/vote/validate?token=xxx`
Valide un token avant affichage

**Response:**
```json
{
  "valid": true,
  "alreadyVoted": false
}
```

### `POST /api/vote`
Soumet un vote

**Body:**
```json
{
  "token": "abc123...",
  "note": 5,
  "commentaire": "Excellent service!"
}
```

**Response (note >= 4):**
```json
{
  "redirectUrl": "https://search.google.com/local/writereview?placeid=..."
}
```

**Response (note < 4):**
```json
{
  "ok": true
}
```

## 🎨 Personnalisation

### Logo
Remplacer le fichier `src/Ressources/logo.png` par votre propre logo.

### Couleurs
Modifier les variables CSS dans `src/App.css` et `src/index.css`.

### Textes
Modifier les textes directement dans les composants :
- `src/components/Header.js` - Titre de l'en-tête
- `src/components/FeedbackForm.js` - Textes du formulaire

## 🐛 Dépannage

### "Token manquant"
L'utilisateur doit accéder à la page via le lien reçu par email contenant le paramètre `?token=...`

### "Token invalide ou expiré"
- Le token n'existe pas dans la base de données
- Vérifier que le backend est accessible

### "Erreur de connexion au serveur"
- Vérifier que le backend est démarré
- Vérifier l'URL du backend dans `.env`
- Vérifier que CORS est activé sur le backend

## 🚀 Déploiement

### Netlify / Vercel
1. Connecter votre repository
2. Configurer la variable d'environnement `REACT_APP_API_URL` avec l'URL du backend en production
3. Build command : `npm run build`
4. Publish directory : `build`

### Serveur Apache/Nginx
1. Builder l'application : `npm run build`
2. Copier le contenu du dossier `build/` vers votre serveur web
3. Configurer la réécriture d'URL pour le routing React

Exemple Nginx :
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 📄 Licence

Projet privé - Tous droits réservés
