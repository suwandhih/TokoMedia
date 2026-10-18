'use strict';
const fs = require('fs');
const path = require('path');

const uiPath = path.resolve(__dirname, '..', 'ui.json');
const ui = JSON.parse(fs.readFileSync(uiPath, 'utf8'));
const logoB64 = 'data:image/png;base64,' + fs.readFileSync(path.resolve(__dirname, '..', ui.app.brand.logo)).toString('base64');

const SITE = ui.app.siteUrl;
const categories = ui.data.categories;
const homeLanguages = ui.data.homeLanguages;
const regions = ui.data.regions;
const latestVideos = ui.data.latestVideos;
const sampleVideos = ui.data.videos;
const apps = ui.data.apps.slice(0, 48); // keep fast and representative, with full count metadata
const totalAppsCount = ui.data.apps.length;
const privacyWeb = ui.data.privacyWeb;
const privacyApp = ui.data.privacyApp;
const watchExample = ui.screens.watch.components[0].example;

const sharedDataPayload = JSON.stringify({
  siteUrl: SITE,
  channel: ui.app.channel,
  logoB64,
  totalAppsCount,
  categories: [
    { id: 'film-riwayat-isa-al-masih', title: 'Film Isa Al-Masih', subtitle: 'Kisah Kehidupan & Pelayanan', badge: 'FEATURE FILM', count: '177 Bahasa', accent: '#10B981', grad: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #10B981 100%)', icon: 'film' },
    { id: 'video', title: 'Video Kitab Suci', subtitle: 'Visualisasi Bab demi Bab', badge: 'SCRIPTURE VIDEO', count: '95 Bahasa', accent: '#3B82F6', grad: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #3B82F6 100%)', icon: 'play' },
    { id: 'clip', title: 'Clip Kitab Suci', subtitle: 'Cuplikan Pendek Bermakna', badge: 'SHORT CLIPS', count: '120+ Bahasa', accent: '#06B6D4', grad: 'linear-gradient(135deg, #164E63 0%, #0E7490 50%, #06B6D4 100%)', icon: 'scissors' },
    { id: 'app', title: 'Aplikasi Kitab Suci', subtitle: 'Unduh Aplikasi Android & Audio', badge: '269 APPS', count: 'Nusantara', accent: '#F59E0B', grad: 'linear-gradient(135deg, #78350F 0%, #B45309 50%, #F59E0B 100%)', icon: 'smartphone' },
    { id: 'film-ikatan-ilahi', title: 'Film Ikatan Ilahi', subtitle: 'Perjalanan Sejarah Perjanjian', badge: 'SERIES 12 EP', count: '42 Bahasa', accent: '#8B5CF6', grad: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #8B5CF6 100%)', icon: 'sparkles' }
  ],
  homeLanguages,
  regions,
  latestVideos,
  sampleVideos,
  apps,
  watchExample,
  privacyWeb,
  privacyApp
});

const SHARED_CLIENT_JS = `
(function() {
  const DATA = window.TM_DATA;
  const CFG = window.TM_CONFIG;
  const mainEl = document.getElementById('mainContent');
  const crumbsEl = document.getElementById('crumbs');
  const backBtn = document.getElementById('backBtn');
  const drawer = document.getElementById('drawer');
  const scrim = document.getElementById('scrim');
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const viewportStage = document.getElementById('viewportStage');

  let currentWatch = DATA.watchExample;
  let lastCategory = 'film-riwayat-isa-al-masih';
  let activeSort = 'trending';
  let activeLetter = 'A';
  let appPage = 1;
  let appFilterQuery = '';

  const allLanguagesMap = new Map();
  DATA.regions.forEach(r => r.languages.forEach(l => {
    allLanguagesMap.set(l.slug, { ...l, region: r.name });
  }));
  DATA.homeLanguages.forEach(l => {
    if (!allLanguagesMap.has(l.slug)) {
      allLanguagesMap.set(l.slug, { ...l, region: 'Nusantara' });
    } else {
      allLanguagesMap.get(l.slug).image = l.image;
    }
  });
  const allLanguages = Array.from(allLanguagesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  }

  function svgIcon(name) {
    const icons = {
      film: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
      sparkles: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>',
      play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>',
      scissors: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 5 3-5 3V9z"/></svg>',
      smartphone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
      eye: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
      heart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
      download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>'
    };
    return icons[name] || icons.play;
  }

  function renderVideoCard(v, idx, isFeatured) {
    const imgUrl = v.image ? encodeURI(DATA.siteUrl + v.image) : '';
    const viewsFormatted = Number(v.views || 0).toLocaleString('id-ID');
    const likesFormatted = v.likes ? Number(v.likes).toLocaleString('id-ID') : '128';
    return \`
      <a href="#watch" class="vcard \${isFeatured ? 'vcard--featured' : ''}"
         data-watch-idx="\${idx}"
         data-title="\${esc(v.title)}"
         data-views="\${esc(v.views)}"
         data-date="\${esc(v.date)}"
         data-date-label="\${esc(v.dateLabel)}"
         data-duration="\${esc(v.duration)}"
         data-image="\${esc(imgUrl)}"
         data-href="\${esc(v.href ? encodeURI(DATA.siteUrl + v.href) : '')}">
        <div class="vcard__media">
          \${imgUrl ? \`<img src="\${imgUrl}" alt="" loading="lazy" onerror="this.remove()">\` : ''}
          <div class="vcard__Scrim"></div>
          \${isFeatured ? '<span class="vcard__badge">PREMIERE PILIHAN</span>' : \`<span class="vcard__index">#\${String(idx + 1).padStart(2, '0')}</span>\`}
          <span class="vcard__play" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
          </span>
          <span class="vcard__duration">\${esc(v.duration)}</span>
        </div>
        <div class="vcard__body">
          <div class="vcard__topmeta">
            <span class="vcard__channel">\${esc(DATA.channel)} <span class="verified-dot" title="Terverifikasi">&#10004;</span></span>
            <span class="vcard__date">\${esc(v.dateLabel)}</span>
          </div>
          <h3 class="vcard__title">\${esc(v.title)}</h3>
          <div class="vcard__stats">
            <span class="stat-pill">\${svgIcon('eye')} \${viewsFormatted} tayangan</span>
            <span class="stat-pill stat-pill--like">\${svgIcon('heart')} \${likesFormatted}</span>
          </div>
        </div>
      </a>
    \`;
  }

  function getSortedVideos(list) {
    const copy = list.slice();
    if (activeSort === 'popular') return copy.sort((a, b) => b.views - a.views);
    if (activeSort === 'unviral') return copy.sort((a, b) => a.views - b.views);
    if (activeSort === 'newest') return copy.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (activeSort === 'oldest') return copy.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return copy;
  }

  function renderHome() {
    const heroVideo = DATA.latestVideos[0];
    const heroImg = heroVideo.image ? encodeURI(DATA.siteUrl + heroVideo.image) : '';
    const sortedLatest = getSortedVideos(DATA.latestVideos);

    const catCards = DATA.categories.map((c, i) => \`
      <a href="#languages/\${esc(c.id)}" class="cat-bento cat-bento--\${i + 1}" style="--cat-accent:\${c.accent};--cat-grad:\${c.grad}">
        <div class="cat-bento__top">
          <span class="cat-bento__badge">\${esc(c.badge)}</span>
          <span class="cat-bento__icon">\${svgIcon(c.icon)}</span>
        </div>
        <div class="cat-bento__mid">
          <h3 class="cat-bento__title">\${esc(c.title)}</h3>
          <p class="cat-bento__sub">\${esc(c.subtitle)}</p>
        </div>
        <div class="cat-bento__foot">
          <span class="cat-bento__count">\${esc(c.count)}</span>
          <span class="cat-bento__cta">Jelajahi <span>&rarr;</span></span>
        </div>
      </a>
    \`).join('');

    const letters = [...new Set(allLanguages.map(l => l.name.charAt(0).toUpperCase()))];
    if (!letters.includes(activeLetter)) activeLetter = letters[0] || 'A';
    const filteredLangs = allLanguages.filter(l => l.name.charAt(0).toUpperCase() === activeLetter);

    const spotlightBubbles = DATA.homeLanguages.slice(0, 12).map((l, i) => {
      const imgUrl = l.image ? encodeURI(DATA.siteUrl + l.image) : '';
      const initials = l.name.slice(0, 2).toUpperCase();
      return \`
        <a href="#videos/\${esc(l.slug)}" class="lang-story">
          <div class="lang-story__ring">
            <div class="lang-story__avatar">
              <span>\${esc(initials)}</span>
              \${imgUrl ? \`<img src="\${imgUrl}" alt="" loading="lazy" onerror="this.remove()">\` : ''}
            </div>
          </div>
          <span class="lang-story__name">\${esc(l.name)}</span>
        </a>
      \`;
    }).join('');

    const letterBtns = letters.map(l => \`
      <button type="button" class="alpha-btn \${l === activeLetter ? 'active' : ''}" data-alpha="\${esc(l)}">\${esc(l)}</button>
    \`).join('');

    const langCells = filteredLangs.map((l, idx) => {
      const hue = (l.name.charCodeAt(0) * 37 + idx * 19) % 360;
      return \`
        <a href="#videos/\${esc(l.slug)}" class="lang-tile" style="--tile-hue:\${hue}">
          <span class="lang-tile__mono">\${esc(l.name.slice(0, 2).toUpperCase())}</span>
          <div class="lang-tile__info">
            <span class="lang-tile__name">\${esc(l.name)}</span>
            <span class="lang-tile__region">\${esc(l.region || 'Nusantara')}</span>
          </div>
          <span class="lang-tile__arrow">&rarr;</span>
        </a>
      \`;
    }).join('');

    const sortOptions = [
      { id: 'trending', label: 'Tren Saat Ini' },
      { id: 'popular', label: 'Terpopuler' },
      { id: 'newest', label: 'Terbaru' },
      { id: 'unviral', label: 'Hidden Gems' },
      { id: 'oldest', label: 'Klasik' }
    ];

    const sortHtml = sortOptions.map(o => \`
      <button type="button" class="filter-chip \${activeSort === o.id ? 'active' : ''}" data-sort="\${o.id}">\${esc(o.label)}</button>
    \`).join('');

    mainEl.innerHTML = \`
      <!-- HERO SHOWCASE -->
      <section class="hero-showcase">
        <div class="hero-showcase__Card">
          <div class="hero-showcase__bg">
            \${heroImg ? \`<img src="\${heroImg}" alt="" onerror="this.remove()">\` : ''}
            <div class="hero-showcase__gradient"></div>
          </div>
          <div class="hero-showcase__content">
            <div class="hero-eyebrow">
              <span class="pulse-dot"></span>
              <span>\${esc(CFG.heroLabel)}</span>
            </div>
            <h1 class="hero-headline">\${esc(CFG.heroHeadline)}</h1>
            <p class="hero-sub">\${esc(CFG.heroSub)}</p>
            <div class="hero-actions">
              <a href="#watch" class="btn-hero-primary"
                 data-watch-idx="0"
                 data-title="\${esc(heroVideo.title)}"
                 data-views="\${esc(heroVideo.views)}"
                 data-date-label="\${esc(heroVideo.dateLabel)}"
                 data-image="\${esc(heroImg)}"
                 data-href="\${esc(encodeURI(DATA.siteUrl + heroVideo.href))}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span>Putar Tayangan Utama</span>
              </a>
              <a href="#languages/film-riwayat-isa-al-masih" class="btn-hero-secondary">
                <span>Eksplorasi 177 Bahasa</span>
                <span>&rarr;</span>
              </a>
            </div>
            <div class="hero-metrics">
              <div class="h-metric"><strong>16.586+</strong><span>Video &amp; Klip</span></div>
              <div class="h-metric"><strong>177</strong><span>Bahasa Daerah</span></div>
              <div class="h-metric"><strong>269</strong><span>Aplikasi Android</span></div>
              <div class="h-metric"><strong>5</strong><span>Kepulauan Besar</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 1: KATEGORI UTAMA (BENTO GRID) -->
      <section class="sec-block" id="secCategories">
        <div class="sec-header">
          <div>
            <span class="sec-eyebrow">01 / KOLEKSI MEDIA</span>
            <h2 class="sec-title">Format &amp; Kategori Utama</h2>
          </div>
          <span class="sec-caption">Pilih jenis media untuk memilih bahasa</span>
        </div>
        <div class="bento-categories">
          \${catCards}
        </div>
      </section>

      <!-- SECTION 2: EKSPLORASI BAHASA NUSANTARA -->
      <section class="sec-block sec-block--surface" id="secLanguages">
        <div class="sec-header">
          <div>
            <span class="sec-eyebrow">02 / KHASANAH BAHASA DAERAH</span>
            <h2 class="sec-title">Kategori Bahasa &amp; Suku</h2>
          </div>
          <a href="#languages/film-riwayat-isa-al-masih" class="sec-link">Lihat Menurut Kepulauan &rarr;</a>
        </div>

        <div class="lang-stories-bar" aria-label="Sorotan Bahasa">
          \${spotlightBubbles}
        </div>

        <div class="alpha-explorer">
          <div class="alpha-explorer__head">
            <div class="alpha-hero-badge">
              <span class="alpha-hero-char">\${esc(activeLetter)}</span>
              <div>
                <div class="alpha-hero-label">INDEKS ALFABET</div>
                <div class="alpha-hero-count">\${filteredLangs.length} Bahasa Berawalan "\${esc(activeLetter)}"</div>
              </div>
            </div>
            <div class="alpha-rail" role="tablist" aria-label="Filter Huruf">
              \${letterBtns}
            </div>
          </div>
          <div class="lang-tiles-grid">
            \${langCells}
          </div>
        </div>
      </section>

      <!-- SECTION 3: TAYANGAN TERBARU -->
      <section class="sec-block" id="secLatest">
        <div class="sec-header">
          <div>
            <span class="sec-eyebrow">03 / KURASI STREAMING</span>
            <h2 class="sec-title">Tayangan Terbaru &amp; Terpopuler</h2>
          </div>
          <div class="filter-chips-bar" role="group" aria-label="Urutkan video">
            \${sortHtml}
          </div>
        </div>
        <div class="video-showcase-grid">
          \${sortedLatest.map((v, i) => renderVideoCard(v, i, i === 0)).join('')}
        </div>
      </section>
    \`;
  }

  function renderRegions(categorySlug) {
    lastCategory = categorySlug || 'film-riwayat-isa-al-masih';
    const catObj = DATA.categories.find(c => c.id === lastCategory) || DATA.categories[0];

    const regionHtml = DATA.regions.map((r, idx) => \`
      <details class="region-accordion" \${idx < 2 ? 'open' : ''}>
        <summary class="region-accordion__summary">
          <div class="region-summary__left">
            <span class="region-idx">0\${idx + 1}</span>
            <div>
              <h3 class="region-name">\${esc(r.name)}</h3>
              <span class="region-sub">\${r.languages.length} bahasa daerah tersedia</span>
            </div>
          </div>
          <span class="region-badge">\${r.languages.length} Bahasa</span>
        </summary>
        <div class="region-accordion__body">
          <div class="lang-tiles-grid">
            \${r.languages.map((l, i) => {
              const hue = (l.name.charCodeAt(0) * 31 + i * 17) % 360;
              return \`
                <a href="#videos/\${esc(l.slug)}" class="lang-tile" style="--tile-hue:\${hue}">
                  <span class="lang-tile__mono">\${esc(l.name.slice(0, 2).toUpperCase())}</span>
                  <div class="lang-tile__info">
                    <span class="lang-tile__name">\${esc(l.name)}</span>
                    <span class="lang-tile__region">\${esc(r.name)}</span>
                  </div>
                  <span class="lang-tile__arrow">&rarr;</span>
                </a>
              \`;
            }).join('')}
          </div>
        </div>
      </details>
    \`).join('');

    mainEl.innerHTML = \`
      <section class="page-hero" style="--cat-grad:\${catObj.grad}">
        <span class="sec-eyebrow">\${esc(catObj.badge)} &bull; DIREKTORI WILAYAH</span>
        <h1 class="page-hero__title">\${esc(catObj.title)}</h1>
        <p class="page-hero__sub">Pilih bahasa ibu atau wilayah kepulauan di bawah ini untuk menonton koleksi media dalam bahasa pilihan Anda.</p>
      </section>
      <section class="sec-block">
        <div class="region-list-wrap">
          \${regionHtml}
        </div>
      </section>
    \`;
  }

  function renderLanguageVideos(langSlug) {
    const langObj = allLanguagesMap.get(langSlug) || { name: langSlug, region: 'Nusantara' };
    const builtVideos = DATA.sampleVideos.map((v, i) => ({
      title: v.title.replace('{languageName}', langObj.name),
      duration: v.duration,
      views: v.views,
      date: v.date,
      dateLabel: v.dateLabel,
      likes: 85 + i * 43,
      image: DATA.latestVideos[i % DATA.latestVideos.length]?.image || '',
      href: DATA.latestVideos[i % DATA.latestVideos.length]?.href || ''
    }));
    const sorted = getSortedVideos(builtVideos);

    const sortOptions = [
      { id: 'trending', label: 'Tren' },
      { id: 'popular', label: 'Populer' },
      { id: 'newest', label: 'Terbaru' },
      { id: 'oldest', label: 'Terlama' }
    ];

    mainEl.innerHTML = \`
      <section class="page-hero">
        <span class="sec-eyebrow">BAHASA DAERAH &bull; \${esc(langObj.region)}</span>
        <h1 class="page-hero__title">Koleksi Media \${esc(langObj.name)}</h1>
        <p class="page-hero__sub">Menampilkan tayangan film dan kitab suci yang telah dialihbahasakan ke dalam Bahasa \${esc(langObj.name)}.</p>
      </section>
      <section class="sec-block">
        <div class="sec-header">
          <span class="sec-caption">Menampilkan \${sorted.length} episode utama</span>
          <div class="filter-chips-bar">
            \${sortOptions.map(o => \`<button type="button" class="filter-chip \${activeSort === o.id ? 'active' : ''}" data-sort="\${o.id}">\${esc(o.label)}</button>\`).join('')}
          </div>
        </div>
        <div class="video-showcase-grid">
          \${sorted.map((v, i) => renderVideoCard(v, i, i === 0)).join('')}
        </div>
      </section>
    \`;
  }

  function renderApps() {
    const pageSize = 12;
    const filtered = DATA.apps.filter(a => !appFilterQuery || a.name.toLowerCase().includes(appFilterQuery.toLowerCase()));
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (appPage > totalPages) appPage = 1;
    const slice = filtered.slice((appPage - 1) * pageSize, appPage * pageSize);

    const cards = slice.map((app, i) => {
      const imgUrl = app.image ? encodeURI(DATA.siteUrl + app.image) : '';
      return \`
        <article class="app-card-modern">
          <div class="app-card-modern__icon">
            <span>\${esc(app.name.replace('Bahasa ', '').slice(0, 2).toUpperCase())}</span>
            \${imgUrl ? \`<img src="\${imgUrl}" alt="" loading="lazy" onerror="this.remove()">\` : ''}
          </div>
          <div class="app-card-modern__info">
            <span class="app-card-modern__tag">ANDROID PLAY STORE</span>
            <h3 class="app-card-modern__title">\${esc(app.name)} <span class="verified-dot">&#10004;</span></h3>
          </div>
          <a href="\${esc(app.link)}" target="_blank" rel="noopener" class="app-card-modern__btn">
            \${svgIcon('download')}
            <span>Unduh</span>
          </a>
        </article>
      \`;
    }).join('');

    mainEl.innerHTML = \`
      <section class="page-hero">
        <span class="sec-eyebrow">EKOSISTEM DIGITAL &bull; \${DATA.totalAppsCount} APLIKASI</span>
        <h1 class="page-hero__title">Aplikasi Kitab Suci Nusantara</h1>
        <p class="page-hero__sub">Unduh aplikasi Alkitab &amp; Kitab Suci audio interaktif di Google Play Store untuk ratusan bahasa daerah di Indonesia.</p>
        <div class="inline-filter-bar">
          <input type="search" id="appSearchInput" value="\${esc(appFilterQuery)}" placeholder="Filter nama bahasa aplikasi (mis. Muna, Banjar, Toraja)...">
        </div>
      </section>
      <section class="sec-block">
        <div class="apps-grid-modern">
          \${cards || '<p class="empty-state">Tidak ada aplikasi yang cocok dengan filter.</p>'}
        </div>
        <div class="modern-pager">
          <span>Menampilkan halaman <strong>\${appPage}</strong> dari <strong>\${totalPages}</strong> (Total katalog: \${DATA.totalAppsCount} aplikasi)</span>
          <div class="modern-pager__btns">
            <button type="button" class="btn-secondary" id="prevAppPage" \${appPage <= 1 ? 'disabled' : ''}>&larr; Sebelumnya</button>
            <button type="button" class="btn-secondary" id="nextAppPage" \${appPage >= totalPages ? 'disabled' : ''}>Berikutnya &rarr;</button>
          </div>
        </div>
      </section>
    \`;

    const inp = document.getElementById('appSearchInput');
    if (inp) {
      inp.addEventListener('input', (e) => {
        appFilterQuery = e.target.value;
        appPage = 1;
        renderApps();
        const newInp = document.getElementById('appSearchInput');
        if (newInp) { newInp.focus(); newInp.setSelectionRange(newInp.value.length, newInp.value.length); }
      });
    }
  }

  function renderWatch() {
    const v = currentWatch || DATA.watchExample;
    const imgUrl = v.image ? (v.image.startsWith('http') ? v.image : encodeURI(DATA.siteUrl + v.image)) : '';
    const webHref = v.href ? (v.href.startsWith('http') ? v.href : encodeURI(DATA.siteUrl + v.href)) : DATA.siteUrl;
    const tags = v.tags || DATA.watchExample.tags || ['Kitab Suci', 'Nusantara', 'Film Rohani'];
    const related = DATA.latestVideos.slice(0, 4);

    mainEl.innerHTML = \`
      <div class="watch-layout">
        <div class="watch-layout__primary">
          <div class="cinema-player">
            <div class="cinema-player__stage">
              \${imgUrl ? \`<img src="\${imgUrl}" alt="" onerror="this.remove()">\` : ''}
              <div class="cinema-player__overlay">
                <a href="\${esc(webHref)}" target="_blank" rel="noopener" class="cinema-play-big" aria-label="Tonton Video di TokoMedia.org">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                </a>
                <span class="cinema-player__hint">Klik untuk memutar streaming HLS / Web Player</span>
              </div>
            </div>
          </div>

          <div class="watch-header">
            <div class="watch-header__badges">
              <span class="badge-pill">\${esc(v.category || 'Film Ikatan Ilahi')}</span>
              <span class="badge-pill badge-pill--outline">HD STREAMING</span>
            </div>
            <h1 class="watch-title-main">\${esc(v.title)}</h1>
            <div class="watch-bar">
              <div class="publisher-pill">
                <img src="\${DATA.logoB64}" alt="" class="publisher-pill__avatar">
                <div>
                  <div class="publisher-pill__name">\${esc(DATA.channel)} <span class="verified-dot">&#10004;</span></div>
                  <div class="publisher-pill__sub">Publikasi \${esc(v.dateLabel || '01 Aug 24')} &bull; \${Number(v.views || 10222).toLocaleString('id-ID')} tayangan</div>
                </div>
              </div>
              <div class="watch-actions">
                <button type="button" class="action-pill" id="likeToggleBtn" aria-pressed="false">
                  \${svgIcon('heart')} <span>Suka</span>
                </button>
                <a href="\${esc(webHref)}" target="_blank" rel="noopener" class="action-pill">
                  <span>Buka di Situs</span> &#8599;
                </a>
              </div>
            </div>
          </div>

          <div class="watch-description-box">
            <h3>Sinopsis &amp; Deskripsi</h3>
            <p>\${esc(v.description || DATA.watchExample.description)}</p>
            <div class="tag-cloud">
              \${tags.map(t => \`<span class="tag-item">#\${esc(t)}</span>\`).join('')}
            </div>
          </div>

          <div class="watch-comment-card">
            <h3>Tanggapan &amp; Diskusi Anda</h3>
            <p class="form-sub">Bagikan kesan atau pertanyaan Anda setelah menonton tayangan ini.</p>
            <form class="modern-form" id="watchCommentForm">
              <div class="form-grid-2">
                <label class="f-field"><span>Nama Lengkap</span><input type="text" required placeholder="Nama Anda"></label>
                <label class="f-field"><span>Alamat Email</span><input type="email" required placeholder="email@contoh.com"></label>
              </div>
              <label class="f-field"><span>Nomor WhatsApp / HP (Opsional)</span><input type="tel" placeholder="+62 812 xxxx xxxx"></label>
              <label class="f-field"><span>Tanggapan Anda</span><textarea rows="4" required placeholder="Tuliskan tanggapan atau ulasan Anda..."></textarea></label>
              <div class="form-submit-row">
                <span class="form-status-msg" id="formStatusMsg"></span>
                <button type="submit" class="btn-primary">Kirim Tanggapan &rarr;</button>
              </div>
            </form>
          </div>
        </div>

        <aside class="watch-layout__sidebar">
          <h3 class="sidebar-heading">Tayangan Terkait</h3>
          <div class="related-stack">
            \${related.map((rv, idx) => renderVideoCard(rv, idx, false)).join('')}
          </div>
        </aside>
      </div>
    \`;
  }

  function renderContact() {
    mainEl.innerHTML = \`
      <section class="page-hero">
        <span class="sec-eyebrow">HUBUNGI KAMI &bull; LAYANAN PENDENGAR</span>
        <h1 class="page-hero__title">Kontak &amp; Kolaborasi</h1>
        <p class="page-hero__sub">Silakan isi ulasan, komentar, atau pertanyaan Anda mengenai konten bahasa daerah yang tersedia di TokoMedia.</p>
      </section>
      <section class="sec-block">
        <div class="contact-card-wrap">
          <form class="modern-form" id="contactForm">
            <div class="form-grid-2">
              <label class="f-field"><span>Nama Lengkap Anda</span><input type="text" required placeholder="Ketik nama lengkap Anda"></label>
              <label class="f-field"><span>Email Aktif</span><input type="email" required placeholder="nama@email.com"></label>
            </div>
            <label class="f-field"><span>Nomor Telepon / WhatsApp</span><input type="tel" placeholder="+628xxxxxxxxx"></label>
            <label class="f-field"><span>Pesan / Tanggapan Anda</span><textarea rows="5" required placeholder="Isi ulasan/komentar/tanggapan Anda..."></textarea></label>
            <div class="form-submit-row">
              <span class="form-status-msg" id="formStatusMsg"></span>
              <button type="submit" class="btn-primary">Kirim Pesan Sekarang &rarr;</button>
            </div>
          </form>
        </div>
      </section>
    \`;
  }

  function renderLegal(sourceKey, title) {
    const blocks = (DATA[sourceKey] && DATA[sourceKey].blocks) || [];
    const html = blocks.map(([kind, text]) => {
      if (kind === 'h') return \`<h3 class="legal-h">\${esc(text)}</h3>\`;
      if (kind === 'li') return \`<li class="legal-li">\${esc(text)}</li>\`;
      return \`<p class="legal-p">\${esc(text)}</p>\`;
    }).join('');
    mainEl.innerHTML = \`
      <section class="page-hero">
        <span class="sec-eyebrow">DOKUMEN RESMI &bull; TOKOMEDIA.ORG</span>
        <h1 class="page-hero__title">\${esc(title)}</h1>
      </section>
      <section class="sec-block">
        <div class="legal-card">\${html}</div>
      </section>
    \`;
  }

  function renderSearch(query) {
    const q = (query || '').trim().toLowerCase();
    const matchedVideos = DATA.latestVideos.filter(v => !q || v.title.toLowerCase().includes(q));
    const matchedLangs = allLanguages.filter(l => !q || l.name.toLowerCase().includes(q)).slice(0, 12);

    mainEl.innerHTML = \`
      <section class="page-hero">
        <span class="sec-eyebrow">PENCARIAN INSTAN</span>
        <h1 class="page-hero__title">\${q ? 'Hasil untuk "' + esc(query) + '"' : 'Jelajahi Katalog'}</h1>
        <p class="page-hero__sub">Menampilkan kecocokan dari 177 bahasa daerah dan katalog video TokoMedia.</p>
      </section>
      \${matchedLangs.length ? \`
        <section class="sec-block">
          <div class="sec-header"><h2 class="sec-title">Bahasa Daerah (\${matchedLangs.length})</h2></div>
          <div class="lang-tiles-grid">
            \${matchedLangs.map((l, i) => \`
              <a href="#videos/\${esc(l.slug)}" class="lang-tile" style="--tile-hue:\${(i*45)%360}">
                <span class="lang-tile__mono">\${esc(l.name.slice(0,2).toUpperCase())}</span>
                <div class="lang-tile__info">
                  <span class="lang-tile__name">\${esc(l.name)}</span>
                  <span class="lang-tile__region">\${esc(l.region || 'Nusantara')}</span>
                </div>
                <span class="lang-tile__arrow">&rarr;</span>
              </a>
            \`).join('')}
          </div>
        </section>
      \` : ''}
      <section class="sec-block">
        <div class="sec-header"><h2 class="sec-title">Video &amp; Episode (\${matchedVideos.length})</h2></div>
        <div class="video-showcase-grid">
          \${matchedVideos.length ? matchedVideos.map((v, i) => renderVideoCard(v, i, false)).join('') : '<p class="empty-state">Tidak ada video lokal yang cocok. Coba kata kunci seperti "Ikatan", "Musa", atau "Yusuf".</p>'}
        </div>
      </section>
    \`;
  }

  function updateCrumbs(routeStr) {
    let parts = [['Beranda', '#home']];
    if (routeStr.startsWith('languages/')) {
      const catId = routeStr.slice('languages/'.length);
      const cat = DATA.categories.find(c => c.id === catId);
      parts.push([cat ? cat.title : catId, null]);
    } else if (routeStr.startsWith('videos/')) {
      const slug = routeStr.slice('videos/'.length);
      const lang = allLanguagesMap.get(slug);
      parts.push(['Daftar Bahasa', '#languages/' + lastCategory]);
      parts.push([lang ? lang.name : slug, null]);
    } else if (routeStr === 'watch') {
      parts.push(['Ruang Putar', null]);
    } else if (routeStr === 'contact') {
      parts.push(['Kontak Kami', null]);
    } else if (routeStr.startsWith('search')) {
      parts.push(['Pencarian', null]);
    } else if (routeStr === 'privacy-web') {
      parts.push(['Kebijakan Privasi Situs', null]);
    } else if (routeStr === 'privacy-app') {
      parts.push(['Kebijakan Privasi Aplikasi', null]);
    }

    crumbsEl.innerHTML = parts.map((p, i) => {
      const sep = i > 0 ? '<span class="crumb-sep">/</span>' : '';
      const item = p[1] ? \`<a href="\${p[1]}" class="crumb-link">\${esc(p[0])}</a>\` : \`<span class="crumb-current">\${esc(p[0])}</span>\`;
      return sep + item;
    }).join('');
  }

  function handleRoute() {
    const raw = decodeURIComponent(location.hash.replace(/^#/, '')) || 'home';
    drawer.classList.remove('open');
    scrim.classList.remove('open');
    searchModal.hidden = true;
    backBtn.hidden = (raw === 'home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateCrumbs(raw);

    document.querySelectorAll('.bnav-item').forEach(el => {
      const key = el.dataset.bnav;
      const active = (key === 'home' && raw === 'home') ||
                     (key === 'languages' && (raw.startsWith('languages/') && raw !== 'languages/app' || raw.startsWith('videos/'))) ||
                     (key === 'watch' && raw === 'watch') ||
                     (key === 'apps' && raw === 'languages/app');
      el.classList.toggle('active', active);
    });

    if (raw === 'home') renderHome();
    else if (raw === 'languages/app') renderApps();
    else if (raw.startsWith('languages/')) renderRegions(raw.slice('languages/'.length));
    else if (raw.startsWith('videos/')) renderLanguageVideos(raw.slice('videos/'.length));
    else if (raw === 'watch') renderWatch();
    else if (raw === 'contact') renderContact();
    else if (raw === 'privacy-web') renderLegal('privacyWeb', 'Kebijakan Privasi Situs');
    else if (raw === 'privacy-app') renderLegal('privacyApp', 'Kebijakan Privasi Aplikasi');
    else if (raw.startsWith('search')) renderSearch(raw.slice('search/'.length));
    else renderHome();
  }

  document.addEventListener('click', (e) => {
    const alphaBtn = e.target.closest('[data-alpha]');
    if (alphaBtn) {
      activeLetter = alphaBtn.dataset.alpha;
      renderHome();
      return;
    }

    const sortBtn = e.target.closest('[data-sort]');
    if (sortBtn) {
      activeSort = sortBtn.dataset.sort;
      handleRoute();
      return;
    }

    const watchLink = e.target.closest('[data-watch-idx]');
    if (watchLink) {
      currentWatch = {
        title: watchLink.dataset.title,
        views: Number(watchLink.dataset.views || 10222),
        dateLabel: watchLink.dataset.dateLabel || '01 Aug 24',
        image: watchLink.dataset.image,
        href: watchLink.dataset.href,
        category: 'Koleksi Utama TokoMedia',
        description: DATA.watchExample.description,
        tags: DATA.watchExample.tags
      };
      return;
    }

    if (e.target.closest('#prevAppPage')) {
      if (appPage > 1) { appPage--; renderApps(); }
      return;
    }
    if (e.target.closest('#nextAppPage')) {
      appPage++; renderApps();
      return;
    }

    const likeBtn = e.target.closest('#likeToggleBtn');
    if (likeBtn) {
      const pressed = likeBtn.getAttribute('aria-pressed') === 'true';
      likeBtn.setAttribute('aria-pressed', String(!pressed));
      likeBtn.classList.toggle('liked', !pressed);
      return;
    }

    const quickChip = e.target.closest('[data-quick]');
    if (quickChip) {
      location.hash = '#search/' + encodeURIComponent(quickChip.dataset.quick);
      return;
    }

    const vpBtn = e.target.closest('[data-vp]');
    if (vpBtn) {
      document.querySelectorAll('.vp-btn').forEach(b => b.classList.toggle('active', b === vpBtn));
      viewportStage.classList.toggle('is-mobile-frame', vpBtn.dataset.vp === 'mobile');
      return;
    }
  });

  document.addEventListener('submit', (e) => {
    if (e.target.matches('#watchCommentForm, #contactForm')) {
      e.preventDefault();
      const msg = e.target.querySelector('#formStatusMsg');
      if (msg) msg.textContent = 'Terima kasih! Pesan simulasi berhasil divalidasi.';
      e.target.reset();
    }
  });

  document.getElementById('menuBtn').addEventListener('click', () => {
    drawer.classList.add('open');
    scrim.classList.add('open');
  });
  document.getElementById('closeDrawerBtn').addEventListener('click', () => {
    drawer.classList.remove('open');
    scrim.classList.remove('open');
  });
  scrim.addEventListener('click', () => {
    drawer.classList.remove('open');
    scrim.classList.remove('open');
  });
  backBtn.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.hash = '#home';
  });

  document.getElementById('searchTrigger').addEventListener('click', () => {
    searchModal.hidden = false;
    setTimeout(() => searchInput.focus(), 40);
  });
  document.getElementById('closeSearchBtn').addEventListener('click', () => { searchModal.hidden = true; });
  document.getElementById('searchBackdrop').addEventListener('click', () => { searchModal.hidden = true; });
  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) location.hash = '#search/' + encodeURIComponent(q);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      searchModal.hidden = false;
      searchInput.focus();
    } else if (e.key === 'Escape') {
      searchModal.hidden = true;
      drawer.classList.remove('open');
      scrim.classList.remove('open');
    }
  });

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
})();
`;

const BASE_LAYOUT_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
[hidden] { display: none !important; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  overflow-x: hidden;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button, input, textarea, select { font: inherit; color: inherit; }
img { max-width: 100%; display: block; }

/* Ambient Background */
.ambient-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(95px);
  opacity: var(--orb-opacity, 0.25);
  transition: all 0.8s ease;
}
.orb-1 {
  width: 520px; height: 520px;
  top: -160px; left: -120px;
  background: var(--orb-1, var(--primary));
}
.orb-2 {
  width: 480px; height: 480px;
  bottom: -140px; right: -100px;
  background: var(--orb-2, var(--accent));
}

/* Concept Switcher Bar (Top Reviewer Bar) */
.concept-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  background: #090A0D;
  color: #F3F4F6;
  border-bottom: 1px solid rgba(255,255,255,0.12);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 12px;
}
.concept-bar__left, .concept-bar__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.concept-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  font-weight: 600;
  transition: background 0.2s;
}
.concept-back:hover { background: rgba(255,255,255,0.2); }
.concept-badge {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--primary);
  color: var(--primary-contrast, #fff);
  font-weight: 800;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.concept-name { font-weight: 600; color: #D1D5DB; }
.viewport-pill {
  display: inline-flex;
  background: rgba(255,255,255,0.08);
  padding: 2px;
  border-radius: 999px;
}
.vp-btn {
  border: 0;
  background: transparent;
  color: #9CA3AF;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.vp-btn.active { background: #fff; color: #090A0D; }
.concept-links { display: inline-flex; gap: 4px; }
.concept-links a {
  width: 26px; height: 26px;
  display: grid; place-items: center;
  border-radius: 6px;
  background: rgba(255,255,255,0.07);
  color: #9CA3AF;
  font-weight: 700;
  font-size: 11px;
}
.concept-links a.on, .concept-links a:hover {
  background: var(--primary);
  color: var(--primary-contrast, #fff);
}

/* Viewport Stage (Supports both Full Responsive & 430px Mobile Phone Simulation) */
.viewport-stage {
  position: relative;
  z-index: 1;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.viewport-stage.is-mobile-frame {
  max-width: 440px;
  margin: 24px auto 48px;
  border-radius: 38px;
  border: 8px solid #1F242D;
  box-shadow: 0 30px 90px rgba(0,0,0,0.55);
  overflow: hidden;
  background: var(--bg);
}
.viewport-stage.is-mobile-frame .desktop-nav,
.viewport-stage.is-mobile-frame .crumb-bar__meta,
.viewport-stage.is-mobile-frame .search-trigger__text,
.viewport-stage.is-mobile-frame .search-trigger__kbd {
  display: none !important;
}
.viewport-stage.is-mobile-frame .topbar__inner {
  padding: 10px 14px;
  gap: 8px;
}
.viewport-stage.is-mobile-frame .topbar__left {
  gap: 8px;
  min-width: 0;
}
.viewport-stage.is-mobile-frame .icon-btn,
.viewport-stage.is-mobile-frame .search-trigger {
  width: 38px;
  height: 38px;
  padding: 0;
  justify-content: center;
  flex: none;
}
.viewport-stage.is-mobile-frame .brand-logo {
  gap: 8px;
  min-width: 0;
}
.viewport-stage.is-mobile-frame .brand-logo__img {
  width: 26px;
  height: 30px;
  flex: none;
}
.viewport-stage.is-mobile-frame .brand-logo__toko {
  font-size: 16px;
  white-space: nowrap;
}
.viewport-stage.is-mobile-frame .brand-logo__sub {
  font-size: 8.5px;
  letter-spacing: 0.08em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-shell {
  max-width: var(--max-w, 1280px);
  margin: 0 auto;
  min-height: calc(100vh - 43px);
  padding-bottom: 90px;
}

/* Header & Navigation */
.topbar {
  position: sticky;
  top: 43px;
  z-index: 40;
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.viewport-stage.is-mobile-frame .topbar { top: 0; }
.topbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
}
.topbar__left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.icon-btn {
  width: 40px; height: 40px;
  flex: none;
  border-radius: var(--btn-radius, 12px);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.2s ease, border-color 0.2s ease;
}
.icon-btn:hover {
  transform: translateY(-1px);
  border-color: var(--primary);
}
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.brand-logo__img { width: 30px; height: 34px; flex: none; object-fit: contain; }
.brand-logo__text { display: flex; flex-direction: column; line-height: 1.05; }
.brand-logo__toko {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.02em;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}
.brand-play {
  display: inline-grid;
  place-items: center;
  width: 18px; height: 18px;
  flex: none;
  border-radius: 50%;
  background: var(--primary);
  color: var(--primary-contrast, #fff);
  font-size: 9px;
}
.brand-logo__sub {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-top: 2px;
  white-space: nowrap;
}

.desktop-nav {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  flex-shrink: 0;
}
@media (min-width: 1080px) {
  .desktop-nav { display: inline-flex; }
}
.dnav-link {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
  transition: all 0.2s;
}
.dnav-link:hover, .dnav-link.active {
  background: var(--primary);
  color: var(--primary-contrast, #fff);
}

.search-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 40px;
  padding: 0 14px;
  border-radius: var(--btn-radius, 12px);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  white-space: nowrap;
  flex: none;
  transition: all 0.2s;
}
.search-trigger svg { flex: none; }
.search-trigger:hover { border-color: var(--primary); color: var(--text); }
.search-trigger__text { font-size: 13px; display: none; white-space: nowrap; }
@media (min-width: 640px) and (max-width: 1079px), (min-width: 1180px) { .search-trigger__text { display: inline; } }
.search-trigger__kbd {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 5px;
  background: var(--bg);
  border: 1px solid var(--border);
  display: none;
}
@media (min-width: 640px) { .search-trigger__kbd { display: inline-block; } }

/* Breadcrumb Bar */
.crumb-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  border-top: 1px solid var(--border);
  background: var(--crumb-bg, var(--surface));
  font-size: 12px;
}
.crumb-bar__inner {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  white-space: nowrap;
}
.crumb-link { color: var(--muted); font-weight: 500; }
.crumb-link:hover { color: var(--primary); }
.crumb-sep { color: var(--muted); opacity: 0.5; }
.crumb-current { color: var(--text); font-weight: 700; }
.crumb-bar__meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
  display: none;
}
@media (min-width: 768px) { .crumb-bar__meta { display: block; } }

/* Drawer */
.scrim {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease;
}
.scrim.open { opacity: 1; pointer-events: auto; }
.drawer {
  position: fixed;
  top: 43px; bottom: 0; left: 0;
  z-index: 70;
  width: min(86vw, 360px);
  background: var(--surface-elevated, var(--surface));
  border-right: 1px solid var(--border);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform: translateX(-105%);
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
}
.drawer.open { transform: translateX(0); }
.drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
}
.drawer__eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--primary);
}
.drawer__title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
}
.drawer__links {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 20px 0;
}
.drawer-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm, 10px);
  border: 1px solid transparent;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}
.drawer-link:hover {
  background: var(--bg);
  border-color: var(--border);
  transform: translateX(4px);
}
.dl-idx {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--primary);
}
.dl-arr { margin-left: auto; opacity: 0.5; }
.drawer__foot {
  padding-top: 16px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--muted);
}
.drawer__legal {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.drawer__legal a { color: var(--text); font-weight: 600; }

/* Search Modal */
.search-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: start center;
  padding: 90px 16px 24px;
}
.search-modal__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(6px);
}
.search-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 680px);
  background: var(--surface-elevated, var(--surface));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.45);
}
.search-form {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-form input {
  flex: 1;
  height: 46px;
  padding: 0 14px;
  border-radius: var(--btn-radius, 12px);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 15px;
  outline: none;
}
.search-form input:focus { border-color: var(--primary); }
.search-quick {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.sq-label { font-size: 12px; color: var(--muted); }
.sq-chip {
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.sq-chip:hover { border-color: var(--primary); color: var(--primary); }

/* Main Content */
.main-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* Hero Showcase */
.hero-showcase__Card {
  position: relative;
  border-radius: var(--radius-lg, 24px);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
  min-height: 420px;
  display: flex;
  align-items: flex-end;
  box-shadow: var(--shadow);
}
.hero-showcase__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.hero-showcase__bg img {
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: var(--hero-img-opacity, 0.45);
  filter: var(--hero-img-filter, saturate(1.15) contrast(1.05));
  transform: scale(1.02);
}
.hero-showcase__gradient {
  position: absolute;
  inset: 0;
  background: var(--hero-overlay);
}
.hero-showcase__content {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: clamp(22px, 4vw, 44px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--badge-bg, rgba(255,255,255,0.1));
  border: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.pulse-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
}
.hero-headline {
  font-family: var(--font-display);
  font-size: clamp(28px, 4.5vw, 54px);
  font-weight: var(--display-weight, 800);
  line-height: 1.06;
  letter-spacing: var(--display-tracking, -0.03em);
  max-width: 18ch;
}
.hero-sub {
  font-size: clamp(14px, 1.6vw, 17px);
  color: var(--hero-sub-color, var(--muted));
  max-width: 58ch;
  line-height: 1.6;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}
.btn-hero-primary, .btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 24px;
  border-radius: var(--btn-radius, 12px);
  border: 1px solid transparent;
  background: var(--primary);
  color: var(--primary-contrast, #fff);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-hero-primary:hover, .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.25);
}
.btn-hero-secondary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 22px;
  border-radius: var(--btn-radius, 12px);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-hero-secondary:hover, .btn-secondary:hover:not(:disabled) {
  border-color: var(--primary);
  transform: translateY(-2px);
}
.btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}
@media (min-width: 640px) {
  .hero-metrics { grid-template-columns: repeat(4, 1fr); }
}
.h-metric { display: flex; flex-direction: column; }
.h-metric strong {
  font-family: var(--font-display);
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 800;
  color: var(--text);
}
.h-metric span { font-size: 12px; color: var(--muted); }

/* Section Blocks */
.sec-block {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.sec-block--surface {
  padding: clamp(18px, 3vw, 32px);
  border-radius: var(--radius-lg, 24px);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.sec-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}
.sec-eyebrow {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 4px;
}
.sec-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 3vw, 32px);
  font-weight: var(--display-weight, 800);
  letter-spacing: var(--display-tracking, -0.02em);
  line-height: 1.15;
}
.sec-caption { font-size: 13px; color: var(--muted); }
.sec-link {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
}

/* Bento Category Grid */
.bento-categories {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.cat-bento--1 {
  grid-column: 1 / -1;
}
.cat-bento--2,
.cat-bento--3,
.cat-bento--4,
.cat-bento--5 {
  grid-column: span 1;
}

.cat-bento {
  position: relative;
  padding: 20px;
  border-radius: var(--radius);
  background: var(--cat-card-bg, var(--surface));
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 168px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s;
}
.cat-bento::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--cat-grad);
  opacity: var(--cat-grad-opacity, 0.16);
  transition: opacity 0.25s;
}
.cat-bento:hover {
  transform: translateY(-4px);
  border-color: var(--cat-accent);
}
.cat-bento:hover::before {
  opacity: var(--cat-grad-hover-opacity, 0.28);
}
.cat-bento__top, .cat-bento__mid, .cat-bento__foot {
  position: relative;
  z-index: 1;
}
.cat-bento__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.cat-bento__badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--bg);
  border: 1px solid var(--border);
}
.cat-bento__icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: grid; place-items: center;
  background: var(--bg);
  color: var(--cat-accent);
  border: 1px solid var(--border);
}
.cat-bento__mid { margin: 16px 0; }
.cat-bento__title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 800;
  line-height: 1.2;
}
.cat-bento__sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
}
.cat-bento__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  font-weight: 700;
}
.cat-bento__count { color: var(--muted); font-family: var(--font-mono); }
.cat-bento__cta { color: var(--primary); display: inline-flex; align-items: center; gap: 4px; }

/* Language Stories Carousel */
.lang-stories-bar {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 6px 2px 14px;
  scrollbar-width: thin;
}
.lang-story {
  flex: 0 0 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  transition: transform 0.2s;
}
.lang-story:hover { transform: translateY(-3px); }
.lang-story__ring {
  padding: 3px;
  border-radius: var(--avatar-radius, 50%);
  background: linear-gradient(135deg, var(--primary), var(--accent));
}
.lang-story__avatar {
  position: relative;
  width: 64px; height: 64px;
  border-radius: var(--avatar-radius, 50%);
  background: var(--bg);
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 16px;
  overflow: hidden;
  border: 2px solid var(--surface);
}
.lang-story__avatar img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.lang-story__name {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Alphabet Explorer */
.alpha-explorer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.alpha-explorer__head {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.alpha-hero-badge {
  display: flex;
  align-items: center;
  gap: 14px;
}
.alpha-hero-char {
  width: 56px; height: 56px;
  border-radius: var(--radius-sm, 14px);
  background: var(--primary);
  color: var(--primary-contrast, #fff);
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: var(--shadow);
}
.alpha-hero-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--muted);
}
.alpha-hero-count {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
}
.alpha-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.alpha-btn {
  min-width: 36px; height: 36px;
  padding: 0 8px;
  border-radius: var(--btn-radius, 10px);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
}
.alpha-btn:hover {
  border-color: var(--primary);
  color: var(--text);
  transform: translateY(-2px);
}
.alpha-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-contrast, #fff);
}

.lang-tiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
}
.viewport-stage.is-mobile-frame .lang-tiles-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.lang-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm, 12px);
  background: var(--bg);
  border: 1px solid var(--border);
  transition: all 0.2s;
}
.lang-tile:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.lang-tile__mono {
  flex: none;
  width: 36px; height: 36px;
  border-radius: 10px;
  background: hsl(var(--tile-hue, 160) 65% 45% / 0.18);
  color: hsl(var(--tile-hue, 160) 75% 45%);
  border: 1px solid hsl(var(--tile-hue, 160) 65% 45% / 0.35);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
  display: grid;
  place-items: center;
}
.lang-tile__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.lang-tile__name {
  font-weight: 700;
  font-size: 13.5px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}
.lang-tile__region {
  font-size: 11px;
  color: var(--muted);
}
.lang-tile__arrow {
  color: var(--primary);
  font-weight: 700;
}

/* Filter Chips */
.filter-chips-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.filter-chip {
  flex: none;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-chip:hover { color: var(--text); border-color: var(--primary); }
.filter-chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-contrast, #fff);
}

/* Video Showcase Grid */
.video-showcase-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
@media (min-width: 640px) {
  .video-showcase-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 980px) {
  .video-showcase-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .vcard--featured {
    grid-column: span 2;
    grid-row: span 2;
  }
}
.viewport-stage.is-mobile-frame .video-showcase-grid {
  grid-template-columns: 1fr;
}
.viewport-stage.is-mobile-frame .vcard--featured {
  grid-column: span 1;
  grid-row: span 1;
}

.vcard {
  group: vcard;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s;
}
.vcard:hover {
  transform: translateY(-5px);
  border-color: var(--primary);
}
.vcard__media {
  position: relative;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #181B22, #2A303C);
  overflow: hidden;
}
.vcard__media img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.vcard:hover .vcard__media img {
  transform: scale(1.05);
}
.vcard__Scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%);
}
.vcard__badge {
  position: absolute;
  top: 12px; left: 12px;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-contrast, #fff);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.vcard__index {
  position: absolute;
  top: 12px; left: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  backdrop-filter: blur(4px);
}
.vcard__play {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--primary-contrast, #fff);
  display: grid;
  place-items: center;
  opacity: 0;
  transform: scale(0.85);
  transition: all 0.25s ease;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
}
.vcard:hover .vcard__play {
  opacity: 1;
  transform: scale(1);
}
.vcard__duration {
  position: absolute;
  right: 12px; bottom: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
}
.vcard__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.vcard__topmeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}
.vcard__channel {
  font-weight: 700;
  color: var(--primary);
}
.verified-dot {
  display: inline-block;
  font-size: 10px;
  margin-left: 2px;
}
.vcard__date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}
.vcard__title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.32;
}
.vcard--featured .vcard__title {
  font-size: clamp(18px, 2.2vw, 24px);
}
.vcard__stats {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--muted);
}
.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.stat-pill--like { color: var(--accent, var(--primary)); font-weight: 700; }

/* Page Hero & Secondary Screens */
.page-hero {
  padding: clamp(22px, 3.5vw, 38px);
  border-radius: var(--radius-lg, 24px);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.page-hero__title {
  font-family: var(--font-display);
  font-size: clamp(26px, 3.8vw, 42px);
  font-weight: 800;
  line-height: 1.1;
  margin-top: 4px;
}
.page-hero__sub {
  font-size: 14px;
  color: var(--muted);
  max-width: 62ch;
  margin-top: 8px;
}
.inline-filter-bar { margin-top: 18px; }
.inline-filter-bar input {
  width: min(100%, 480px);
  height: 44px;
  padding: 0 16px;
  border-radius: var(--btn-radius, 12px);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  outline: none;
}
.inline-filter-bar input:focus { border-color: var(--primary); }

/* Region Accordion */
.region-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.region-accordion {
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: var(--shadow);
}
.region-accordion__summary {
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  list-style: none;
}
.region-accordion__summary::-webkit-details-marker { display: none; }
.region-summary__left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.region-idx {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 800;
  color: var(--primary);
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--bg);
  border: 1px solid var(--border);
}
.region-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
}
.region-sub { font-size: 12px; color: var(--muted); }
.region-badge {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--bg);
  border: 1px solid var(--border);
}
.region-accordion__body {
  padding: 0 22px 22px;
  border-top: 1px solid var(--border);
  padding-top: 18px;
}

/* Apps Grid Modern */
.apps-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.app-card-modern {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  transition: transform 0.2s, border-color 0.2s;
}
.app-card-modern:hover {
  transform: translateY(-3px);
  border-color: var(--primary);
}
.app-card-modern__icon {
  position: relative;
  width: 52px; height: 52px;
  flex: none;
  border-radius: 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 800;
  overflow: hidden;
}
.app-card-modern__icon img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.app-card-modern__info { flex: 1; min-width: 0; }
.app-card-modern__tag {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--muted);
}
.app-card-modern__title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
}
.app-card-modern__btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--btn-radius, 10px);
  background: var(--primary);
  color: var(--primary-contrast, #fff);
  font-size: 12px;
  font-weight: 700;
}
.modern-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 13px;
}
.modern-pager__btns { display: flex; gap: 8px; }

/* Watch Theater Layout */
.watch-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 980px) {
  .watch-layout {
    grid-template-columns: minmax(0, 2.1fr) minmax(300px, 1fr);
  }
}
.viewport-stage.is-mobile-frame .watch-layout {
  grid-template-columns: 1fr;
}
.watch-layout__primary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.cinema-player {
  border-radius: var(--radius-lg, 20px);
  overflow: hidden;
  border: 1px solid var(--border);
  background: #000;
  box-shadow: var(--shadow);
}
.cinema-player__stage {
  position: relative;
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
}
.cinema-player__stage img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0.7;
}
.cinema-player__overlay {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.cinema-play-big {
  width: 74px; height: 74px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--primary-contrast, #fff);
  display: grid;
  place-items: center;
  box-shadow: 0 16px 40px rgba(0,0,0,0.5);
  transition: transform 0.25s;
}
.cinema-play-big:hover { transform: scale(1.08); }
.cinema-player__hint {
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(0,0,0,0.75);
  color: #fff;
  font-size: 12px;
}
.watch-header, .watch-description-box, .watch-comment-card, .contact-card-wrap, .legal-card {
  padding: 22px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.watch-header__badges { display: flex; gap: 8px; margin-bottom: 10px; }
.badge-pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-contrast, #fff);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
}
.badge-pill--outline {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}
.watch-title-main {
  font-family: var(--font-display);
  font-size: clamp(20px, 2.6vw, 28px);
  font-weight: 800;
  line-height: 1.2;
}
.watch-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.publisher-pill { display: flex; align-items: center; gap: 12px; }
.publisher-pill__avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  object-fit: contain;
  background: var(--bg);
  padding: 4px;
  border: 1px solid var(--border);
}
.publisher-pill__name { font-weight: 700; font-size: 14px; }
.publisher-pill__sub { font-size: 12px; color: var(--muted); }
.watch-actions { display: flex; gap: 8px; }
.action-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.action-pill.liked {
  background: #E11D48;
  border-color: #E11D48;
  color: #fff;
}
.watch-description-box h3, .watch-comment-card h3, .sidebar-heading {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 10px;
}
.watch-description-box p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted);
  white-space: pre-line;
}
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.tag-item {
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--bg);
  border: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
}
.related-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Forms */
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
}
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 640px) {
  .form-grid-2 { grid-template-columns: 1fr 1fr; }
}
.f-field { display: flex; flex-direction: column; gap: 6px; }
.f-field span { font-size: 12px; font-weight: 700; color: var(--muted); }
.f-field input, .f-field textarea {
  padding: 12px 14px;
  border-radius: var(--btn-radius, 10px);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  outline: none;
}
.f-field input:focus, .f-field textarea:focus { border-color: var(--primary); }
.form-submit-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.form-status-msg { font-size: 13px; color: var(--primary); font-weight: 600; }

/* Legal */
.legal-h { font-family: var(--font-display); font-size: 18px; margin: 18px 0 8px; }
.legal-p, .legal-li { font-size: 14px; color: var(--muted); line-height: 1.75; margin-bottom: 10px; }

/* Bottom Mobile Navigation */
.bottom-nav {
  position: fixed;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  width: min(92vw, 420px);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 6px;
  border-radius: 999px;
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  box-shadow: 0 16px 40px rgba(0,0,0,0.35);
}
.bnav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 7px 4px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
  transition: all 0.2s;
}
.bnav-item.active {
  background: var(--primary);
  color: var(--primary-contrast, #fff);
}
`;

const OPTIONS = [
  {
    id: 'noir',
    file: 'option-1-noir-cinema.html',
    shortName: '01 · Noir Cinema Atmos',
    title: 'Opsi 1: Noir Cinema Atmos',
    awwwardsTag: 'SOTD FILM & TV WINNER STYLE',
    brandSub: 'ARCHIPELAGO CINEMA STREAM',
    metaTicker: 'DOLBY ATMOS READY • 177 BAHASA NUSANTARA • 16.586 TAYANGAN',
    heroLabel: 'CINEMATIC STREAMING EXPERIENCE',
    heroHeadline: 'Sinema Rohani & Kitab Suci Dalam 177 Bahasa Nusantara.',
    heroSub: 'Pengalaman menonton imersif bergaya ruang teater gelap dengan pencahayaan zamrud & emas hangat, terinspirasi pemenang Awwwards kategori Film & TV.',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap',
    css: BASE_LAYOUT_CSS + `
      :root {
        --bg: #07090C;
        --surface: #10141B;
        --surface-elevated: #151A24;
        --header-bg: rgba(10, 13, 18, 0.82);
        --crumb-bg: rgba(16, 20, 27, 0.75);
        --text: #F3F5F8;
        --muted: #8E98A8;
        --primary: #10B981;
        --primary-contrast: #04130D;
        --accent: #F59E0B;
        --border: rgba(255, 255, 255, 0.09);
        --radius: 18px;
        --radius-lg: 26px;
        --radius-sm: 12px;
        --btn-radius: 999px;
        --avatar-radius: 50%;
        --shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
        --font-display: 'Syne', sans-serif;
        --font-body: 'Plus Jakarta Sans', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
        --hero-overlay: linear-gradient(110deg, rgba(7,9,12,0.96) 15%, rgba(7,9,12,0.72) 60%, rgba(16,185,129,0.18) 100%);
        --orb-1: #10B981;
        --orb-2: #D97706;
        --orb-opacity: 0.18;
      }
      .hero-headline {
        background: linear-gradient(135deg, #FFFFFF 30%, #A7F3D0 75%, #FCD34D 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `
  },
  {
    id: 'editorial',
    file: 'option-2-nusantara-editorial.html',
    shortName: '02 · Nusantara Heritage Editorial',
    title: 'Opsi 2: Nusantara Heritage Editorial',
    awwwardsTag: 'CULTURE & EDUCATION SOTD',
    brandSub: 'PUSTAKA BUDAYA & KITAB SUCI',
    metaTicker: 'EDISI KURASI NUSANTARA • SUMATERA • JAWA • KALIMANTAN • SULAWESI • PAPUA',
    heroLabel: 'ARSIP DIGITAL & WARISAN BAHASA',
    heroHeadline: 'Merawat Bahasa Ibu, Menyemai Hikmat di Seluruh Kepulauan.',
    heroSub: 'Pendekatan tipografi editorial khas museum & jurnal budaya modern dengan palet kertas lontar hangat, aksen terakota, dan hijau hutan tropis.',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,800;1,9..144,600&family=IBM+Plex+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
    css: BASE_LAYOUT_CSS + `
      :root {
        --bg: #F6F1E7;
        --surface: #FFFDF9;
        --surface-elevated: #FFFDF9;
        --header-bg: rgba(246, 241, 231, 0.88);
        --crumb-bg: #EFE8DA;
        --text: #1B1917;
        --muted: #6B635B;
        --primary: #0F5E43;
        --primary-contrast: #FFFFFF;
        --accent: #C84B31;
        --border: #DED4C3;
        --radius: 16px;
        --radius-lg: 22px;
        --radius-sm: 10px;
        --btn-radius: 10px;
        --avatar-radius: 18px;
        --shadow: 0 10px 30px rgba(42, 33, 21, 0.07);
        --font-display: 'Fraunces', Georgia, serif;
        --font-body: 'Plus Jakarta Sans', sans-serif;
        --font-mono: 'IBM Plex Mono', monospace;
        --display-weight: 800;
        --display-tracking: -0.02em;
        --hero-img-opacity: 0.22;
        --hero-sub-color: #3F3A34;
        --hero-overlay: linear-gradient(120deg, rgba(255,253,249,0.96) 20%, rgba(246,241,231,0.84) 70%, rgba(15,94,67,0.12) 100%);
        --badge-bg: #EFE8DA;
        --orb-1: #D97706;
        --orb-2: #0F5E43;
        --orb-opacity: 0.1;
        --cat-grad-opacity: 0.08;
      }
      .hero-showcase__Card {
        border: 2px solid #D3C6B1;
      }
      .sec-title, .page-hero__title {
        font-variation-settings: "SOFT" 50;
      }
    `
  },
  {
    id: 'bento',
    file: 'option-3-spatial-bento.html',
    shortName: '03 · Spatial Glass & Bento',
    title: 'Opsi 3: Spatial Glass & Bento OS',
    awwwardsTag: 'BEST UI / UX & MOBILE APP DESIGN',
    brandSub: 'NEXT-GEN MEDIA SUPERAPP',
    metaTicker: 'SPATIAL BENTO UI • INSTANT SEARCH • ZERO-LATENCY NAVIGATION',
    heroLabel: 'MODULAR SUPER-APP INTERFACE',
    heroHeadline: 'Satu Ruang Pintar untuk Film, Audio, & 269 Aplikasi.',
    heroSub: 'Arsitektur kartu Bento modular dengan efek kaca translusen (frosted glass), sudut super-membulat, dan ergonomika navigasi satu jempol.',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
    css: BASE_LAYOUT_CSS + `
      :root {
        --bg: #EEF2F6;
        --surface: rgba(255, 255, 255, 0.82);
        --surface-elevated: #FFFFFF;
        --header-bg: rgba(255, 255, 255, 0.78);
        --crumb-bg: rgba(255, 255, 255, 0.6);
        --text: #0F172A;
        --muted: #64748B;
        --primary: #059669;
        --primary-contrast: #FFFFFF;
        --accent: #4F46E5;
        --border: rgba(15, 23, 42, 0.09);
        --radius: 26px;
        --radius-lg: 32px;
        --radius-sm: 18px;
        --btn-radius: 16px;
        --avatar-radius: 22px;
        --shadow: 0 14px 36px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        --font-display: 'Outfit', sans-serif;
        --font-body: 'Plus Jakarta Sans', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
        --hero-img-opacity: 0.25;
        --hero-sub-color: #334155;
        --hero-overlay: linear-gradient(135deg, rgba(255,255,255,0.95) 20%, rgba(238,242,246,0.82) 70%, rgba(5,150,105,0.18) 100%);
        --badge-bg: rgba(5, 150, 105, 0.1);
        --orb-1: #34D399;
        --orb-2: #818CF8;
        --orb-opacity: 0.28;
      }
      .cat-bento, .vcard, .sec-block--surface, .page-hero, .region-accordion, .app-card-modern {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
    `
  },
  {
    id: 'brutalist',
    file: 'option-4-kinetic-brutalist.html',
    shortName: '04 · Kinetic Swiss Brutalist',
    title: 'Opsi 4: Kinetic Swiss Brutalist',
    awwwardsTag: 'DEVELOPER AWARD & TYPOGRAPHY HONORS',
    brandSub: 'INDEX // 177-LANG // ARCHIVE',
    metaTicker: '[SYS:ONLINE] — [DB: 16,586 VIDEOS] — [LOC: INDONESIA] — [GRID: SWISS-12]',
    heroLabel: 'SWISS GRID // HIGH-CONTRAST ARCHIVE',
    heroHeadline: 'INDEKS MEDIA TERBESAR BAHASA DAERAH INDONESIA.',
    heroSub: 'Desain neo-brutalis presisi tinggi dengan garis grid ekspos, tipografi monospasi terindeks, bayangan tegas (hard-edge), dan navigasi ultra-cepat.',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Space+Mono:wght@400;700&display=swap',
    css: BASE_LAYOUT_CSS + `
      :root {
        --bg: #F4F3EF;
        --surface: #FFFFFF;
        --surface-elevated: #FFFFFF;
        --header-bg: #F4F3EF;
        --crumb-bg: #111111;
        --text: #111111;
        --muted: #525252;
        --primary: #00A843;
        --primary-contrast: #FFFFFF;
        --accent: #FF4D00;
        --border: #111111;
        --radius: 0px;
        --radius-lg: 0px;
        --radius-sm: 0px;
        --btn-radius: 0px;
        --avatar-radius: 0px;
        --shadow: 5px 5px 0px #111111;
        --font-display: 'Space Grotesk', sans-serif;
        --font-body: 'Space Grotesk', sans-serif;
        --font-mono: 'Space Mono', monospace;
        --display-tracking: -0.04em;
        --hero-img-opacity: 0.18;
        --hero-img-filter: grayscale(1) contrast(1.3);
        --hero-sub-color: #222222;
        --hero-overlay: linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(244,243,239,0.88) 100%);
        --badge-bg: #CCFF00;
        --orb-opacity: 0;
        --cat-grad-opacity: 0;
      }
      .crumb-bar { color: #FFFFFF; }
      .crumb-bar .crumb-link, .crumb-bar .crumb-sep, .crumb-bar .crumb-bar__meta { color: #A3A3A3; }
      .crumb-bar .crumb-current { color: #CCFF00; }
      .cat-bento, .vcard, .sec-block--surface, .page-hero, .region-accordion, .app-card-modern, .hero-showcase__Card, .icon-btn, .search-trigger {
        border-width: 2px;
      }
      .cat-bento:hover, .vcard:hover, .app-card-modern:hover {
        transform: translate(-3px, -3px);
        box-shadow: 8px 8px 0px #111111;
      }
      .hero-eyebrow {
        background: #CCFF00;
        color: #111111;
        border: 2px solid #111111;
        border-radius: 0;
      }
      .filter-chip, .badge-pill, .cat-bento__badge, .region-badge {
        border-radius: 0;
        border-width: 1.5px;
      }
    `
  }
];

function buildOptionHtml(cfg) {
  return `<!DOCTYPE html>
<html lang="id" data-theme="${cfg.id}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${cfg.title} — TokoMedia Awwwards Concept</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${cfg.fontsUrl}" rel="stylesheet">
<style>
${cfg.css}
</style>
</head>
<body>
<div class="ambient-bg" aria-hidden="true">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="noise-overlay"></div>
</div>

<!-- Concept Switcher Floating Bar (For Reviewer) -->
<div class="concept-bar" role="region" aria-label="Awwwards Concept Switcher">
  <div class="concept-bar__left">
    <a href="index.html" class="concept-back" title="Kembali ke Galeri Perbandingan">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      <span>Semua Opsi</span>
    </a>
    <span class="concept-badge">${cfg.awwwardsTag}</span>
    <span class="concept-name">${cfg.shortName}</span>
  </div>
  <div class="concept-bar__right">
    <div class="viewport-pill">
      <button type="button" class="vp-btn active" data-vp="full" title="Tampilan Penuh / Responsif">Resp</button>
      <button type="button" class="vp-btn" data-vp="mobile" title="Simulasi Layar HP (430px)">Mobile 430px</button>
    </div>
    <div class="concept-links">
      <a href="option-1-noir-cinema.html" class="${cfg.id === 'noir' ? 'on' : ''}">01</a>
      <a href="option-2-nusantara-editorial.html" class="${cfg.id === 'editorial' ? 'on' : ''}">02</a>
      <a href="option-3-spatial-bento.html" class="${cfg.id === 'bento' ? 'on' : ''}">03</a>
      <a href="option-4-kinetic-brutalist.html" class="${cfg.id === 'brutalist' ? 'on' : ''}">04</a>
    </div>
  </div>
</div>

<div class="viewport-stage" id="viewportStage">
  <div class="app-shell">
    <!-- Top Navigation -->
    <header class="topbar">
      <div class="topbar__inner">
        <div class="topbar__left">
          <button type="button" class="icon-btn" id="menuBtn" aria-label="Buka Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h12M4 17h16"/></svg>
          </button>
          <button type="button" class="icon-btn" id="backBtn" aria-label="Kembali" hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <a href="#home" class="brand-logo" aria-label="TOKO MEDIA">
            <img src="${logoB64}" alt="" class="brand-logo__img">
            <div class="brand-logo__text">
              <span class="brand-logo__toko">TOKO<span class="brand-play">▶</span>MEDIA</span>
              <span class="brand-logo__sub">${cfg.brandSub}</span>
            </div>
          </a>
        </div>

        <nav class="desktop-nav" aria-label="Navigasi Utama">
          <a href="#home" data-nav="home" class="dnav-link active">Beranda</a>
          <a href="#languages/film-riwayat-isa-al-masih" data-nav="film" class="dnav-link">Film &amp; Video</a>
          <a href="#languages/app" data-nav="apps" class="dnav-link">269 Aplikasi</a>
          <a href="#contact" data-nav="contact" class="dnav-link">Kontak</a>
        </nav>

        <div class="topbar__right">
          <button type="button" class="search-trigger" id="searchTrigger" aria-label="Cari video atau bahasa">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4.2-4.2"/></svg>
            <span class="search-trigger__text">Cari bahasa, film, kitab...</span>
            <kbd class="search-trigger__kbd">/</kbd>
          </button>
        </div>
      </div>

      <!-- Breadcrumb Bar -->
      <div class="crumb-bar" id="crumbBar">
        <div class="crumb-bar__inner" id="crumbs"></div>
        <div class="crumb-bar__meta">${cfg.metaTicker}</div>
      </div>
    </header>

    <!-- Slide-out Drawer -->
    <div class="scrim" id="scrim"></div>
    <aside class="drawer" id="drawer" aria-label="Menu Samping">
      <div class="drawer__head">
        <div>
          <div class="drawer__eyebrow">DIREKTORI NUSANTARA</div>
          <div class="drawer__title">TOKO MEDIA</div>
        </div>
        <button type="button" class="icon-btn" id="closeDrawerBtn" aria-label="Tutup Menu">&times;</button>
      </div>
      <div class="drawer__links">
        <a href="#home" class="drawer-link"><span class="dl-idx">01</span><span>Beranda Utama</span><span class="dl-arr">&rarr;</span></a>
        <a href="#languages/film-riwayat-isa-al-masih" class="drawer-link"><span class="dl-idx">02</span><span>Film Isa Al-Masih</span><span class="dl-arr">&rarr;</span></a>
        <a href="#languages/film-ikatan-ilahi" class="drawer-link"><span class="dl-idx">03</span><span>Film Ikatan Ilahi</span><span class="dl-arr">&rarr;</span></a>
        <a href="#languages/video" class="drawer-link"><span class="dl-idx">04</span><span>Video Kitab Suci</span><span class="dl-arr">&rarr;</span></a>
        <a href="#languages/clip" class="drawer-link"><span class="dl-idx">05</span><span>Clip Kitab Suci</span><span class="dl-arr">&rarr;</span></a>
        <a href="#languages/app" class="drawer-link"><span class="dl-idx">06</span><span>Aplikasi Kitab Suci (269)</span><span class="dl-arr">&rarr;</span></a>
        <a href="https://www.tokomedia.org/app/p/kitab%20suci%20alkitab" target="_blank" rel="noopener" class="drawer-link"><span class="dl-idx">07</span><span>Kitab Suci Alkitab</span><span class="dl-arr">&#8599;</span></a>
        <a href="#contact" class="drawer-link"><span class="dl-idx">08</span><span>Kontak Kami</span><span class="dl-arr">&rarr;</span></a>
        <a href="https://m.me/tokomedia.org" target="_blank" rel="noopener" class="drawer-link"><span class="dl-idx">09</span><span>FB Messenger</span><span class="dl-arr">&#8599;</span></a>
      </div>
      <div class="drawer__foot">
        <p>&copy; Hak Cipta 2020 - 2026 <strong>TokoMedia.org</strong></p>
        <div class="drawer__legal">
          <a href="#privacy-web">Kebijakan Privasi Situs</a>
          <span>&bull;</span>
          <a href="#privacy-app">Kebijakan Privasi Aplikasi</a>
        </div>
      </div>
    </aside>

    <!-- Search Modal / Drawer -->
    <div class="search-modal" id="searchModal" hidden>
      <div class="search-modal__backdrop" id="searchBackdrop"></div>
      <div class="search-modal__panel">
        <form id="searchForm" class="search-form">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4.2-4.2"/></svg>
          <input type="search" id="searchInput" placeholder="Ketik bahasa daerah (mis. Toraja, Sunda, Batak) atau judul..." autocomplete="off">
          <button type="submit" class="btn-primary">Cari</button>
          <button type="button" class="icon-btn" id="closeSearchBtn" aria-label="Tutup">&times;</button>
        </form>
        <div class="search-quick">
          <span class="sq-label">Pencarian Populer:</span>
          <button type="button" class="sq-chip" data-quick="Ikatan Ilahi">Ikatan Ilahi</button>
          <button type="button" class="sq-chip" data-quick="Toraja">Bahasa Toraja</button>
          <button type="button" class="sq-chip" data-quick="Sunda">Bahasa Sunda</button>
          <button type="button" class="sq-chip" data-quick="Musa">Kisah Musa</button>
          <button type="button" class="sq-chip" data-quick="Papua">Maluku - Papua</button>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <main id="mainContent" class="main-content"></main>

    <!-- Bottom Mobile Navigation Bar -->
    <nav class="bottom-nav" aria-label="Navigasi Bawah">
      <a href="#home" class="bnav-item active" data-bnav="home">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        <span>Beranda</span>
      </a>
      <a href="#languages/film-riwayat-isa-al-masih" class="bnav-item" data-bnav="languages">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span>177 Bahasa</span>
      </a>
      <a href="#watch" class="bnav-item" data-bnav="watch">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Tonton</span>
      </a>
      <a href="#languages/app" class="bnav-item" data-bnav="apps">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        <span>Aplikasi</span>
      </a>
    </nav>
  </div>
</div>

<script>
window.TM_DATA = ${sharedDataPayload};
window.TM_CONFIG = ${JSON.stringify({ id: cfg.id, heroLabel: cfg.heroLabel, heroHeadline: cfg.heroHeadline, heroSub: cfg.heroSub })};
</script>
<script>
${SHARED_CLIENT_JS}
</script>
</body>
</html>`;
}

for (const opt of OPTIONS) {
  const outFile = path.join(__dirname, opt.file);
  const html = buildOptionHtml(opt);
  fs.writeFileSync(outFile, html, 'utf8');
  console.log('Generated:', opt.file, (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB');
}

const galleryHtml = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TokoMedia — Awwwards Design Concepts Review Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: #07080B;
  color: #F3F4F6;
  min-height: 100vh;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button { font: inherit; cursor: pointer; }

.studio-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(7, 8, 11, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  padding: 14px 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.studio-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.studio-brand img { width: 30px; height: 34px; object-fit: contain; }
.studio-brand__title {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.02em;
}
.studio-brand__tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.16);
  color: #34D399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.studio-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.mode-tabs {
  display: inline-flex;
  background: #12151E;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.08);
}
.mode-tab {
  border: 0;
  background: transparent;
  color: #9CA3AF;
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;
}
.mode-tab.active {
  background: #10B981;
  color: #03120C;
}

.hero-banner {
  max-width: 1380px;
  margin: 0 auto;
  padding: 42px 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hero-banner__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: #10B981;
  text-transform: uppercase;
}
.hero-banner__title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.03em;
}
.hero-banner__sub {
  color: #9CA3AF;
  max-width: 72ch;
  font-size: 15px;
}

/* Concept Cards Grid */
.concepts-grid {
  max-width: 1380px;
  margin: 0 auto;
  padding: 12px 24px 48px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
.concept-card {
  background: #10131B;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 22px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.25s, border-color 0.25s;
  position: relative;
  overflow: hidden;
}
.concept-card:hover {
  transform: translateY(-4px);
  border-color: var(--c-accent, #10B981);
}
.concept-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.cc-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.07);
}
.cc-award {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--c-accent, #10B981);
  letter-spacing: 0.08em;
}
.cc-preview-swatch {
  height: 120px;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(255,255,255,0.12);
  position: relative;
  overflow: hidden;
}
.cc-swatches {
  display: flex;
  gap: 6px;
}
.cc-dot {
  width: 20px; height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.25);
}
.cc-title {
  font-family: 'Syne', sans-serif;
  font-size: 21px;
  font-weight: 800;
}
.cc-desc {
  font-size: 13.5px;
  color: #9CA3AF;
  line-height: 1.6;
}
.cc-specs {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-size: 12px;
  color: #D1D5DB;
}
.cc-specs li strong { color: #fff; }
.cc-actions {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  gap: 10px;
}
.btn-open {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  border-radius: 12px;
  background: var(--c-accent, #10B981);
  color: var(--c-contrast, #04130D);
  font-weight: 800;
  font-size: 13px;
}
.btn-focus {
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.04);
  color: #fff;
  font-weight: 700;
  font-size: 12px;
}
.btn-focus:hover { border-color: #fff; }

/* Live Interactive Iframe Compare Stage */
.live-stage-section {
  max-width: 1440px;
  margin: 0 auto 60px;
  padding: 0 24px;
}
.live-stage-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 20px;
  background: #10131B;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.09);
}
.stage-route-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.route-pill {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.14);
  background: transparent;
  color: #D1D5DB;
  font-size: 12px;
  font-weight: 600;
}
.route-pill.active, .route-pill:hover {
  background: #fff;
  color: #07080B;
}

.iframes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
}
.iframes-grid.single-focus {
  grid-template-columns: 1fr;
}
.frame-box {
  background: #10131B;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
}
.frame-box__head {
  padding: 12px 16px;
  background: #161B26;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.frame-box__title {
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.frame-box__open {
  font-size: 12px;
  font-weight: 700;
  color: #34D399;
}
.frame-box iframe {
  width: 100%;
  height: 760px;
  border: 0;
  background: #fff;
}
</style>
</head>
<body>
<header class="studio-header">
  <div class="studio-brand">
    <img src="${logoB64}" alt="TokoMedia">
    <div>
      <div class="studio-brand__title">TOKOMEDIA // AWWWARDS STUDIO</div>
    </div>
    <span class="studio-brand__tag">4 INTERACTIVE MOCKUPS</span>
  </div>
  <div class="studio-controls">
    <div class="mode-tabs" role="tablist">
      <button type="button" class="mode-tab active" data-view="cards">Ringkasan &amp; Live Quad-Preview</button>
      <button type="button" class="mode-tab" data-view="focus-1">Fokus Opsi 1</button>
      <button type="button" class="mode-tab" data-view="focus-2">Fokus Opsi 2</button>
      <button type="button" class="mode-tab" data-view="focus-3">Fokus Opsi 3</button>
      <button type="button" class="mode-tab" data-view="focus-4">Fokus Opsi 4</button>
    </div>
  </div>
</header>

<section class="hero-banner" id="overviewSection">
  <span class="hero-banner__eyebrow">KURASI DESAIN TERBAIK DARI AWWWARDS.COM (FILM &amp; TV + CULTURE &amp; EDUCATION)</span>
  <h1 class="hero-banner__title">Pilih Arah Desain Baru TokoMedia</h1>
  <p class="hero-banner__sub">
    Keempat opsi di bawah ini dirancang khusus dari pola pemenang <strong>Awwwards Site of the Day (SOTD)</strong> dan <strong>Best UI/UX</strong>, lengkap dengan seluruh data asli TokoMedia (177 bahasa daerah, 5 kategori media, 269 aplikasi Android, pencarian instan, serta halaman tonton).
  </p>
</section>

<section class="concepts-grid" id="cardsGrid">
  <!-- Option 1 -->
  <article class="concept-card" style="--c-accent:#10B981;--c-contrast:#04130D">
    <div class="concept-card__top">
      <span class="cc-num">OPSI 01</span>
      <span class="cc-award">FILM &amp; TV SOTD WINNER</span>
    </div>
    <div class="cc-preview-swatch" style="background:linear-gradient(135deg,#07090C 0%,#10141B 60%,#064E3B 100%)">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:18px;color:#fff">Noir Cinema Atmos</span>
      <div class="cc-swatches">
        <span class="cc-dot" style="background:#07090C"></span>
        <span class="cc-dot" style="background:#10141B"></span>
        <span class="cc-dot" style="background:#10B981"></span>
        <span class="cc-dot" style="background:#F59E0B"></span>
      </div>
    </div>
    <h2 class="cc-title">Noir Cinema Atmos</h2>
    <p class="cc-desc">Pengalaman streaming sinematik ruang gelap (obsidian) dengan pendar cahaya zamrud &amp; emas hangat. Membuat poster film dan cuplikan video tampak sangat hidup dan premium.</p>
    <ul class="cc-specs">
      <li><strong>Inspirasi Awwwards:</strong> PSP Production, Yuya Film Studio, Preymaker, MUBI</li>
      <li><strong>Tipografi:</strong> Syne Display + Plus Jakarta Sans + JetBrains Mono</li>
      <li><strong>Cocok Untuk:</strong> Menonjolkan kesan sinema/bioskop modern &amp; betah ditonton malam hari</li>
    </ul>
    <div class="cc-actions">
      <a href="option-1-noir-cinema.html" class="btn-open">Buka Fullscreen &rarr;</a>
      <button type="button" class="btn-focus" data-focus="1">Fokus Layar</button>
    </div>
  </article>

  <!-- Option 2 -->
  <article class="concept-card" style="--c-accent:#D97706;--c-contrast:#FFFFFF">
    <div class="concept-card__top">
      <span class="cc-num">OPSI 02</span>
      <span class="cc-award">CULTURE &amp; HERITAGE SOTD</span>
    </div>
    <div class="cc-preview-swatch" style="background:linear-gradient(135deg,#F6F1E7 0%,#EFE8DA 65%,#0F5E43 100%);color:#1B1917">
      <span style="font-family:Georgia,serif;font-weight:800;font-size:18px;color:#1B1917">Nusantara Editorial</span>
      <div class="cc-swatches">
        <span class="cc-dot" style="background:#F6F1E7"></span>
        <span class="cc-dot" style="background:#0F5E43"></span>
        <span class="cc-dot" style="background:#C84B31"></span>
        <span class="cc-dot" style="background:#1B1917"></span>
      </div>
    </div>
    <h2 class="cc-title">Nusantara Heritage Editorial</h2>
    <p class="cc-desc">Estetika ensiklopedia budaya &amp; pustaka Nusantara dengan latar kertas lontar hangat, serif editorial berwibawa, serta aksen hijau hutan tropis &amp; terakota.</p>
    <ul class="cc-specs">
      <li><strong>Inspirasi Awwwards:</strong> Half the Sky, Kinfolk Archive, Museum Cultural Portals</li>
      <li><strong>Tipografi:</strong> Fraunces Editorial Serif + Plus Jakarta Sans + IBM Plex Mono</li>
      <li><strong>Cocok Untuk:</strong> Menghormati nilai budaya 177 bahasa daerah &amp; kenyamanan baca tinggi</li>
    </ul>
    <div class="cc-actions">
      <a href="option-2-nusantara-editorial.html" class="btn-open">Buka Fullscreen &rarr;</a>
      <button type="button" class="btn-focus" data-focus="2">Fokus Layar</button>
    </div>
  </article>

  <!-- Option 3 -->
  <article class="concept-card" style="--c-accent:#38BDF8;--c-contrast:#04131D">
    <div class="concept-card__top">
      <span class="cc-num">OPSI 03</span>
      <span class="cc-award">MOBILE UI/UX &amp; BENTO SOTD</span>
    </div>
    <div class="cc-preview-swatch" style="background:linear-gradient(135deg,#EEF2F6 0%,#D1FAE5 55%,#E0E7FF 100%);color:#0F172A">
      <span style="font-weight:800;font-size:18px;color:#0F172A">Spatial Glass &amp; Bento</span>
      <div class="cc-swatches">
        <span class="cc-dot" style="background:#EEF2F6"></span>
        <span class="cc-dot" style="background:#FFFFFF"></span>
        <span class="cc-dot" style="background:#059669"></span>
        <span class="cc-dot" style="background:#4F46E5"></span>
      </div>
    </div>
    <h2 class="cc-title">Spatial Glass &amp; Bento OS</h2>
    <p class="cc-desc">Antarmuka super-app modern bergaya Apple Spatial UI &amp; Linear Bento Grid. Menggunakan kartu kaca buram (frosted glass), sudut membulat lembut, dan dock navigasi bawah.</p>
    <ul class="cc-specs">
      <li><strong>Inspirasi Awwwards:</strong> Apple Vision/App Store Awardees, Amie, Craft Bento</li>
      <li><strong>Tipografi:</strong> Outfit Geometric + Plus Jakarta Sans + JetBrains Mono</li>
      <li><strong>Cocok Untuk:</strong> Nuansa aplikasi mobile (Android/iOS) modern yang bersih, ramah, &amp; familier</li>
    </ul>
    <div class="cc-actions">
      <a href="option-3-spatial-bento.html" class="btn-open">Buka Fullscreen &rarr;</a>
      <button type="button" class="btn-focus" data-focus="3">Fokus Layar</button>
    </div>
  </article>

  <!-- Option 4 -->
  <article class="concept-card" style="--c-accent:#CCFF00;--c-contrast:#111111">
    <div class="concept-card__top">
      <span class="cc-num">OPSI 04</span>
      <span class="cc-award">DEVELOPER &amp; SWISS GRID</span>
    </div>
    <div class="cc-preview-swatch" style="background:#F4F3EF;color:#111;border:2px solid #111">
      <span style="font-family:monospace;font-weight:800;font-size:17px;color:#111">[04] SWISS BRUTALIST</span>
      <div class="cc-swatches">
        <span class="cc-dot" style="background:#F4F3EF;border-color:#111"></span>
        <span class="cc-dot" style="background:#111111"></span>
        <span class="cc-dot" style="background:#00A843"></span>
        <span class="cc-dot" style="background:#CCFF00;border-color:#111"></span>
      </div>
    </div>
    <h2 class="cc-title">Kinetic Swiss Brutalist</h2>
    <p class="cc-desc">Arsitektur indeks ultra-tegas dengan garis grid terekspos, bayangan tajam (hard-shadow), badge volt kontras tinggi, dan sistem penomoran arsip yang sangat terstruktur.</p>
    <ul class="cc-specs">
      <li><strong>Inspirasi Awwwards:</strong> Neubrutalist Archive Winners, TeenEngineering, Swiss Grids</li>
      <li><strong>Tipografi:</strong> Space Grotesk + Space Mono</li>
      <li><strong>Cocok Untuk:</strong> Eksplorasi katalog masif (16.586 video &amp; 177 bahasa) dengan kontras maksimal</li>
    </ul>
    <div class="cc-actions">
      <a href="option-4-kinetic-brutalist.html" class="btn-open">Buka Fullscreen &rarr;</a>
      <button type="button" class="btn-focus" data-focus="4">Fokus Layar</button>
    </div>
  </article>
</section>

<!-- LIVE INTERACTIVE COMPARISON STAGE -->
<section class="live-stage-section">
  <div class="live-stage-bar">
    <div>
      <strong style="font-size:14px">Simulasi Interaktif Langsung (Sinkronisasi Halaman)</strong>
      <p style="font-size:12px;color:#9CA3AF">Klik tombol di kanan untuk mengganti halaman di keempat mockup secara bersamaan:</p>
    </div>
    <div class="stage-route-pills">
      <button type="button" class="route-pill active" data-sync-route="#home">Beranda Utama</button>
      <button type="button" class="route-pill" data-sync-route="#languages/film-riwayat-isa-al-masih">Direktori 5 Kepulauan</button>
      <button type="button" class="route-pill" data-sync-route="#videos/toraja">Video Bahasa Toraja</button>
      <button type="button" class="route-pill" data-sync-route="#watch">Halaman Tonton (Theater)</button>
      <button type="button" class="route-pill" data-sync-route="#languages/app">269 Aplikasi Android</button>
      <button type="button" class="route-pill" data-sync-route="#contact">Kontak Kami</button>
    </div>
  </div>

  <div class="iframes-grid" id="iframesGrid">
    <div class="frame-box" data-frame="1">
      <div class="frame-box__head">
        <span class="frame-box__title"><span style="color:#10B981">●</span> 01. Noir Cinema Atmos</span>
        <a href="option-1-noir-cinema.html" class="frame-box__open">Layar Penuh &#8599;</a>
      </div>
      <iframe src="option-1-noir-cinema.html#home" title="Opsi 1 Noir Cinema"></iframe>
    </div>
    <div class="frame-box" data-frame="2">
      <div class="frame-box__head">
        <span class="frame-box__title"><span style="color:#F59E0B">●</span> 02. Nusantara Heritage Editorial</span>
        <a href="option-2-nusantara-editorial.html" class="frame-box__open">Layar Penuh &#8599;</a>
      </div>
      <iframe src="option-2-nusantara-editorial.html#home" title="Opsi 2 Nusantara Editorial"></iframe>
    </div>
    <div class="frame-box" data-frame="3">
      <div class="frame-box__head">
        <span class="frame-box__title"><span style="color:#38BDF8">●</span> 03. Spatial Glass &amp; Bento OS</span>
        <a href="option-3-spatial-bento.html" class="frame-box__open">Layar Penuh &#8599;</a>
      </div>
      <iframe src="option-3-spatial-bento.html#home" title="Opsi 3 Spatial Bento"></iframe>
    </div>
    <div class="frame-box" data-frame="4">
      <div class="frame-box__head">
        <span class="frame-box__title"><span style="color:#CCFF00">●</span> 04. Kinetic Swiss Brutalist</span>
        <a href="option-4-kinetic-brutalist.html" class="frame-box__open">Layar Penuh &#8599;</a>
      </div>
      <iframe src="option-4-kinetic-brutalist.html#home" title="Opsi 4 Kinetic Brutalist"></iframe>
    </div>
  </div>
</section>

<script>
(function() {
  const iframesGrid = document.getElementById('iframesGrid');
  const cardsGrid = document.getElementById('cardsGrid');
  const overviewSection = document.getElementById('overviewSection');
  const frames = document.querySelectorAll('.frame-box');

  function setViewMode(mode) {
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.view === mode));
    if (mode === 'cards') {
      cardsGrid.hidden = false;
      overviewSection.hidden = false;
      iframesGrid.classList.remove('single-focus');
      frames.forEach(f => f.hidden = false);
    } else {
      const targetNum = mode.replace('focus-', '');
      cardsGrid.hidden = true;
      overviewSection.hidden = true;
      iframesGrid.classList.add('single-focus');
      frames.forEach(f => {
        f.hidden = (f.dataset.frame !== targetNum);
      });
    }
  }

  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.mode-tab');
    if (tab) {
      setViewMode(tab.dataset.view);
      return;
    }
    const focusBtn = e.target.closest('[data-focus]');
    if (focusBtn) {
      setViewMode('focus-' + focusBtn.dataset.focus);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const routePill = e.target.closest('[data-sync-route]');
    if (routePill) {
      document.querySelectorAll('.route-pill').forEach(p => p.classList.toggle('active', p === routePill));
      const hash = routePill.dataset.syncRoute;
      document.querySelectorAll('.frame-box iframe').forEach(ifr => {
        const base = ifr.getAttribute('src').split('#')[0];
        ifr.setAttribute('src', base + hash);
      });
    }
  });
})();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), galleryHtml, 'utf8');
console.log('Generated: index.html', (Buffer.byteLength(galleryHtml) / 1024).toFixed(1) + ' KB');

