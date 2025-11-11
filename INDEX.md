# 📑 Index de la Documentation

Guide complet de navigation dans la documentation du projet "Avis Podologue".

---

## 🚀 Pour commencer

| Fichier | Description | Audience | Temps |
|---------|-------------|----------|-------|
| **[QUICKSTART.md](QUICKSTART.md)** | Guide de démarrage ultra-rapide | Débutants | 10 min |
| **[README.md](README.md)** | Vue d'ensemble complète du projet | Tous | 15 min |
| **[SUMMARY.md](SUMMARY.md)** | Résumé de ce qui a été fait | Chef de projet | 5 min |
| **[TESTS.md](TESTS.md)** | Guide complet de tests avec réponses attendues | QA / Développeurs | 20 min |

---

## 📚 Documentation technique

| Fichier | Description | Audience | Temps |
|---------|-------------|----------|-------|
| **[architecture.md](architecture.md)** | Spécifications techniques complètes | Développeurs / IA | 30 min |
| **[CHANGELOG.md](CHANGELOG.md)** | Détail de toutes les modifications | Développeurs | 10 min |
| **[Avis-google-intermediraire/back/README.md](Avis-google-intermediraire/back/README.md)** | Documentation backend détaillée | Développeurs backend | 20 min |
| **[Avis-google-intermediraire/front/README.md](Avis-google-intermediraire/front/README.md)** | Documentation frontend détaillée | Développeurs frontend | 15 min |

---

## 🔧 Support et dépannage

| Fichier | Description | Audience | Temps |
|---------|-------------|----------|-------|
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Guide de dépannage complet | Support / DevOps | Variable |
| **[bruno-collection/README.md](bruno-collection/README.md)** | Tests API avec Bruno | QA / Développeurs | 15 min |

---

## 🛠️ Installation

### Scripts d'installation

| Fichier | Plateforme | Usage |
|---------|-----------|-------|
| **[install.sh](install.sh)** | Linux / macOS | `bash install.sh` |
| **[install.bat](install.bat)** | Windows | Double-clic ou `install.bat` |

### Fichiers de configuration

| Fichier | Description |
|---------|-------------|
| **[Avis-google-intermediraire/back/env.example](Avis-google-intermediraire/back/env.example)** | Template configuration backend |
| **[Avis-google-intermediraire/front/env.example](Avis-google-intermediraire/front/env.example)** | Template configuration frontend |

---

## 🐳 Déploiement

| Fichier | Description |
|---------|-------------|
| **[Avis-google-intermediraire/back/Dockerfile](Avis-google-intermediraire/back/Dockerfile)** | Image Docker backend |
| **[Avis-google-intermediraire/back/docker-compose.yml](Avis-google-intermediraire/back/docker-compose.yml)** | Orchestration Docker |

---

## 📊 Structure du projet

```
projet-avis-podologue/
│
├── 📄 INDEX.md                          ← Vous êtes ici
├── 📄 README.md                         ← Vue d'ensemble
├── 📄 QUICKSTART.md                     ← Démarrage rapide
├── 📄 SUMMARY.md                        ← Résumé
├── 📄 CHANGELOG.md                      ← Modifications
├── 📄 TROUBLESHOOTING.md               ← Dépannage
├── 📄 architecture.md                   ← Spécifications
├── 🔧 install.sh                        ← Installation Linux/macOS
├── 🔧 install.bat                       ← Installation Windows
│
└── 📁 Avis-google-intermediraire/
    │
    ├── 📁 back/                         ← Backend NestJS
    │   ├── 📄 README.md                 ← Doc backend
    │   ├── 📄 env.example               ← Config template
    │   ├── 📄 Dockerfile                ← Image Docker
    │   ├── 📄 docker-compose.yml        ← Orchestration
    │   ├── 📄 package.json              ← Dépendances
    │   │
    │   ├── 📁 src/                      ← Code source
    │   │   ├── main.ts                  ← Point d'entrée
    │   │   ├── app.module.ts            ← Module principal
    │   │   ├── 📁 config/               ← Configuration
    │   │   ├── 📁 rdv/                  ← Gestion RDV
    │   │   ├── 📁 vote/                 ← Gestion votes
    │   │   ├── 📁 mail/                 ← Envoi emails
    │   │   ├── 📁 google/               ← Google Calendar
    │   │   ├── 📁 cron/                 ← Tâches planifiées
    │   │   ├── 📁 stats/                ← Statistiques
    │   │   └── 📁 common/dtos/          ← Validation
    │   │
    │   ├── 📁 scripts/                  ← Scripts utilitaires
    │   │   ├── get_google_token.ts      ← Génération token
    │   │   └── test_google_calendar.ts  ← Test Calendar
    │   │
    │   └── 📁 data/                     ← Base de données
    │       └── avis.sqlite              ← SQLite
    │
    └── 📁 front/                        ← Frontend React
        ├── 📄 README.md                 ← Doc frontend
        ├── 📄 env.example               ← Config template
        ├── 📄 package.json              ← Dépendances
        │
        └── 📁 src/                      ← Code source
            ├── App.js                   ← Application principale
            ├── 📁 components/           ← Composants React
            │   ├── FeedbackForm.js      ← Formulaire avis
            │   ├── Header.js            ← En-tête
            │   └── Stars.js             ← Notation étoiles
            └── 📁 Ressources/           ← Assets
                └── logo.png             ← Logo cabinet
```

---

## 🎯 Parcours recommandés

### Je découvre le projet
1. [SUMMARY.md](SUMMARY.md) - Résumé rapide
2. [README.md](README.md) - Vue d'ensemble
3. [QUICKSTART.md](QUICKSTART.md) - Installation rapide

### Je veux installer le projet
1. [QUICKSTART.md](QUICKSTART.md) - Guide d'installation
2. Exécuter `install.sh` (Linux/Mac) ou `install.bat` (Windows)
3. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - En cas de problème

### Je suis développeur backend
1. [architecture.md](architecture.md) - Comprendre l'architecture
2. [Avis-google-intermediraire/back/README.md](Avis-google-intermediraire/back/README.md) - Doc backend
3. [CHANGELOG.md](CHANGELOG.md) - Modifications apportées

### Je suis développeur frontend
1. [architecture.md](architecture.md) - Comprendre l'architecture
2. [Avis-google-intermediraire/front/README.md](Avis-google-intermediraire/front/README.md) - Doc frontend
3. [CHANGELOG.md](CHANGELOG.md) - Modifications apportées

### Je prépare le déploiement
1. [README.md](README.md) - Section déploiement
2. [Avis-google-intermediraire/back/README.md](Avis-google-intermediraire/back/README.md) - Configuration Docker
3. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problèmes courants

### J'ai un problème
1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solutions problèmes courants
2. [README.md](README.md) - Section dépannage
3. Logs backend et frontend

---

## 📞 Contacts et ressources

### Documentation externe
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Google Calendar API](https://developers.google.com/calendar)
- [TypeORM Documentation](https://typeorm.io/)
- [Nodemailer Documentation](https://nodemailer.com/)

### Outils recommandés
- [Mailtrap](https://mailtrap.io/) - Test emails
- [Google Cloud Console](https://console.cloud.google.com/) - Calendar API
- [Postman](https://www.postman.com/) - Test API
- [DB Browser for SQLite](https://sqlitebrowser.org/) - Explorer DB

---

## 📈 Statut de la documentation

| Type | Statut | Complétude |
|------|--------|------------|
| Installation | ✅ Complet | 100% |
| Configuration | ✅ Complet | 100% |
| API Backend | ✅ Complet | 100% |
| Frontend | ✅ Complet | 100% |
| Déploiement | ✅ Complet | 100% |
| Dépannage | ✅ Complet | 100% |
| Architecture | ✅ Complet | 100% |

---

## 🔄 Dernière mise à jour

**Date** : 6 novembre 2025  
**Version** : 1.0 - Version Intermédiaire  
**Statut** : ✅ Projet complet et opérationnel

---

## 💡 Conseils

- 📖 **Lecture séquentielle** : Commencez par README.md
- ⚡ **Installation rapide** : Utilisez QUICKSTART.md
- 🔧 **Problème** : Consultez TROUBLESHOOTING.md en premier
- 💻 **Développement** : architecture.md est votre référence
- 📚 **Référence API** : back/README.md contient tous les endpoints

---

**Navigation rapide** : [Haut de page](#-index-de-la-documentation)



