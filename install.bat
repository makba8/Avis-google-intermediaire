@echo off
REM Script d'installation automatique - Projet Avis Podologue (Windows)
REM Usage: install.bat

echo ============================================
echo   Installation Projet Avis Podologue
echo ============================================
echo.

REM Vérifier Node.js
echo Verification des prerequis...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe. Installez Node.js 18+ depuis https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js detecte
node --version

REM Vérifier npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] npm n'est pas installe
    pause
    exit /b 1
)

echo [OK] npm detecte
npm --version

echo.
echo ============================================
echo   Installation du Backend
echo ============================================
echo.

cd Avis-google-intermediraire\back

REM Installer les dépendances backend
echo Installation des dependances backend...
call npm install
if errorlevel 1 (
    echo [ERREUR] Echec de l'installation des dependances backend
    pause
    exit /b 1
)
echo [OK] Dependances backend installees

REM Créer le fichier .env s'il n'existe pas
if not exist .env (
    echo Creation du fichier .env...
    copy env.example .env
    echo [OK] Fichier .env cree
    echo [INFO] IMPORTANT: Editez le fichier Avis-google-intermediraire\back\.env avec vos credentials
) else (
    echo [INFO] Le fichier .env existe deja
)

REM Créer le dossier data s'il n'existe pas
if not exist data mkdir data
echo [OK] Dossier data\ pret

cd ..\..

echo.
echo ============================================
echo   Installation du Frontend
echo ============================================
echo.

cd Avis-google-intermediraire\front

REM Installer les dépendances frontend
echo Installation des dependances frontend...
call npm install
if errorlevel 1 (
    echo [ERREUR] Echec de l'installation des dependances frontend
    pause
    exit /b 1
)
echo [OK] Dependances frontend installees

REM Créer le fichier .env s'il n'existe pas
if not exist .env (
    echo Creation du fichier .env...
    copy env.example .env
    echo [OK] Fichier .env cree
) else (
    echo [INFO] Le fichier .env existe deja
)

cd ..\..

echo.
echo ============================================
echo   Installation terminee ! 🎉
echo ============================================
echo.
echo Prochaines etapes:
echo.
echo 1. Configurer le backend:
echo    cd Avis-google-intermediraire\back
echo    notepad .env  # Editer avec vos credentials
echo.
echo 2. (Optionnel) Configurer Google Calendar:
echo    # Placer credentials.json dans back\
echo    npm run generate-google-token
echo.
echo 3. Demarrer le backend:
echo    npm run start:dev
echo    # Le backend demarre sur http://localhost:3000
echo.
echo 4. Demarrer le frontend (nouveau terminal):
echo    cd Avis-google-intermediraire\front
echo    npm start
echo    # Le frontend demarre sur http://localhost:3001
echo.
echo Documentation:
echo    - Guide rapide: QUICKSTART.md
echo    - Documentation complete: README.md
echo    - Depannage: TROUBLESHOOTING.md
echo.
echo [OK] Installation reussie !
echo.
pause



