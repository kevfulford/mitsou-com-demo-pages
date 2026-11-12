# Flux de travail et déploiement — mitsou.com

Même principe que Mitsou Magazine : on pousse sur GitHub, puis on fait `git pull` sur le serveur depuis le Terminal de cPanel. La démo pour approbation est publiée automatiquement sur GitHub Pages.

---

## 1. Vue d'ensemble

```
feature/*  ──PR──►  develop  ──(GitHub Actions)──►  Démo GitHub Pages  ──► lien envoyé au client
                       │
                       └──PR (après approbation)──►  main  ──(git pull dans cPanel)──►  mitsou.com
```

| Branche | Rôle | Où elle est publiée |
|---|---|---|
| `main` | Production. Toujours égale à ce qui est en ligne. | Serveur cPanel, dossier de mitsou.com, par `git pull` manuel |
| `develop` | Version de travail approuvable. | GitHub Pages (automatique à chaque push) |
| `feature/…`, `fix/…` | Une modification à la fois. | Nulle part ; fusionnée dans `develop` par PR |

Versions : une étiquette par mise en production (`v1.0.0`, `v1.0.1`…). L'état actuel du site, importé du serveur, reçoit `v0.9.0` : c'est le point de retour arrière.

## 2. Polices et dépôt public

Le dépôt `kevfulford/mitsou-com-demo-pages` reste **public** pour que GitHub Pages soit gratuit. Les polices Futura Std et Eurostile sont commerciales : **elles ne doivent jamais être dans ce dépôt.**

- `assets/fonts/` est ignoré par Git (`.gitignore`).
- **En local** : copier les `.woff2` dans `assets/fonts/` une fois.
- **Sur le serveur** : les téléverser une fois dans `assets/fonts/` (FTP ou Gestionnaire de fichiers). Comme ils ne sont pas suivis par Git, `git pull` ne les touche jamais.
- **Pour la démo** : un deuxième dépôt **privé**, `kevfulford/mitsou-com-fonts`, contient seulement les `.woff2` à sa racine. Le flux GitHub Actions les récupère au moment de publier la démo.

Note : une fois servies sur un site web (démo ou production), les polices sont téléchargeables par le navigateur, comme sur n'importe quel site. C'est l'usage normal d'une licence webfont ; ce qui pose problème, c'est de les offrir en téléchargement dans un dépôt public. **Vérifier que les licences couvrent l'usage web.**

## 3. Mise en place sur GitHub (une seule fois)

1. **Branche `develop`** : créer `develop` à partir de `main` et la pousser.
2. **Dépôt des polices** : créer `kevfulford/mitsou-com-fonts` (privé), y déposer les 7 fichiers `.woff2` (voir `INTEGRATION_BRIEF.md` § 5).
3. **Jeton d'accès** : dans GitHub, Settings → Developer settings → Fine-grained tokens → nouveau jeton :
   - Repository access : seulement `mitsou-com-fonts` ;
   - Permissions : Contents → Read-only ;
   - expiration : 1 an (noter la date pour le renouveler).
4. **Secret** : dans `mitsou-com-demo-pages`, Settings → Secrets and variables → Actions → New repository secret, nom `FONTS_REPO_TOKEN`, valeur = le jeton.
5. **Pages** : Settings → Pages → Source : **GitHub Actions**.
6. Ajouter `.github/workflows/demo-pages.yml` (copie de `templates/.github/workflows/demo-pages.yml`) et pousser sur `develop`. La démo apparaît à :
   `https://kevfulford.github.io/mitsou-com-demo-pages/`
7. (Recommandé) Settings → Branches : protéger `main` (fusion seulement par PR).

La démo n'a pas de mot de passe : le lien est public mais non indexé (le flux ajoute `noindex, nofollow` aux pages publiées). Ne pas y mettre de contenu confidentiel.

## 4. Mise en place sur le serveur (une seule fois)

Prérequis : `main` contient déjà exactement les fichiers du serveur (étape 1 du brief), sans les polices.

Dans cPanel → **Terminal** :

```bash
# 1. Repérer le dossier de mitsou.com (à adapter)
SITE=~/mitsou.com          # ← remplacer par le vrai chemin
cd "$SITE" && pwd && ls -la

# 2. Sauvegarde complète avant toute chose
mkdir -p ~/backups
tar -czf ~/backups/mitsou.com-$(date +%Y%m%d-%H%M).tar.gz -C "$(dirname "$SITE")" "$(basename "$SITE")"
ls -lh ~/backups

# 3. Transformer le dossier en clone Git, sans le déplacer
cd "$SITE"
git init -b main
git remote add origin https://github.com/kevfulford/mitsou-com-demo-pages.git
git fetch origin
git diff --stat origin/main      # doit être vide ou presque : sinon, comprendre les écarts avant de continuer
git reset --hard origin/main     # aligne les fichiers suivis sur main ; les fichiers ignorés (polices) restent
git branch --set-upstream-to=origin/main main

# 4. Vérifier
git status                       # fichiers non suivis : seulement ceux qui doivent rester hors Git
ls assets/fonts                  # les 7 polices doivent être là
```

Le dépôt étant public, **aucune clé ni aucun mot de passe GitHub n'est nécessaire sur le serveur** pour faire `git pull` en HTTPS.

**Sécurité :** le dossier du site contient maintenant un dossier `.git`. Le `.htaccess` (modèle dans `templates/`) le bloque, ainsi que les fichiers `.md`, `docs/` et `scripts/`. Vérifier après installation :
- `https://mitsou.com/.git/HEAD` → doit renvoyer 404 ;
- `https://mitsou.com/README.md` → 404.

Le `.htaccess` est lu par Apache sur le serveur ; Cloudflare, placé devant, n'empêche pas ces règles de fonctionner. Ce qu'on ne contrôle pas sans accès à Cloudflare, c'est son cache et ses options (Rocket Loader, etc.).

## 5. Cycle de travail habituel

```bash
# Nouvelle modification
git switch develop && git pull
git switch -c feature/mon-changement
# … travail, commits …
git push -u origin feature/mon-changement
# → PR vers develop, fusion → la démo se met à jour (1 à 2 minutes)
```

Envoyer au client le lien de la démo. Après approbation :

1. Monter le numéro de version des CSS et JS dans le HTML (`main.css?v=1.0.1`) : c'est ce qui contourne le cache de Cloudflare.
2. PR `develop` → `main`, fusion.
3. Étiquette : `git switch main && git pull && git tag -a v1.0.1 -m "…" && git push origin v1.0.1`.
4. Déployer sur le serveur (§ 6).

## 6. Mettre en production

Dans cPanel → Terminal :

```bash
cd ~/mitsou.com              # ← vrai chemin
bash scripts/deploy.sh
```

Le script refuse de continuer s'il y a des modifications locales sur le serveur, affiche les commits qui vont être appliqués, puis fait un `git pull --ff-only`. Sans le script : `git pull --ff-only`.

**Règle d'or : ne plus jamais modifier les fichiers suivis directement sur le serveur** (FTP, Gestionnaire de fichiers). Toute modification passe par GitHub, sinon le prochain `git pull` échouera.

Vérifier ensuite le site dans une fenêtre privée (le HTML n'est généralement pas mis en cache par Cloudflare ; les CSS et JS le sont, d'où le numéro de version).

## 7. Revenir en arrière

```bash
cd ~/mitsou.com
git fetch --tags
git reset --hard v1.0.0      # ← la dernière version correcte
```

Corriger ensuite sur GitHub (nouvelle version), puis revenir au flux normal sur le serveur :

```bash
git fetch origin && git reset --hard origin/main
```

Dernier recours : restaurer l'archive de `~/backups/`.

## 8. Travailler en local

Pas de build : ouvrir le dossier avec un petit serveur statique.

```bash
cd ~/Sites/mitsou-com-demo-pages
python3 -m http.server 8080      # puis http://localhost:8080
```

Le `.htaccess` n'est pas appliqué en local, c'est normal.

## 9. À ne pas versionner

- Polices (`assets/fonts/`).
- `CLAUDE.md` et tout fichier de contexte pour Claude Code.
- Ce dossier de passation et `source-media/`.
- Sauvegardes, `error_log`, fichiers de cPanel.
- Tout chemin, nom d'utilisateur ou détail du serveur : le dépôt est public, la documentation qui s'y trouve doit rester générique.
