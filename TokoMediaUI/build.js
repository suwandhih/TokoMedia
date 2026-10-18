'use strict';
// Converts ui.json into a single, dependency-free index.html.
// Usage: node build.js [input.json] [output.html]

const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(process.argv[2] || path.join(__dirname, 'ui.json'));
const outputPath = path.resolve(process.argv[3] || path.join(__dirname, 'index.html'));
const ui = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const slugify = (text) =>
  String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const fill = (template, ctx) =>
  String(template).replace(/\{(\w+)\}/g, (match, key) => (key in ctx ? String(ctx[key]) : match));

// Languages are unique by slug (the site URL segment); regions and the home carousel share them.
const languageBySlug = new Map();
for (const lang of [...ui.data.regions.flatMap((region) => region.languages), ...ui.data.homeLanguages]) {
  if (!languageBySlug.has(lang.slug)) languageBySlug.set(lang.slug, lang);
}
const languages = [...languageBySlug.values()];

const brand = ui.app.brand;
const logoSrc = 'data:image/png;base64,' + fs.readFileSync(path.resolve(__dirname, brand.logo)).toString('base64');

function instancesOf(source) {
  if (source === 'categories') {
    return ui.data.categories.map((c) => ({ category: c.id, categoryName: c.title }));
  }
  if (source === 'languages') {
    return languages.map((l) => ({ language: l.slug, slug: l.slug, languageName: l.name }));
  }
  throw new Error(`Unknown forEach source "${source}"`);
}

function hrefOf(target, ctx) {
  if (target.url) return esc(fill(target.url, ctx));
  const params = {};
  for (const [key, value] of Object.entries(target.params || {})) params[key] = fill(value, ctx);
  const screen = ui.screens[target.screen];
  if (!screen) throw new Error(`Unknown target screen "${target.screen}"`);
  return '#' + esc(fill(screen.route, params));
}

const externalAttr = (target) => (target.url ? ' target="_blank" rel="noopener"' : '');

const eyeIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';

const commentForm =
  '<section class="watch-card">' +
  '<h2 class="card-title">Tanggapan Anda</h2>' +
  '<form class="comment-form">' +
  '<label class="field"><span>Nama Anda</span><input type="text" name="name" placeholder="Ketik nama lengkap Anda" autocomplete="name" required></label>' +
  '<label class="field"><span>Email</span><input type="email" name="email" placeholder="Isi alamat email Anda" autocomplete="email" required></label>' +
  '<label class="field"><span>Nomor HP</span><input type="tel" name="phone" placeholder="+62 xxxxxxxxxx" autocomplete="tel"></label>' +
  '<label class="field"><span>Tanggapan setelah melihat klip ini</span><textarea name="message" rows="5" placeholder="Isi ulasan/komentar/tanggapan Anda" required></textarea></label>' +
  '<div class="field"><span>Lengkapi Kode Validasi dibawah ini:</span>' +
  '<div class="captcha-row"><span class="captcha" aria-hidden="true"></span>' +
  '<button type="button" class="captcha-refresh" aria-label="Muat ulang kode validasi" title="Muat ulang kode">&#8635;</button>' +
  '<input type="text" name="captcha" autocomplete="off" aria-label="Kode validasi" required></div></div>' +
  '<p class="form-status" role="status"></p>' +
  '<button type="submit" class="submit-btn">KIRIM</button>' +
  '</form></section>';

const downloadIcon =
  '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>';

const fieldIcons = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'
};

const renderers = {
  legalPage: (c) => {
    let body = '';
    let inList = false;
    for (const [kind, text] of ui.data[c.source].blocks) {
      if (kind === 'li') {
        if (!inList) body += '<ol class="legal-list">';
        inList = true;
        body += `<li>${esc(text)}</li>`;
        continue;
      }
      if (inList) body += '</ol>';
      inList = false;
      if (kind === 'h') body += `<h3 class="legal-h">${esc(text)}</h3>`;
      else if (/^[\w.+-]+@[\w.-]+$/.test(text)) body += `<p class="legal-p"><a href="mailto:${esc(text)}">${esc(text)}</a></p>`;
      else body += `<p class="legal-p">${esc(text)}</p>`;
    }
    if (inList) body += '</ol>';
    return `<section class="legal"><h2 class="section-title">${esc(c.title)}</h2><div class="legal-body">${body}</div></section>`;
  },

  contactForm: (c) => {
    const fields = c.fields
      .map((f) => {
        const icon = f.icon
          ? `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${fieldIcons[f.icon]}</svg>`
          : '<span class="icon-space"></span>';
        const attrs =
          `name="${esc(f.name)}" placeholder="${esc(f.placeholder)}"` +
          (f.autocomplete ? ` autocomplete="${esc(f.autocomplete)}"` : '') +
          (f.required ? ' required' : '');
        const control =
          f.type === 'textarea' ? `<textarea ${attrs} rows="5"></textarea>` : `<input type="${esc(f.type)}" ${attrs}>`;
        return `<label class="field"><span class="field-label">${icon}${esc(f.label)}</span>${control}</label>`;
      })
      .join('');
    return (
      `<section class="contact">` +
      `<h2 class="section-title">${esc(c.title)}</h2>` +
      `<p class="contact-intro">${esc(c.intro)}</p>` +
      `<form class="comment-form">` +
      fields +
      `<div class="field"><span class="field-label">${esc(c.captchaLabel)}</span>` +
      `<div class="captcha-row"><span class="captcha" aria-hidden="true"></span>` +
      `<button type="button" class="captcha-refresh" aria-label="Muat ulang kode validasi" title="Muat ulang kode">&#8635;</button>` +
      `<input type="text" name="captcha" autocomplete="off" aria-label="Kode validasi" required></div></div>` +
      `<p class="form-status" role="status"></p>` +
      `<button type="submit" class="submit-btn">${esc(c.submit)}</button>` +
      `</form></section>`
    );
  },

  appList: (c) => {
    const apps = ui.data[c.source];
    const pageSize = c.pageSize;
    const pages = Math.ceil(apps.length / pageSize);
    const options = Array.from({ length: pages }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
    const cards = apps
      .map(
        (app) =>
          `<article class="app-card">` +
          `<div class="app-logo">${app.image ? `<img src="${esc(encodeURI(ui.app.siteUrl + app.image))}" alt="" loading="lazy" onerror="this.remove()">` : ''}</div>` +
          `<a class="app-download" href="${esc(app.link)}" target="_blank" rel="noopener">${downloadIcon}<span>Unduh</span></a>` +
          `<h3 class="app-name">${esc(app.name)} <span class="verified">&#10004;</span></h3></article>`
      )
      .join('');
    return (
      `<section class="app-browse" data-page-size="${pageSize}">` +
      `<div class="app-list">${cards}</div>` +
      `<div class="pager">` +
      `<span>Konten : <b data-from>1</b> - <b data-to>${Math.min(pageSize, apps.length)}</b> dari total <b>${apps.length}</b> Data.</span>` +
      `<label>Halaman: <select class="page-select">${options}</select></label>` +
      `<span>dari ${pages}</span></div></section>`
    );
  },

  heading: (c, ctx) =>
    `<h2 class="section-title">${esc(fill(c.text, ctx))}</h2>`,

  categoryGrid: (c, ctx) =>
    `<div class="cat-grid">${c.items
      .map(
        (item) =>
          `<a class="cat-card" href="${hrefOf(item.target, ctx)}"${externalAttr(item.target)} ` +
          `style="--grad:linear-gradient(90deg,${item.colors.map(esc).join(',')});--tc:${esc(item.textColor)}">` +
          `<span class="cat-title">${esc(item.title)}</span>` +
          `<span class="cat-action">${esc(item.action)} &rsaquo;</span></a>`
      )
      .join('')}</div>`,

  letterGrid: (c, ctx) => {
    // Original round-avatar list; shown unless design 2 is active (see letter-view CSS).
    const bubbles = ui.data[c.source]
      .map((lang) => {
        const local = { ...ctx, slug: lang.slug, language: lang.slug, languageName: lang.name };
        const initials = esc(lang.name.slice(0, 2).toUpperCase());
        const image = lang.image
          ? `<img src="${esc(ui.app.siteUrl + lang.image)}" alt="" loading="lazy" onerror="this.remove()">`
          : '';
        return (
          `<a class="bubble" href="${hrefOf(c.target, local)}">` +
          `<span class="avatar">${initials}${image}</span>` +
          `<span class="bubble-name">${esc(lang.name)}</span></a>`
        );
      })
      .join('');
    // Languages are unique by slug; each one is listed once under its first letter.
    const items = ui.data[c.source]
      .filter((lang, i, all) => all.findIndex((l) => l.slug === lang.slug) === i)
      .sort((a, b) => a.name.localeCompare(b.name));
    const letterOf = (lang) => lang.name.trim().charAt(0).toUpperCase();
    const letters = [...new Set(items.map(letterOf))];
    const first = letters[0];
    const buttons = letters
      .map((l) => `<button type="button" class="letter-btn${l === first ? ' on' : ''}" data-letter="${esc(l)}">${esc(l)}</button>`)
      .join('');
    const cells = items
      .map((lang) => {
        const local = { ...ctx, slug: lang.slug, language: lang.slug, languageName: lang.name };
        const letter = letterOf(lang);
        const hidden = letter === first ? '' : ' hidden';
        // Each letter gets its own hue so monograms and accents stay distinct.
        const hue = (letter.charCodeAt(0) * 37) % 360;
        return (
          `<li data-letter="${esc(letter)}" style="--hue:${hue}"${hidden}>` +
          `<a href="${hrefOf(c.target, local)}"><span class="lang-mono">${esc(letter)}</span>` +
          `<span class="lang-name">${esc(lang.name)}</span><span class="lang-go">&rsaquo;</span></a></li>`
        );
      })
      .join('');
    const firstCount = items.filter((lang) => letterOf(lang) === first).length;
    return (
      `<div class="bubble-view"><div class="bubble-row">${bubbles}</div></div>` +
      `<div class="letter-view">` +
      `<div class="letter-hero"><span class="hero-letter" data-hero>${esc(first)}</span>` +
      `<div class="hero-info"><span class="hero-label">Bahasa berawalan</span><span class="hero-count" data-count>${firstCount} bahasa</span></div></div>` +
      `<div class="letter-filter" role="group" aria-label="Filter huruf awal">${buttons}</div>` +
      `<ul class="lang-grid">${cells}</ul></div>`
    );
  },

  regionList: (c, ctx) =>
    ui.data.regions
      .map(
        (region) =>
          `<details class="region-group"><summary>${esc(region.name)} (${region.languages.length})</summary><ul class="lang-list">${region.languages
            .map((lang) => {
              const local = { ...ctx, slug: lang.slug, language: lang.slug, languageName: lang.name };
              return `<li><a href="${hrefOf(c.target, local)}">${esc(lang.name)}</a></li>`;
            })
            .join('')}</ul></details>`
      )
      .join(''),

  latestVideos: (c) =>
    `<div class="video-list" data-sortable>${ui.data[c.source]
      .map(
        (video, i) =>
          `<a class="vcard" href="#watch" data-watch data-order="${i}" data-views="${video.views}" data-date="${esc(video.date)}" data-date-label="${esc(video.dateLabel)}" data-href="${esc(encodeURI(ui.app.siteUrl + video.href))}" data-image="${video.image ? esc(encodeURI(ui.app.siteUrl + video.image)) : ''}">` +
          `<div class="thumb">` +
          (video.image
            ? `<img src="${esc(encodeURI(ui.app.siteUrl + video.image))}" alt="" loading="lazy" onerror="this.remove()">`
            : '') +
          `<span class="duration">${esc(video.duration)}</span></div>` +
          `<h3 class="vtitle">${esc(video.title)}</h3>` +
          `<div class="channel">${esc(ui.app.channel)} <span class="verified">&#10004;</span> &#9829; ${video.likes}</div>` +
          `<div class="meta">${video.views.toLocaleString('en-US')} views &bull; ${esc(video.dateLabel)}</div></a>`
      )
      .join('')}</div>`,

  videoDetail: (c) => {
    // One shared example page: the video details shown on click are filled in by the client script.
    const video = c.example;
    const thumb = video.image
      ? `<img src="${esc(encodeURI(ui.app.siteUrl + video.image))}" alt="" onerror="this.remove()">`
      : '';
    const tags = (video.tags || []).map((tag) => `<span class="tag">${esc(tag)}</span>`).join('');
    const info =
      (video.category ? `<p class="info-row"><strong>Kategori :</strong><span>${esc(video.category)}</span></p>` : '') +
      (video.description ? `<p class="info-row"><strong>Deskripsi :</strong><span class="desc">${esc(video.description)}</span></p>` : '');
    return (
      `<article class="watch">` +
      `<a class="watch-thumb thumb" href="${esc(encodeURI(ui.app.siteUrl + video.href))}" target="_blank" rel="noopener" aria-label="Tonton di website">${thumb}</a>` +
      `<h2 class="watch-title">${esc(video.title)}</h2>` +
      `<p class="watch-views">${eyeIcon}<span>Dilihat ${video.views.toLocaleString('en-US')}</span></p>` +
      `<div class="publisher">` +
      `<span class="pub-logo" aria-hidden="true"></span>` +
      `<div class="pub-info"><div class="channel">${esc(ui.app.channel)} <span class="verified">&#10004;</span></div>` +
      `<div class="meta watch-date">Publikasi ${esc(video.dateLabel)}</div></div>` +
      `<button type="button" class="like-btn" aria-pressed="false">&#9829; Suka</button></div>` +
      (info ? `<div class="watch-card">${info}</div>` : '') +
      (tags ? `<div class="watch-card"><strong class="info-label">Tags :</strong><div class="tag-list">${tags}</div></div>` : '') +
      commentForm +
      `</article>`
    );
  },

  searchResults: () =>
    `<h2 class="section-title" id="searchTitle">Pencarian</h2>` +
    `<div class="search-head"><p class="search-status" id="searchStatus"></p>` +
    `<a class="search-web" id="searchWeb" href="#" target="_blank" rel="noopener"></a></div>` +
    `<div class="video-list" id="searchList"></div>`,

  sortChips: (c) =>
    `<div class="chips" role="group">${c.options
      .map(
        (option, i) =>
          `<button type="button" class="chip${i === 0 ? ' on' : ''}" data-sort="${esc(option.id)}">${esc(option.label)}</button>`
      )
      .join('')}</div>`,

  videoList: (c, ctx) =>
    `<div class="video-list" data-sortable>${ui.data[c.source]
      .map(
        (video, i) =>
          `<a class="vcard" href="#watch" data-watch data-order="${i}" data-views="${video.views}" data-date="${esc(video.date)}" data-date-label="${esc(video.dateLabel)}">` +
          `<div class="thumb"><span class="duration">${esc(video.duration)}</span></div>` +
          `<h3 class="vtitle">${esc(fill(video.title, ctx))}</h3>` +
          `<div class="channel">${esc(ui.app.channel)} <span class="verified">&#10004;</span></div>` +
          `<div class="meta">Dilihat ${video.views} &bull; ${esc(video.dateLabel)}</div></a>`
      )
      .join('')}</div>`,
};

function renderComponents(screenKey, components, ctx) {
  return components
    .map((c) => {
      const render = renderers[c.type];
      if (!render) throw new Error(`Unknown component "${c.type}" in screen "${screenKey}"`);
      const html = render(c, ctx);
      // Wrapper carries the section's design variables; with no design active it matches the page look.
      return c.scope ? `<div class="sec sec-${esc(c.scope)}">${html}</div>` : html;
    })
    .join('\n');
}

// Titles of single pages (e.g. Kontak Kami), used for breadcrumbs.
const pageTitles = Object.fromEntries(
  Object.values(ui.screens)
    .filter((screen) => !screen.forEach && screen.components.some((c) => c.title))
    .map((screen) => [screen.route, screen.components.find((c) => c.title).title])
);

const sections = [];
for (const [key, screen] of Object.entries(ui.screens)) {
  const skipped = screen.skip || [];
  const instances = screen.forEach ? instancesOf(screen.forEach).filter((ctx) => !skipped.includes(ctx.category)) : [{}];
  for (const ctx of instances) {
    const route = fill(screen.route, ctx);
    const body = renderComponents(key, screen.components, ctx);
    sections.push(`<section class="screen" data-screen="${esc(key)}" data-route="${esc(route)}" hidden>\n${body}\n</section>`);
  }
}

const drawerItems = ui.drawer
  .map((item) => `<a class="drawer-item" href="${hrefOf(item.target, {})}"${externalAttr(item.target)}>${esc(item.title)}</a>`)
  .join('\n');

const kebab = (name) => name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
const designVars = (design) =>
  Object.entries(design.vars).map(([name, value]) => `--${kebab(name)}:${esc(value)};`).join('');
const baseDesign = ui.designs[0];
const designIds = ui.designs.map((d) => String(d.id));

// Logo is drawn on the same pixel grid as the website's logo image (152x30).
const logoSvg = (() => {
  const { layout } = brand;
  const color = esc(brand.color);
  const parts = layout.parts.map((part) => {
    if (part.text) {
      // textLength fixes each letter to the website's glyph width, so spacing matches the website logo.
      return `<text x="${part.x}" y="${layout.baseline}" textLength="${part.width}" lengthAdjust="spacingAndGlyphs">${esc(part.text)}</text>`;
    }
    if (part.play) {
      const { cx, cy, r } = part.play;
      return (
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>` +
        `<path d="M${cx - 3} ${cy - 4.5}V${cy + 4.5}L${cx + 4} ${cy}Z" fill="#fff"/>`
      );
    }
    if (part.pause) {
      const { x, y, w, h, gap } = part.pause;
      return [0, 1].map((i) => `<rect x="${x + i * (w + gap)}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`).join('');
    }
    throw new Error('Unknown logo part');
  });
  return (
    `<svg class="logo-svg" viewBox="0 0 ${layout.width} ${layout.height}" width="${layout.width}" height="${layout.height}" role="img" aria-label="${esc(ui.app.name)}">` +
    `<image href="${logoSrc}" x="0" y="0" width="${layout.iconWidth}" height="${layout.height}" preserveAspectRatio="xMidYMid meet"/>` +
    `<g fill="currentColor" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" font-size="${layout.fontSize}" font-weight="700">` +
    parts.filter((p, i) => layout.parts[i].text).join('') +
    `</g>` +
    parts.filter((p, i) => !layout.parts[i].text).join('') +
    `</svg>`
  );
})();
// Scope "all" applies to the whole page and beats the section-scoped designs (!important).
const designCss = ui.designs
  .filter((d) => Object.keys(d.vars).length > 0)
  .map((d) =>
    d.scope === 'all'
      ? `body[data-design~="${esc(d.id)}"],body[data-design~="${esc(d.id)}"] .sec{${designVars(d).replace(/;/g, ' !important;')}}`
      : `body[data-design~="${esc(d.id)}"] .sec-${esc(d.scope)}{${designVars(d)}}`
  )
  .join('\n');

const CSS = `:root{${designVars(baseDesign)}}
${designCss}
*{box-sizing:border-box}
[hidden]{display:none!important}
.sec{color:var(--text);background:var(--page)}
html,body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:var(--text);background:var(--outside);-webkit-text-size-adjust:100%}
a{text-decoration:none;color:inherit}
.app{max-width:480px;min-height:100vh;margin:0 auto;background:var(--page);box-shadow:0 0 24px rgba(0,0,0,.15)}
.topbar{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:4px;height:56px;padding:0 8px;background:var(--header);color:var(--header-text)}
.icon-btn{width:34px;height:34px;flex:none;border:0;border-radius:50%;background:transparent;color:var(--header-text);font-size:19px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}
.brand{display:flex;align-items:center;flex:none}
.logo-svg{display:block;width:152px;height:30px;flex:none;overflow:visible;color:var(--header-text)}
body.has-back .logo-svg{width:120px;height:24px}
.switcher{display:flex;align-items:center;gap:2px;flex:none}
.sw-btn{width:20px;height:20px;padding:0;border:1px solid var(--header-text);border-radius:5px;background:transparent;color:var(--header-text);font-size:11px;font-weight:700;line-height:1;cursor:pointer}
.sw-btn[aria-pressed="true"]{background:var(--header-text);color:var(--header)}
.sw-ball{width:20px;height:20px;padding:0;border:0;background:transparent;color:var(--header-text);cursor:pointer;display:flex;align-items:center;justify-content:center}
.sw-ball svg{display:block;width:20px;height:20px}
.srch{margin-left:auto}
.srch svg{display:block}
.crumbs{position:sticky;top:56px;z-index:28;display:flex;align-items:center;gap:6px;height:34px;padding:0 12px;background:var(--card);border-bottom:1px solid var(--line);font-size:13px;white-space:nowrap;overflow-x:auto;scrollbar-width:none}
.crumbs::-webkit-scrollbar{display:none}
.crumbs a{color:var(--link);font-weight:600}
.crumbs .sep{color:var(--muted)}
.crumbs .current{color:var(--text);font-weight:700}
.searchbar{position:sticky;top:90px;z-index:29;display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--header)}
.searchbar input{flex:1;min-width:0;height:40px;border:0;border-radius:var(--radius);padding:0 12px;font-size:16px;background:var(--card);color:var(--text);outline:none}
.searchbar button{width:40px;height:40px;flex:none;border:0;border-radius:var(--radius);background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
.search-head{margin:0 0 12px}
.search-status{margin:0 0 4px;color:var(--muted);font-size:13px}
.search-web{font-size:13px;font-weight:700;color:var(--link)}
@media (max-width:380px){
  .topbar{gap:3px;padding:0 6px}
  .logo-svg{width:100px;height:20px}
  body.has-back .logo-svg{width:76px;height:15px}
  .icon-btn{width:28px;height:28px;font-size:16px}
  .sw-btn{width:18px;height:18px;font-size:10px}
  .sw-ball,.sw-ball svg{width:18px;height:18px}
}
main{padding:16px}
.section-title{font-size:18px;margin:16px 0 8px}
.cat-grid{display:grid;grid-template-columns:repeat(var(--cat-cols),1fr);gap:12px}
.cat-card{height:var(--cat-h);border-radius:var(--radius);padding:12px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:var(--shadow);background:var(--grad);color:var(--tc)}
.cat-title{font-size:15px;font-weight:700;line-height:1.25}
.cat-action{font-size:13px}
.bubble-row{display:flex;gap:12px;overflow-x:auto;padding:4px 0 12px;-webkit-overflow-scrolling:touch}
.bubble{flex:0 0 88px;text-align:center;font-size:12px}
.avatar{position:relative;display:flex;width:64px;height:64px;margin:0 auto 6px;border-radius:var(--avatar-radius);background:var(--avatar-bg);color:var(--primary);font-weight:700;align-items:center;justify-content:center;overflow:hidden}
.avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bubble-name{display:block;line-height:1.3}
.letter-view{display:none}
body[data-design~="2"] .letter-view{display:block}
body[data-design~="2"] .bubble-view{display:none}
body[data-design~="2"] .sec-bahasa .section-title{margin-bottom:0;line-height:1.2}
body[data-design~="2"] .letter-hero{margin:0 0 10px}
/* Design 3: Tayangan Terbaru = featured video on top, the rest as a compact list. */
body[data-design~="3"] .sec-terbaru .video-list{gap:14px}
body[data-design~="3"] .sec-terbaru a.vcard{position:relative;padding:12px;background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow)}
body[data-design~="3"] .sec-terbaru a.vcard:first-child .vtitle{font-size:18px;margin:10px 2px 6px}
body[data-design~="3"] .sec-terbaru a.vcard:first-child::before{content:"Sorotan";position:absolute;top:20px;left:20px;z-index:1;padding:4px 10px;border-radius:999px;background:var(--primary);color:var(--page);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
body[data-design~="3"] .sec-terbaru a.vcard:not(:first-child){display:grid;grid-template-columns:120px minmax(0,1fr);grid-template-areas:"thumb title" "thumb channel" "thumb meta";column-gap:12px;align-content:start}
body[data-design~="3"] .sec-terbaru a.vcard:not(:first-child) .thumb{grid-area:thumb}
body[data-design~="3"] .sec-terbaru a.vcard:not(:first-child) .vtitle{grid-area:title;font-size:14px;margin:0 0 4px}
body[data-design~="3"] .sec-terbaru a.vcard:not(:first-child) .channel{grid-area:channel}
body[data-design~="3"] .sec-terbaru a.vcard:not(:first-child) .meta{grid-area:meta}
/* Design 1: the film menu switches from the original 1-column list (no design active) to a 2-column coloured grid; it keeps its colours even when 5 is also on. */
body[data-design~="1"] .sec-film .cat-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
body[data-design~="1"] .sec-film .cat-card{height:130px !important;border-radius:16px !important;background:var(--grad) !important;color:var(--tc) !important;box-shadow:0 4px 14px rgba(0,0,0,.12) !important}
/* Design 5 (black & white): greyscale over the whole page except video thumbnails (.thumb sits above the overlay); menu cards lose their background. Placed after design 1 so it wins on the film menu. */
body[data-design~="5"]::before{content:"";position:fixed;top:0;right:0;bottom:0;left:0;z-index:10;pointer-events:none;backdrop-filter:grayscale(1);-webkit-backdrop-filter:grayscale(1)}
body[data-design~="5"] .thumb,body[data-design~="5"] .sec-bahasa{position:relative;z-index:11}
body[data-design~="5"] .topbar,body[data-design~="5"] .crumbs,body[data-design~="5"] .searchbar,body[data-design~="5"] .drawer{filter:grayscale(1)}
body[data-design~="5"] .sec .cat-card{background:none !important;border:1px solid #111111;box-shadow:none !important;color:#111111 !important}
body[data-design~="2"] .sec-bahasa{--page:#FFFFFF;--card:#FFFFFF;--text:#111827;--muted:#6B7280;--line:#E5E7EB;--primary:#0E9F6E;--link:#1F6FB2;--shadow:0 2px 10px rgba(0,0,0,.08);background:#FFFFFF;color:var(--text)}
.letter-hero{display:flex;align-items:center;gap:14px;margin:6px 0 14px}
.hero-letter{display:grid;place-items:center;width:64px;height:64px;border-radius:20px;background:linear-gradient(135deg,var(--primary),var(--link));color:var(--page);font-size:32px;font-weight:800;box-shadow:0 10px 24px rgba(61,214,140,.25)}
.hero-info{display:flex;flex-direction:column;gap:4px}
.hero-label{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.hero-count{font-size:18px;font-weight:700;color:var(--text)}
.letter-filter{display:flex;gap:3px;padding:4px 0 10px;margin:0 0 14px}
.letter-btn{flex:1 1 0;min-width:0;height:36px;padding:0;border:1px solid var(--line);border-radius:var(--radius);background:var(--card);color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;transition:transform .15s ease,background .2s ease,color .2s ease}
.letter-btn:hover{color:var(--text);transform:translateY(-2px)}
.letter-btn.on{background:var(--primary);border-color:var(--primary);color:var(--page);box-shadow:0 6px 16px rgba(61,214,140,.35)}
.lang-grid{list-style:none;margin:0 0 12px;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
@media (max-width:359px){.lang-grid{grid-template-columns:minmax(0,1fr)}}
.lang-grid li{animation:langIn .3s ease both}
@keyframes langIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.lang-grid li a{position:relative;display:flex;align-items:center;gap:14px;min-height:80px;padding:16px 16px 16px 20px;overflow:hidden;background:var(--card);color:var(--text);border-radius:var(--radius);box-shadow:var(--shadow);transition:transform .15s ease}
.lang-grid li a::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:hsl(var(--hue) 75% 60%)}
.lang-grid li a:hover{transform:translateY(-2px)}
.lang-mono{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:hsl(var(--hue) 70% 50%);color:#fff;font-size:14px;font-weight:700}
.lang-name{flex:1;min-width:0;font-size:14px;font-weight:600;line-height:1.3;overflow-wrap:anywhere}
.lang-go{color:var(--primary);font-size:20px;line-height:1}
.region-group{border-bottom:1px solid var(--line)}
.region-group summary{display:flex;align-items:center;justify-content:space-between;padding:14px 0;color:var(--primary);font-size:17px;font-weight:700;cursor:pointer;list-style:none}
.region-group summary::-webkit-details-marker{display:none}
.region-group summary::after{content:"\\25BE";font-size:16px;transition:transform .2s ease}
.region-group[open] summary::after{transform:rotate(180deg)}
.region-group .lang-list{padding-bottom:12px}
.lang-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(var(--lang-cols),1fr);gap:8px}
.lang-list a{display:block;background:var(--card);color:var(--link);padding:12px;border-radius:var(--radius);font-size:15px;line-height:1.3;box-shadow:var(--shadow)}
.chips{display:flex;gap:8px;overflow-x:auto;margin:12px 0 16px;padding-bottom:4px}
.chip{flex:none;border:1px solid var(--line);background:var(--card);color:var(--text);border-radius:8px;padding:6px 14px;font-size:14px;cursor:pointer}
.chip.on{background:var(--chip-on-bg);border-color:var(--chip-on-border);color:var(--chip-on-text)}
.video-list{display:flex;flex-direction:column;gap:18px}
.thumb{position:relative;aspect-ratio:16/9;border-radius:var(--radius);background:linear-gradient(135deg,var(--header),var(--sidebar));overflow:hidden}
.thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
a.vcard{display:block;color:inherit}
.duration{position:absolute;right:8px;bottom:8px;background:var(--link);color:#fff;font-size:12px;padding:2px 6px;border-radius:4px}
.vtitle{font-size:15px;margin:8px 0 4px;line-height:1.3}
.channel{color:var(--primary);font-size:13px;font-weight:600}
.verified{font-size:11px}
.meta{color:var(--muted);font-size:12px;margin-top:2px}
.drawer{position:fixed;top:56px;bottom:0;left:max(0px,calc(50% - 240px));z-index:20;width:min(72vw,300px);overflow-y:auto;padding:4px 0 24px;background:var(--sidebar);color:#fff;transform:translateX(-110vw);transition:transform .25s ease}
.drawer-item{display:block;padding:14px 20px;font-size:15px;font-weight:600}
.drawer-item:hover,.drawer-item:active{background:rgba(255,255,255,.08)}
.drawer-footer{margin-top:16px;padding:16px 20px 0;border-top:1px solid rgba(255,255,255,.12);font-size:13px;line-height:1.6}
.drawer-footer p{margin:0 0 6px}
.drawer-footer a{display:block;padding:2px 0;font-weight:700;color:#fff}
.scrim{position:fixed;top:56px;right:0;bottom:0;left:0;z-index:15;background:rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .25s ease}
body.drawer-open .drawer{transform:none}
body.drawer-open .scrim{opacity:1;pointer-events:auto}
.legal-body{font-size:14px;line-height:1.7;color:var(--text)}
.legal-h{font-size:15px;margin:18px 0 6px}
.legal-p{margin:0 0 10px}
.legal-list{margin:0 0 12px;padding-left:22px}
.legal-list li{margin-bottom:6px}
.legal-body a{color:var(--link)}
.contact-intro{margin:0 0 18px;font-size:13px;line-height:1.6;color:var(--muted)}
.contact .field{margin-bottom:14px}
.contact .field-label{display:flex;align-items:center;gap:6px;color:var(--muted)}
.icon-space{flex:none;width:14px;height:14px}
.contact .field input,.contact .field textarea{background:var(--outside);border-color:transparent}
.contact .field textarea{min-height:140px}
.app-list{display:flex;flex-direction:column;gap:10px}
.app-card{display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow)}
.app-logo{flex:none;width:48px;height:48px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--avatar-bg)}
.app-logo img{width:100%;height:100%;object-fit:cover}
.app-download{flex:none;display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:var(--radius);background:var(--primary);color:#fff;font-size:12px;font-weight:600;white-space:nowrap}
.app-name{flex:1;min-width:0;margin:0;font-size:14px;line-height:1.3;text-align:left}
.pager{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:16px 0 8px;font-size:12px;color:var(--muted)}
.pager select{font:inherit;padding:2px 6px;border:1px solid var(--line);border-radius:4px;background:var(--card);color:var(--text)}
.watch{display:flex;flex-direction:column;gap:12px;padding-top:4px}
.watch-thumb{display:block}
.watch-title{font-size:18px;line-height:1.3;margin:4px 0 0}
.watch-views{display:flex;align-items:center;gap:6px;margin:0;color:var(--muted);font-size:13px}
.watch-views svg{flex:none;width:16px;height:16px}
.publisher{display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow)}
.pub-logo{flex:none;width:40px;height:40px;border-radius:50%;background:var(--card) url("${logoSrc}") center/30px no-repeat;border:1px solid var(--line)}
.pub-info{flex:1;min-width:0}
.pub-info .channel{font-size:14px}
.like-btn{flex:none;display:flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid #E31E24;border-radius:var(--radius);background:var(--card);color:#E31E24;font:inherit;font-size:15px;font-weight:700;cursor:pointer}
.like-btn[aria-pressed="true"]{background:#E31E24;color:#fff}
.watch-card{padding:14px 16px;background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow)}
.card-title{font-size:16px;margin:0 0 12px}
.info-row{margin:0 0 12px;font-size:14px;line-height:1.5}
.info-row:last-child{margin-bottom:0}
.info-row strong,.info-label{display:block;margin-bottom:4px;font-size:15px}
.info-row .desc{display:block;white-space:pre-line;color:var(--link)}
.tag-list{display:flex;flex-wrap:wrap;gap:8px}
.tag{padding:4px 10px;border-radius:4px;background:var(--line);color:var(--muted);font-size:13px}
.field{display:block;margin-bottom:12px}
.field>span{display:block;margin-bottom:4px;font-size:13px;font-weight:700}
.field input,.field textarea{width:100%;padding:9px 10px;border:1px solid var(--line);border-radius:var(--radius);background:var(--page);color:var(--text);font:inherit;font-size:15px}
.field textarea{min-height:120px;resize:vertical}
.captcha-row{display:flex;align-items:center;gap:8px}
.captcha{flex:none;width:120px;height:40px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card);overflow:hidden}
.captcha svg{display:block;width:100%;height:100%}
.captcha-row input{flex:1;min-width:0}
.captcha-refresh{flex:none;width:34px;height:34px;border:1px solid var(--line);border-radius:50%;background:var(--card);color:var(--text);font-size:18px;line-height:1;cursor:pointer}
.form-status{min-height:1.2em;margin:0 0 10px;font-size:13px;color:var(--muted)}
.form-status.error{color:#D62B2B}
.submit-btn{padding:10px 28px;border:0;border-radius:var(--radius);background:var(--primary);color:#fff;font:inherit;font-size:15px;font-weight:700;letter-spacing:.5px;cursor:pointer}
`;

const ballIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">' +
  '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c3 3.3 3 15.7 0 19M12 2.5c-3 3.3-3 15.7 0 19"/></svg>';

const searchIcon =
  '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
  '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/></svg>';

const switcherHtml =
  `<div class="switcher" id="switcher" role="group" aria-label="Pilihan desain">` +
  ui.designs
    .map((d) => `<button type="button" class="sw-btn" data-design="${esc(d.id)}" title="${esc(d.name)}" aria-label="${esc(d.name)}" aria-pressed="false">${esc(d.id)}</button>`)
    .join('') +
  `<button type="button" class="sw-ball" id="ballBtn" title="Desain berikutnya" aria-label="Desain berikutnya">${ballIcon}</button>` +
  `</div>`;

const JS = `
(function () {
  var body = document.body;
  var backBtn = document.getElementById('backBtn');
  var DESIGN_IDS = ${JSON.stringify(designIds)};
  var DESIGN_KEY = 'tokomedia-design';
  var SITE = ${JSON.stringify(ui.app.siteUrl)};
  var CHANNEL = ${JSON.stringify(ui.app.channel)};
  var SEARCH_URL = SITE + '/search/v/';
  var CATEGORY_TITLES = ${JSON.stringify(Object.fromEntries(ui.data.categories.map((c) => [c.id, c.title])))};
  var PAGE_TITLES = ${JSON.stringify(pageTitles)};
  var LANG_NAMES = ${JSON.stringify(Object.fromEntries(languages.map((l) => [l.slug, l.name])))};
  var lastCategory = 'film-riwayat-isa-al-masih';
  var lastCrumbs = [['Beranda', '#home']];
  var lastRoute = 'home';
  var watchData = null;
  var crumbsEl = document.getElementById('crumbs');
  var searchBar = document.getElementById('searchBar');
  var searchInput = document.getElementById('searchInput');
  var searchToken = 0;

  function route() {
    return decodeURIComponent(location.hash.replace(/^#/, '')) || 'home';
  }

  function setDrawer(open) {
    body.classList.toggle('drawer-open', open);
  }

  function show() {
    var current = route();
    var key = current === 'search' || current.indexOf('search/') === 0 ? 'search' : current;
    var match = null;
    document.querySelectorAll('.screen').forEach(function (section) {
      section.hidden = section.dataset.route !== key;
      if (!section.hidden) match = section;
    });
    if (!match) {
      location.replace('#home');
      return;
    }
    backBtn.hidden = key === 'home';
    body.classList.toggle('has-back', key !== 'home');
    setDrawer(false);
    window.scrollTo(0, 0);
    renderCrumbs(key, current);
    if (key === 'watch') fillWatch();
    searchBar.hidden = true;
    if (key === 'search') {
      var query = current === 'search' ? '' : current.slice('search/'.length);
      searchInput.value = query;
      runSearch(query);
    }
  }

  function fillWatch() {
    if (!watchData) return;
    var root = document.querySelector('.screen[data-route="watch"]');
    var link = root.querySelector('.watch-thumb');
    var old = link.querySelector('img');
    if (old) old.remove();
    root.querySelector('.watch-title').textContent = watchData.title;
    root.querySelector('.watch-views span').textContent = 'Dilihat ' + Number(watchData.views || 0).toLocaleString('en-US');
    root.querySelector('.watch-date').textContent = 'Publikasi ' + watchData.dateLabel;
    if (watchData.href) {
      link.href = watchData.href;
      link.target = '_blank';
      link.rel = 'noopener';
    } else {
      link.removeAttribute('href');
      link.removeAttribute('target');
    }
    if (watchData.image) {
      var img = document.createElement('img');
      img.src = watchData.image;
      img.alt = '';
      img.onerror = function () { img.remove(); };
      link.appendChild(img);
    }
  }

  function crumbItem(label, href) {
    var el = document.createElement(href ? 'a' : 'span');
    el.textContent = label;
    if (href) el.href = href; else el.className = 'current';
    return el;
  }

  function renderCrumbs(key, current) {
    var items;
    if (key === 'home') {
      items = [['Beranda', null]];
    } else if (key.indexOf('languages/') === 0) {
      var category = current.slice('languages/'.length);
      lastCategory = category;
      items = [
        ['Beranda', '#home'],
        [CATEGORY_TITLES[category] || category, '#languages/' + category],
        [category === 'app' ? 'Daftar Aplikasi' : 'Daftar Bahasa', null]
      ];
    } else if (key.indexOf('videos/') === 0) {
      var language = current.slice('videos/'.length);
      items = [
        ['Beranda', '#home'],
        [CATEGORY_TITLES[lastCategory] || lastCategory, '#languages/' + lastCategory],
        ['Daftar Bahasa', '#languages/' + lastCategory],
        [LANG_NAMES[language] || language, null]
      ];
    } else if (PAGE_TITLES[key]) {
      items = [['Beranda', '#home'], [PAGE_TITLES[key], null]];
    } else {
      var query = current === 'search' ? '' : current.slice('search/'.length);
      items = [['Beranda', '#home'], ['Pencarian \u201C' + query + '\u201D', null]];
    }
    if (key === 'watch') {
      var origin = lastCrumbs[lastCrumbs.length - 1];
      items = lastCrumbs.slice(0, -1).concat([[origin[0], '#' + lastRoute], ['Detail Video', null]]);
    } else {
      lastCrumbs = items;
      lastRoute = current;
    }
    crumbsEl.textContent = '';
    items.forEach(function (item, i) {
      if (i > 0) {
        var sep = document.createElement('span');
        sep.className = 'sep';
        sep.textContent = '\u203A';
        crumbsEl.appendChild(sep);
      }
      crumbsEl.appendChild(crumbItem(item[0], item[1]));
    });
  }

  function parseResults(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return Array.prototype.map.call(doc.querySelectorAll('.video-card'), function (card) {
      var link = card.querySelector('.play-icon') || card.querySelector('a');
      var img = card.querySelector('img');
      var time = card.querySelector('.time');
      var title = card.querySelector('.video-title');
      var view = card.querySelector('.video-view');
      var text = view ? view.textContent : '';
      var views = ((text.match(/Dilihat\\s*([\\d.,]+)/i) || text.match(/([\\d.,]+)\\s*views/i) || [])[1]) || '';
      var date = (text.match(/\\d{2} [A-Za-z]{3} \\d{2}/) || [])[0] || '';
      return {
        href: link ? link.getAttribute('href') : '',
        image: img ? img.getAttribute('src') : '',
        title: title ? title.textContent.trim() : '',
        duration: time ? time.textContent.trim() : '',
        views: views.replace(/\\D/g, ''),
        dateLabel: date
      };
    });
  }

  function makeCard(item) {
    var a = document.createElement('a');
    a.className = 'vcard';
    a.href = encodeURI(SITE + item.href);
    a.target = '_blank';
    a.rel = 'noopener';
    var thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (item.image) {
      var img = document.createElement('img');
      img.src = encodeURI(SITE + item.image);
      img.alt = '';
      img.loading = 'lazy';
      img.onerror = function () { img.remove(); };
      thumb.appendChild(img);
    }
    var dur = document.createElement('span');
    dur.className = 'duration';
    dur.textContent = item.duration;
    thumb.appendChild(dur);
    var title = document.createElement('h3');
    title.className = 'vtitle';
    title.textContent = item.title;
    var channel = document.createElement('div');
    channel.className = 'channel';
    channel.textContent = CHANNEL + ' \u2714';
    var meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = [item.views ? Number(item.views).toLocaleString('en-US') + ' views' : '', item.dateLabel]
      .filter(Boolean)
      .join(' \u2022 ');
    a.appendChild(thumb);
    a.appendChild(title);
    a.appendChild(channel);
    a.appendChild(meta);
    return a;
  }

  function runSearch(query) {
    var token = ++searchToken;
    var title = document.getElementById('searchTitle');
    var status = document.getElementById('searchStatus');
    var list = document.getElementById('searchList');
    var web = document.getElementById('searchWeb');
    title.textContent = query ? 'Hasil pencarian untuk \u201C' + query + '\u201D' : 'Pencarian';
    web.href = SEARCH_URL + encodeURIComponent(query);
    web.textContent = 'Lihat semua hasil di website';
    list.textContent = '';
    if (!query) {
      status.textContent = 'Ketik kata yang ingin dicari.';
      return;
    }
    status.textContent = 'Memuat hasil...';
    fetch(SEARCH_URL + encodeURIComponent(query))
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        if (token !== searchToken) return;
        var items = parseResults(html);
        items.forEach(function (item) { list.appendChild(makeCard(item)); });
        status.textContent = items.length
          ? items.length + ' video ditemukan'
          : 'Tidak ada hasil untuk \u201C' + query + '\u201D';
      })
      .catch(function () {
        if (token !== searchToken) return;
        status.textContent = 'Hasil tidak dapat dimuat. Periksa koneksi internet, atau buka hasil di website.';
      });
  }

  var sorters = {
    trending: function (a, b) { return a.dataset.order - b.dataset.order; },
    popular: function (a, b) { return b.dataset.views - a.dataset.views; },
    unviral: function (a, b) { return a.dataset.views - b.dataset.views; },
    newest: function (a, b) { return b.dataset.date.localeCompare(a.dataset.date); },
    oldest: function (a, b) { return a.dataset.date.localeCompare(b.dataset.date); }
  };

  document.addEventListener('click', function (event) {
    var card = event.target.closest('[data-watch]');
    if (card) {
      var cardTitle = card.querySelector('.vtitle');
      watchData = {
        title: cardTitle ? cardTitle.textContent : '',
        views: card.dataset.views,
        dateLabel: card.dataset.dateLabel,
        href: card.dataset.href || '',
        image: card.dataset.image || ''
      };
      return;
    }
    var letter = event.target.closest('.letter-btn');
    if (letter) {
      var letterScreen = letter.closest('.screen');
      letterScreen.querySelectorAll('.letter-btn').forEach(function (b) { b.classList.toggle('on', b === letter); });
      var visible = 0;
      letterScreen.querySelectorAll('.lang-grid li').forEach(function (li) {
        li.hidden = li.dataset.letter !== letter.dataset.letter;
        if (!li.hidden) visible++;
      });
      var counter = letterScreen.querySelector('[data-count]');
      if (counter) counter.textContent = visible + ' bahasa';
      var hero = letterScreen.querySelector('[data-hero]');
      if (hero) hero.textContent = letter.dataset.letter;
      return;
    }
    var chip = event.target.closest('.chip');
    if (!chip) return;
    var section = chip.closest('.screen');
    section.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c === chip); });
    var list = section.querySelector('[data-sortable]');
    var cards = Array.prototype.slice.call(list.children).sort(sorters[chip.dataset.sort]);
    cards.forEach(function (card) { list.appendChild(card); });
  });

  document.getElementById('menuBtn').addEventListener('click', function () {
    setDrawer(!body.classList.contains('drawer-open'));
  });
  document.getElementById('scrim').addEventListener('click', function () { setDrawer(false); });
  backBtn.addEventListener('click', function () {
    if (history.length > 1) history.back(); else location.hash = '#home';
  });
  // body[data-design] holds every active design id, space-separated; each one styles only its own section.
  function activeDesigns() {
    return (body.dataset.design || '').split(' ').filter(Boolean);
  }

  function applyDesigns(list) {
    var ordered = DESIGN_IDS.filter(function (id) { return list.indexOf(id) > -1; });
    body.dataset.design = ordered.join(' ');
    document.querySelectorAll('.sw-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(ordered.indexOf(btn.dataset.design) > -1));
    });
    try { localStorage.setItem(DESIGN_KEY, ordered.join(' ')); } catch (e) {}
  }

  function toggleDesign(id) {
    var list = activeDesigns();
    var index = list.indexOf(id);
    if (index > -1) list.splice(index, 1); else list.push(id);
    applyDesigns(list);
  }

  document.getElementById('switcher').addEventListener('click', function (event) {
    var btn = event.target.closest('.sw-btn');
    if (btn) { toggleDesign(btn.dataset.design); return; }
    if (event.target.closest('.sw-ball')) {
      var active = activeDesigns();
      var current = DESIGN_IDS.indexOf(active[active.length - 1]);
      applyDesigns([DESIGN_IDS[(current + 1) % DESIGN_IDS.length]]);
    }
  });

  var saved = [];
  try { saved = (localStorage.getItem(DESIGN_KEY) || '').split(' '); } catch (e) {}
  var restored = saved.filter(function (id) { return DESIGN_IDS.indexOf(id) > -1; });
  applyDesigns(restored);

  document.getElementById('searchBtn').addEventListener('click', function () {
    searchBar.hidden = !searchBar.hidden;
    if (!searchBar.hidden) searchInput.focus();
  });
  searchBar.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = searchInput.value.trim();
    if (!query) return;
    var target = '#search/' + encodeURIComponent(query);
    searchBar.hidden = true;
    if (location.hash === target) show(); else location.hash = target;
  });

  var CAPTCHA_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  function rnd(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  function drawCaptcha(box) {
    var code = '';
    for (var i = 0; i < 4; i++) code += CAPTCHA_CHARS.charAt(rnd(0, CAPTCHA_CHARS.length - 1));
    var svg = '<svg viewBox="0 0 120 40" aria-hidden="true">';
    for (var n = 0; n < 4; n++) {
      svg += '<line x1="' + rnd(0, 120) + '" y1="' + rnd(0, 40) + '" x2="' + rnd(0, 120) + '" y2="' + rnd(0, 40) + '" stroke="#999"/>';
    }
    for (var j = 0; j < code.length; j++) {
      var x = 10 + j * 27;
      svg += '<text x="' + x + '" y="' + rnd(24, 30) + '" transform="rotate(' + rnd(-20, 20) + ' ' + x + ' 25)" font-family="Arial,sans-serif" font-size="' + rnd(20, 26) + '" font-weight="700" fill="#333">' + code.charAt(j) + '</text>';
    }
    box.innerHTML = svg + '</svg>';
    box.dataset.code = code;
  }

  document.querySelectorAll('.captcha').forEach(drawCaptcha);

  document.addEventListener('click', function (event) {
    var like = event.target.closest('.like-btn');
    if (like) {
      like.setAttribute('aria-pressed', String(like.getAttribute('aria-pressed') !== 'true'));
      return;
    }
    var refresh = event.target.closest('.captcha-refresh');
    if (refresh) {
      var row = refresh.parentNode;
      drawCaptcha(row.querySelector('.captcha'));
      row.querySelector('input').value = '';
    }
  });

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.classList.contains('comment-form')) return;
    event.preventDefault();
    var status = form.querySelector('.form-status');
    var box = form.querySelector('.captcha');
    var input = form.querySelector('input[name="captcha"]');
    status.classList.remove('error');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (input.value.trim().toUpperCase() !== box.dataset.code) {
      status.textContent = 'Kode validasi tidak sesuai. Silakan coba lagi.';
      status.classList.add('error');
      drawCaptcha(box);
      input.value = '';
      return;
    }
    status.textContent = 'Pengiriman tanggapan belum terhubung ke server.';
  });

  document.querySelectorAll('.app-browse').forEach(function (browse) {
    var cards = browse.querySelectorAll('.app-card');
    var size = Number(browse.dataset.pageSize) || 10;
    var select = browse.querySelector('.page-select');
    var from = browse.querySelector('[data-from]');
    var to = browse.querySelector('[data-to]');
    function showPage() {
      var start = (Number(select.value) - 1) * size;
      var end = Math.min(start + size, cards.length);
      cards.forEach(function (card, i) { card.hidden = i < start || i >= end; });
      from.textContent = cards.length ? start + 1 : 0;
      to.textContent = end;
    }
    select.addEventListener('change', showPage);
    showPage();
  });

  window.addEventListener('hashchange', show);
  show();
})();
`;

const html = `<!DOCTYPE html>
<html lang="${esc(ui.app.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="${esc(baseDesign.vars.header)}">
<title>${esc(ui.app.name)}</title>
<style>${CSS}</style>
</head>
<body data-design="">
<nav class="drawer" id="drawer" aria-label="Menu utama">
${drawerItems}
<div class="drawer-footer">
<p>${esc(ui.drawerFooter.copyright)} <strong>${esc(ui.drawerFooter.brand)}</strong></p>
${ui.drawerFooter.links.map((link) => `<a href="${hrefOf(link.target, {})}"${externalAttr(link.target)}>${esc(link.title)}</a>`).join('\n')}
</div>
</nav>
<div class="scrim" id="scrim"></div>
<div class="app">
<header class="topbar">
<button class="icon-btn" id="menuBtn" type="button" aria-label="Menu">&#9776;</button>
<button class="icon-btn" id="backBtn" type="button" aria-label="Kembali" hidden>&#8592;</button>
<a class="brand" href="#home">${logoSvg}</a>
${switcherHtml}
<button class="icon-btn srch" id="searchBtn" type="button" aria-label="Cari" title="Cari">${searchIcon}</button>
</header>
<nav class="crumbs" id="crumbs" aria-label="Breadcrumb"></nav>
<form class="searchbar" id="searchBar" role="search" hidden>
<input type="search" id="searchInput" name="v" placeholder="Cari disini..." autocomplete="off" aria-label="Cari disini">
<button type="submit" aria-label="Cari">${searchIcon}</button>
</form>
<main>
${sections.join('\n')}
</main>
</div>
<script>${JS}</script>
</body>
</html>
`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log(`OK: ${path.basename(inputPath)} -> ${outputPath} (${sections.length} screens, ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
