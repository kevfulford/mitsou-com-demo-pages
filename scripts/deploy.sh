#!/usr/bin/env bash
# Met en production la dernière version de la branche suivie (main).
# À lancer depuis le Terminal cPanel :  bash scripts/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."
branch="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$branch" != "main" ]]; then
  echo "Attention : la branche actuelle est « $branch », pas « main »."
  read -r -p "Continuer quand même ? (o/N) " answer
  [[ "$answer" == "o" ]] || exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Arrêt : des fichiers suivis ont été modifiés directement sur le serveur."
  git status --short
  echo "Ces changements doivent passer par GitHub. Voir docs/DEPLOYMENT.md."
  exit 1
fi

git fetch --tags origin

pending="$(git log --oneline HEAD..origin/"$branch")"
if [[ -z "$pending" ]]; then
  echo "Rien à déployer : le serveur est déjà à jour ($(git describe --tags --always))."
  exit 0
fi

echo "Changements à mettre en ligne :"
echo "$pending"
read -r -p "Déployer ? (o/N) " answer
[[ "$answer" == "o" ]] || exit 1

git pull --ff-only origin "$branch"

echo "Déployé : $(git log -1 --format='%h %s') — version $(git describe --tags --always)"
[[ -d assets/fonts ]] && [[ -n "$(ls -A assets/fonts 2>/dev/null)" ]] \
  || echo "ATTENTION : assets/fonts/ est vide. Téléverser les polices."
