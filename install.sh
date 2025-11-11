#!/bin/bash

# Script d'installation automatique - Projet Avis Podologue
# Usage: bash install.sh

set -e

echo "============================================"
echo "  Installation Projet Avis Podologue"
echo "============================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les erreurs
error() {
    echo -e "${RED}❌ Erreur: $1${NC}"
    exit 1
}

# Fonction pour afficher les succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher les infos
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Vérifier Node.js
echo "Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé. Installez Node.js 18+ depuis https://nodejs.org"
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js version 18+ requis. Version actuelle: $(node -v)"
fi
success "Node.js $(node -v) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
fi
success "npm $(npm -v) détecté"

echo ""
echo "============================================"
echo "  Installation du Backend"
echo "============================================"
echo ""

cd Avis-google-intermediraire/back

# Installer les dépendances backend
info "Installation des dépendances backend..."
npm install || error "Échec de l'installation des dépendances backend"
success "Dépendances backend installées"

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    info "Création du fichier .env..."
    cp env.example .env
    success "Fichier .env créé"
    info "⚠️  IMPORTANT: Éditez le fichier Avis-google-intermediraire/back/.env avec vos credentials"
else
    info "Le fichier .env existe déjà"
fi

# Créer le dossier data s'il n'existe pas
if [ ! -d data ]; then
    mkdir -p data
    success "Dossier data/ créé"
fi

cd ../..

echo ""
echo "============================================"
echo "  Installation du Frontend"
echo "============================================"
echo ""

cd Avis-google-intermediraire/front

# Installer les dépendances frontend
info "Installation des dépendances frontend..."
npm install || error "Échec de l'installation des dépendances frontend"
success "Dépendances frontend installées"

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    info "Création du fichier .env..."
    cp env.example .env
    success "Fichier .env créé"
else
    info "Le fichier .env existe déjà"
fi

cd ../..

echo ""
echo "============================================"
echo "  Installation terminée ! 🎉"
echo "============================================"
echo ""
echo "Prochaines étapes:"
echo ""
echo "1️⃣  Configurer le backend:"
echo "   cd Avis-google-intermediraire/back"
echo "   nano .env  # Éditer avec vos credentials"
echo ""
echo "2️⃣  (Optionnel) Configurer Google Calendar:"
echo "   # Placer credentials.json dans back/"
echo "   npm run generate-google-token"
echo ""
echo "3️⃣  Démarrer le backend:"
echo "   npm run start:dev"
echo "   # Le backend démarre sur http://localhost:3000"
echo ""
echo "4️⃣  Démarrer le frontend (nouveau terminal):"
echo "   cd Avis-google-intermediraire/front"
echo "   npm start"
echo "   # Le frontend démarre sur http://localhost:3001"
echo ""
echo "📚 Documentation:"
echo "   - Guide rapide: QUICKSTART.md"
echo "   - Documentation complète: README.md"
echo "   - Dépannage: TROUBLESHOOTING.md"
echo ""
success "Installation réussie !"



