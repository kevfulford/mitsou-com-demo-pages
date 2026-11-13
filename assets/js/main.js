/* mitsou.com — scripts partagés (chargés avec defer).
   Chaque bloc vérifie la présence de ses éléments : le même fichier sert aussi à la page Biographie. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── En-tête : fond plein une fois la page défilée ───────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ───────── Menu mobile ───────── */
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  if (menuBtn && nav) {
    const label = menuBtn.querySelector('.menu-label');
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('menu-open', open);
      if (header) header.classList.toggle('menu-open', open);
      if (label) label.textContent = open ? 'Fermer' : 'Menu';
    };
    menuBtn.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        menuBtn.focus();
      }
    });
    // Un lien interne choisi dans le menu ferme le panneau
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
  }

  /* ───────── Vidéo du tissu : lecture seulement si les animations sont permises ───────── */
  const bg = document.querySelector('.show-intro__video');
  if (bg && !reduceMotion) {
    bg.muted = true;
    const start = () => {
      const play = bg.play();
      if (play && typeof play.catch === 'function') play.catch(() => { /* lecture refusée : l'affiche reste */ });
    };
    // preload="none" : la vidéo (≈ 0,6 à 2 Mo) ne se télécharge qu'à l'approche de la section
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
      }, { rootMargin: '400px 0px' });
      io.observe(bg);
    } else {
      start();
    }
  }

  /* ───────── Discographie ───────── */
  const RELEASES = {
    singles: [
      { title: "Lettre à un cowboy", year: "2026", type: "Avec Clement Jacques", img: "assets/images/covers/lettre-a-un-cowboy.webp", isNew: true, spotify: "https://li.sten.to/lettreauncowboy", apple: "https://li.sten.to/lettreauncowboy" },
      { title: "C'est chaud", year: "2026", type: "Feat. Ya Cetidon", img: "assets/images/covers/cest-chaud.webp", spotify: "https://open.spotify.com/album/6tRBX3djX7xkVUBiBhabRs?si=R7X3VNjOR-CwDsMv9lG_vg", apple: "https://music.apple.com/ca/album/cest-chaud-hot-single/6766558831" },
      { title: "Cowgirl", year: "2023", type: "Feat. Laurence Nerbonne", img: "assets/images/covers/cowgirl.webp", spotify: "https://open.spotify.com/album/6nqc1QrbcQrAPm1g1fmc5z?si=iqNMl6HFQmKweOeQvy9rcw", apple: "https://music.apple.com/ca/album/cowgirl-single/1710181937?l=fr-CA" }
    ],
    albums: [
      { title: "El Mundo", year: "1988", type: "Album", img: "assets/images/covers/el-mundo.webp", spotify: "https://open.spotify.com/album/4D6wuQ8XhohLC7YCNAbrX2?si=lHRqx3_zTrGYKwPWXsQRhQ", apple: "https://music.apple.com/ca/album/el-mundo/281971160?l=fr-CA" },
      { title: "Terre des hommes", year: "1990", type: "Album", img: "assets/images/covers/terre-des-hommes.webp", spotify: "https://open.spotify.com/album/6yn39Hv1ROMpE2kSxzW78a?si=0S1ffoVsSp6fTE5DebuZ-A", apple: "https://music.apple.com/ca/album/terre-des-hommes/281979577?l=fr-CA" },
      { title: "Heading West", year: "1992", type: "Album", img: "assets/images/covers/heading-west.webp", spotify: "https://open.spotify.com/album/5om44XzFFYnonlVMIdy1H7?si=VWRA8a7-QC6BirVeNXzeyw", apple: "https://music.apple.com/ca/album/heading-west/281985536?l=fr-CA" },
      { title: "Tempted", year: "1993", type: "Album", img: "assets/images/covers/tempted.webp", spotify: "https://open.spotify.com/album/0FoRtI7M1f9EQek3c5IJu8?si=XLntLDEdRISkH0FwLr1U4g", apple: "https://music.apple.com/ca/album/tempted/281989842?l=fr-CA" },
      { title: "Ya ya", year: "1994", type: "Album", img: "assets/images/covers/yaya.webp", spotify: "https://open.spotify.com/album/4LoFYd5YLjnKo2KTRuf9dz?si=i1kdXEh5RCeBBrmw375zDw", apple: "https://music.apple.com/ca/album/ya-ya/281992691?l=fr-CA" },
      { title: "Mitsou Noël", year: "1996", type: "Album · Noël", img: "assets/images/covers/noel.webp", spotify: "https://open.spotify.com/album/6LQKR7BFu6pmxMNKErfOob?si=cLKk1wsVS6yDUnEUhlMG9g", apple: "https://music.apple.com/ca/album/noel/282008117?l=fr-CA" },
      { title: "Mitsou", year: "1999", type: "Album", img: "assets/images/covers/mitsou.webp", spotify: "https://open.spotify.com/album/32i0OqbQhsrpoi9aqHph9h?si=KtoYmAoXR1Gh1p0-TYrAoA", apple: "https://music.apple.com/ca/album/mitsou/1530579305?l=fr-CA" },
      { title: "Vibe", year: "2010", type: "Album", img: "assets/images/covers/vibe.webp", spotify: "https://open.spotify.com/album/6FFEQrXOmoQoOZf05W8rlV?si=QAWTkCpcSgaZmGeFE5wc4A", apple: "https://music.apple.com/ca/album/vibe-ep/1530524082?l=fr-CA" }
    ]
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const chip = (url, label, title) => url
    ? `<a class="chip" href="${esc(url)}" target="_blank" rel="noopener">${label}<span class="sr-only"> — ${esc(title)} (nouvel onglet)</span></a>`
    : '';

  const card = (r) => `
    <li class="card">
      <div class="card__cover">
        <img src="${esc(r.img)}" alt="Pochette de ${esc(r.title)}" width="500" height="500" loading="lazy" decoding="async">
        ${r.isNew ? '<span class="card__tag">Nouveau</span>' : ''}
      </div>
      <div class="card__meta"><span class="card__title">${esc(r.title)}</span><span class="card__year">${esc(r.year)}</span></div>
      <p class="card__type">${esc(r.type)}</p>
      <div class="card__links">${chip(r.spotify, 'Spotify', r.title)}${chip(r.apple, 'Apple', r.title)}</div>
    </li>`;

  Object.entries(RELEASES).forEach(([key, list]) => {
    const track = document.querySelector(`.shelf__track[data-shelf="${key}"]`);
    if (!track) return;
    track.innerHTML = list.map(card).join('');

    const shelf = track.closest('.shelf');
    const buttons = shelf ? shelf.querySelectorAll('.shelf__nav button') : [];
    if (buttons.length !== 2) return;
    const [prev, next] = buttons;
    const update = () => {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    buttons.forEach((b) => b.addEventListener('click', () => {
      track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.75, behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
