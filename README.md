# mitsou.com

Site d'artiste de Mitsou Gélinas : deux pages statiques en français, Musique (`/`) et Biographie (`/biographie`).

HTML, CSS et JS statiques, sans étape de build ni dépendance npm. Les textes se modifient directement dans le HTML.

## Structure

```
index.html          page Musique (accueil)
biographie.html     page Biographie (servie à /biographie par le .htaccess)
404.html            page d'erreur
assets/             CSS, images, icônes
assets/fonts/       polices — NON versionnées (voir plus bas)
.htaccess           configuration Apache du serveur (URL propres, sécurité, cache)
scripts/deploy.sh   mise en production sur le serveur
docs/               documentation (DEPLOYMENT.md)
```

## Travailler en local

```bash
python3 -m http.server 8080      # puis http://localhost:8080
```

Le `.htaccess` n'est pas appliqué en local : ouvrir `biographie.html` plutôt que `/biographie`.

## Polices

Futura Std et Eurostile sont des polices commerciales. **Elles ne doivent jamais être ajoutées à ce dépôt public.** `assets/fonts/` est ignoré par Git : copier les fichiers `.woff2` à la main, une fois, en local et sur le serveur.

## Branches

- `main` : production, toujours égale à ce qui est en ligne. Une étiquette par mise en production (`v0.9.0`, `v1.0.0`…).
- `develop` : version de travail, publiée en démo sur GitHub Pages.
- `feature/…`, `fix/…` : une modification à la fois, fusionnée dans `develop` par PR.

Tout le détail (démo, installation sur le serveur, mise en production, retour arrière) : [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
