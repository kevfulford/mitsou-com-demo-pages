# mitsou.com

Site d'artiste de Mitsou Gélinas : deux pages statiques en français, Musique (`/`) et Biographie (`/biographie`).

HTML, CSS et JS statiques, sans étape de build ni dépendance npm. Les textes se modifient directement dans le HTML.

## Structure

```
index.html            page Musique (accueil) : El Mundo de Mitsou, Lettre à un cowboy, discographie
biographie.html       page Biographie (servie à /biographie par le .htaccess)
404.html              page d'erreur (chemins ramenés à la racine par <base href="/">)
assets/css/main.css   styles de tout le site (jetons, en-tête, pied de page, pages)
assets/js/main.js     en-tête, menu mobile, vidéo du tissu, discographie (chargé avec defer)
assets/images/        photos en WebP (plusieurs tailles), pochettes, images de partage
assets/video/         boucles du tissu rouge (WebM, MP4) et leur affiche
assets/fonts/         polices Futura et Eurostile — non versionnées (voir plus bas)
.htaccess             configuration Apache du serveur (URL propres, sécurité, cache)
scripts/deploy.sh     mise en production sur le serveur
docs/                 documentation (DEPLOYMENT.md)
```

Après une modification de `main.css` ou `main.js`, augmenter le numéro `?v=` dans les pages pour contourner le cache de Cloudflare.

Les polices sont sous licence : elles ne sont jamais versionnées dans ce dépôt public. En local, copier les `.woff2` dans `assets/fonts/`. La démo les récupère du dépôt privé `kevfulford/mitsou-com-fonts`.

## Travailler en local

```bash
python3 -m http.server 8080      # puis http://localhost:8080
```

Le `.htaccess` n'est pas appliqué en local : ouvrir `biographie.html` plutôt que `/biographie`.

## Branches

- `main` : production, toujours égale à ce qui est en ligne. Une étiquette par mise en production (`v0.9.0`, `v1.0.0`…).
- `develop` : version de travail, publiée en démo sur GitHub Pages.
- `feature/…`, `fix/…` : une modification à la fois, fusionnée dans `develop` par PR.

Tout le détail (démo, installation sur le serveur, mise en production, retour arrière) : [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
