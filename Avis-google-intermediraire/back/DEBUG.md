# 🐛 Guide de Débogage - Backend NestJS

Guide pour utiliser le debugger intégré de VS Code/Cursor avec le backend.

## 🚀 Démarrage rapide

### Méthode 1 : Debug direct (Recommandé)

1. **Ouvrir VS Code/Cursor** dans le dossier racine du projet
2. **Ouvrir l'onglet "Run and Debug"** :
   - Raccourci : `Ctrl+Shift+D`
   - Ou clic sur l'icône de bug dans la barre latérale
3. **Sélectionner** "Debug NestJS Backend" dans le menu déroulant en haut
4. **Cliquer sur le bouton Play** (ou appuyer sur `F5`)
5. Le backend démarre en mode debug ! 🎉

### Méthode 2 : Attacher à un processus existant

Si le backend tourne déjà avec `npm run start:debug` :

1. Sélectionner **"Attach to NestJS (Port 9229)"**
2. Cliquer sur Play (`F5`)

---

## 🎯 Utilisation

### Ajouter un point d'arrêt (Breakpoint)

1. Ouvrir un fichier TypeScript (ex: `src/vote/vote.controller.ts`)
2. Cliquer dans la **marge gauche** (à côté du numéro de ligne)
3. Un **point rouge** apparaît = point d'arrêt actif

### Déclencher un point d'arrêt

1. Faire une requête API qui passe par votre code :
   - Via Bruno : Exécuter une requête
   - Via Postman : Envoyer une requête
   - Via curl : `curl -X POST http://localhost:3000/api/vote ...`
   - Via le frontend : Cliquer sur une étoile

2. Le code **s'arrête** au point d'arrêt
3. La ligne est **surlignée en jaune**

### Inspecter les variables

**Méthode 1 : Survol**
- Passez la souris sur une variable → sa valeur s'affiche

**Méthode 2 : Panneau Variables**
- Panneau gauche "Variables" → voir toutes les variables locales

**Méthode 3 : Watch**
- Panneau "Watch" → ajouter des expressions à surveiller
- Exemple : `token`, `note`, `body.token`

**Méthode 4 : Console de debug**
- Panneau "Debug Console" → taper des expressions
- Exemple : `token`, `JSON.stringify(body)`

### Contrôles de navigation

| Raccourci | Action | Description |
|-----------|--------|-------------|
| **F5** | Continue | Continue l'exécution jusqu'au prochain breakpoint |
| **F10** | Step Over | Passe à la ligne suivante (sans entrer dans les fonctions) |
| **F11** | Step Into | Entre dans la fonction appelée |
| **Shift+F11** | Step Out | Sort de la fonction actuelle |
| **Ctrl+Shift+F5** | Restart | Redémarre le debugger |
| **Shift+F5** | Stop | Arrête le debugger |

---

## 📍 Exemples de points d'arrêt utiles

### Dans `vote.controller.ts` (ligne 11)
```typescript
async vote(@Body() body: CreateVoteDto) {
  // ← Point d'arrêt ici pour voir le body reçu
  const res = await this.voteService.createVote(...)
}
```

**Ce que vous verrez :**
- `body.token` : Le token reçu
- `body.note` : La note (1-5)
- `body.commentaire` : Le commentaire (si présent)

### Dans `vote.service.ts` (ligne 22)
```typescript
const rdv = await manager.findOne(Rdv, { where: { token } });
// ← Point d'arrêt ici pour voir si le RDV existe
if (!rdv) throw new BadRequestException('Invalid token');
```

**Ce que vous verrez :**
- `token` : Le token recherché
- `rdv` : L'objet RDV trouvé (ou null)

### Dans `google.service.ts` (ligne 48)
```typescript
if (fs.existsSync(tokenPath)) {
  // ← Point d'arrêt ici pour vérifier le chemin
  const tok = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
}
```

---

## 🔧 Configuration

### Fichier `.vscode/launch.json`

La configuration est déjà créée avec 3 modes :

1. **Debug NestJS Backend** : Lance le backend en mode debug
2. **Attach to NestJS** : S'attache à un processus existant
3. **Debug Current TypeScript File** : Debug un fichier TS isolé

### Port de debug

Le debugger utilise le **port 9229** par défaut (standard Node.js).

Si le port est occupé :
```bash
# Windows
netstat -ano | findstr :9229

# Linux/Mac
lsof -i :9229
```

---

## 🐛 Dépannage

### Les points d'arrêt ne se déclenchent pas

**Vérifications :**
1. ✅ Le debugger est bien démarré (icône rouge dans la barre)
2. ✅ Les source maps sont activées (`tsconfig.json` : `"sourceMap": true`)
3. ✅ Vous êtes dans le bon fichier (pas dans `dist/`)
4. ✅ Le point d'arrêt est **rouge** (pas gris)

**Solution :**
- Redémarrer VS Code
- Recompiler : `npm run build`
- Redémarrer le debugger

### "Cannot connect to runtime process"

**Cause :** Le backend n'est pas en mode debug

**Solution :**
- Utiliser "Debug NestJS Backend" au lieu de "Attach"
- Ou lancer manuellement : `npm run start:debug`

### Les variables sont "undefined"

**Cause :** Le code s'arrête trop tôt ou trop tard

**Solution :**
- Déplacer le point d'arrêt
- Utiliser "Step Over" (F10) pour avancer ligne par ligne

### Le debugger est lent

**Normal :** Le mode debug est plus lent que le mode normal

**Optimisation :**
- Utiliser "Step Over" au lieu de "Step Into" pour les fonctions internes
- Limiter les breakpoints aux endroits critiques

---

## 💡 Astuces

### Debug conditionnel

Ajoutez un breakpoint conditionnel :
1. Clic droit sur le point d'arrêt
2. "Edit Breakpoint"
3. Entrer une condition : `note < 4` ou `token === 'abc123'`

### Logpoints (sans arrêter)

1. Clic droit dans la marge
2. "Add Logpoint"
3. Entrer : `Token: {token}, Note: {note}`
4. Le message s'affiche dans la console sans arrêter l'exécution

### Debug d'une requête spécifique

1. Ajouter un breakpoint dans le controller
2. Dans la console de debug, ajouter un watch : `body.token === 'votre_token_test'`
3. Faire la requête avec ce token

---

## 🎯 Scénario de test complet

### Test du flux de vote

1. **Démarrer le debugger** (F5)
2. **Ajouter des breakpoints** :
   - `vote.controller.ts` ligne 11
   - `vote.service.ts` ligne 22
   - `vote.service.ts` ligne 28
3. **Créer un RDV** via Bruno
4. **Voter** via le frontend ou Bruno
5. **Observer** le flux :
   - Le controller reçoit le body
   - Le service cherche le RDV
   - Le service crée le vote
   - Le controller retourne la réponse

---

## 📚 Ressources

- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Node.js Debugging](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [NestJS Debugging](https://docs.nestjs.com/recipes/debugging)

---

**Bon debugging ! 🐛🔍**

