<h1>REAMDE</h1>

<h2>Git</h2>

<h3>Trunk-base</h3>
<p>La branche principale (main) est toujours stable et prête pour la production.</p>
<p>Les merges sont fréquents pour éviter les conflits massifs.</p>

<h4>Branches et gestion des issues</h4>
<p>Créer une issue sur GitHub/GitLab avant de commencer une tâche.</p>

<p>Nommer la branche en lien avec l’issue, par exemple : <br>
git checkout -b feature/2-creer-une-partie</p>

<p>Utilisation de préfixes pour classifier les branches : <br>

feature/xxx-description → Pour une nouvelle fonctionnalité. <br>
bugfix/xxx-description → Pour corriger un bug. <br>
hotfix/xxx-description → Correction urgente sur main. <br>
chore/xxx-description → Pour la maintenance (ex: refactoring, CI/CD). <br></p>

<h3>Gestion des Pull Requests</h3>
<h4>Créer une Pull Request (PR) bien structurée</h4>
<p>Avant d'ouvrir une PR : <br>

 - S’assurer que les tests passent : <br>

npm run test <br><br>

- Faire un commit propre et bien écrit : <br>

git commit -m "feature : créer une partie (#1)" <br>
feature: → nouvelle fonctionnalité <br>
fix: → correction de bug <br>
chore: → maintenance, CI/CD <br>
Lien avec l’issue en ajoutant (#42) <br><br>


 - Mettre à jour main et rebase avant la PR : <br>

git checkout main <br>
git pull origin main <br>
git checkout feature/42-ajouter-websocket-chat <br>
git rebase main <br>
⚠️ Éviter git merge main pour garder un historique propre. <br><br>

- Pousser la branche et ouvrir une PR : <br>

git push origin feature/2-creer-une-partie <br><br>

- Ajouter un titre clair : <br>
"[Feature] Créer une partie (#2)" <br><br>

- Description structurée :
## 📝 Description
Implémente un chat en WebSocket pour les salons.

## 🎯 Objectif
- Permettre aux joueurs de discuter en temps réel.
- Synchroniser avec WebSockets.

## ✅ Tests effectués
- Connexion entre plusieurs utilisateurs
- Envoi et réception des messages
- Gestion des déconnexions

## 🛠️ Comment tester ?
1. Créer une salle.
2. Se connecter avec plusieurs utilisateurs.
3. Vérifier que les messages sont bien transmis.

## 🖇️ Liée à l'issue #42
Assigner un reviewer.
Réviser et fusionner avec un squash merge
</p>

git checkout main <br>
git pull origin main <br>
git merge --squash feature/42-ajouter-websocket-chat <br>
git push origin main <br>
Pourquoi --squash ? <br>
Pour garder un historique propre avec un seul commit. <br>

<h3>Gérer efficacement les conflits Git</h3>
<h4>Anticiper les conflits</h4>
<p>Faire des commits et pushs réguliers pour éviter un écart trop grand avec main. <br>
Rebase fréquemment la branche de travail pour rester à jour : </p>

git checkout feature/42-ajouter-websocket-chat <br>
git fetch origin <br>
git rebase origin/main <br>
<h4Résolution des conflits en pratique</h4>
- Identifier les fichiers en conflit : <br>

git status <br>
Ouvrir et corriger les fichiers conflictuels (Git indique <<<<<<<, =======, >>>>>>>). <br><br>

- Marquer les conflits comme résolus : <br>

git add <fichier_conflit> <br><br>
 - Continuer le rebase : <br>
git rebase --continue <br>
 - Si erreur : <br>
git rebase --abort  # Pour annuler le rebase <br>
git rebase --skip   # Pour sauter un commit problématique <br>
