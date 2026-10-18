'use strict';
/**
 * Builds the full standalone Spatial Glass & Bento OS application for TokoMedia
 * inside c:\data\TokoMedia\TokoMediaUI\spatial-bento-app\index.html
 * using 100% of the data from ../ui.json (all 177 languages, 5 categories, 269 apps,
 * live search + local instant search, captcha validation, and dark/light glass toggle).
 */
const fs = require('fs');
const path = require('path');

const uiPath = path.resolve(__dirname, '..', 'ui.json');
const outputPath = path.resolve(__dirname, 'index.html');
const ui = JSON.parse(fs.readFileSync(uiPath, 'utf8'));

const brand = ui.app.brand;
const logoIconSrc = 'data:image/png;base64,' + fs.readFileSync(path.resolve(__dirname, '..', brand.logo)).toString('base64');
const color = brand.color;
const parts = brand.layout.parts;

const textParts = parts.filter(p => p.text).map(p => {
  return `<text x="${p.x}" y="${brand.layout.baseline}" textLength="${p.width}" lengthAdjust="spacingAndGlyphs">${p.text}</text>`;
}).join('');

const play = parts.find(p => p.play).play;
const pause = parts.find(p => p.pause).pause;

const pauseBars = [0, 1].map(i => {
  return `<rect x="${pause.x + i * (pause.w + pause.gap)}" y="${pause.y}" width="${pause.w}" height="${pause.h}" fill="${color}"/>`;
}).join('');

const playCircle = `<circle cx="${play.cx}" cy="${play.cy}" r="${play.r}" fill="${color}"/><path d="${`M${play.cx - 3} ${play.cy - 4.5}V${play.cy + 4.5}L${play.cx + 4} ${play.cy}Z`}" fill="#fff"/>`;

const logoSvg = `<svg class="brand-svg-logo" viewBox="0 0 ${brand.layout.width} ${brand.layout.height}" width="${brand.layout.width}" height="${brand.layout.height}" role="img" aria-label="TOKO MEDIA">
  <image href="${logoIconSrc}" x="0" y="0" width="${brand.layout.iconWidth}" height="${brand.layout.height}" preserveAspectRatio="xMidYMid meet"/>
  <g class="logo-letters" fill="currentColor" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" font-size="${brand.layout.fontSize}" font-weight="700">
    ${textParts}
  </g>
  ${playCircle}
  ${pauseBars}
</svg>`;

const payload = {
  app: ui.app,
  logoSrc: logoIconSrc,
  categories: [
    {
      id: 'film-riwayat-isa-al-masih',
      title: 'Film Isa Al-Masih',
      subtitle: 'Kisah Kehidupan, Mukjizat & Pelayanan',
      badge: 'FEATURE FILM',
      countLabel: '177 Bahasa Daerah',
      accent: '#059669',
      grad: 'linear-gradient(135deg, rgba(5,150,105,0.18) 0%, rgba(16,185,129,0.06) 100%)',
      iconBg: 'linear-gradient(135deg, #059669, #10B981)',
      icon: 'film'
    },
    {
      id: 'video',
      title: 'Video Kitab Suci',
      subtitle: 'Visualisasi Kitab Suci Bab demi Bab',
      badge: 'VIDEO SERIES',
      countLabel: '95+ Bahasa',
      accent: '#2563EB',
      grad: 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(59,130,246,0.06) 100%)',
      iconBg: 'linear-gradient(135deg, #2563EB, #60A5FA)',
      icon: 'play'
    },
    {
      id: 'clip',
      title: 'Clip Kitab Suci',
      subtitle: 'Cuplikan Pendek Penuh Hikmat',
      badge: 'SHORT CLIPS',
      countLabel: '120+ Bahasa',
      accent: '#0891B2',
      grad: 'linear-gradient(135deg, rgba(8,145,178,0.18) 0%, rgba(6,182,212,0.06) 100%)',
      iconBg: 'linear-gradient(135deg, #0891B2, #22D3EE)',
      icon: 'clip'
    },
    {
      id: 'app',
      title: 'Aplikasi Kitab Suci',
      subtitle: 'Unduh Aplikasi Android & Audio Offline',
      badge: '269 ANDROID APPS',
      countLabel: 'Google Play',
      accent: '#D97706',
      grad: 'linear-gradient(135deg, rgba(217,119,6,0.18) 0%, rgba(245,158,11,0.06) 100%)',
      iconBg: 'linear-gradient(135deg, #D97706, #FBBF24)',
      icon: 'app'
    },
    {
      id: 'film-ikatan-ilahi',
      title: 'Film Ikatan Ilahi',
      subtitle: '12 Episode Sejarah Perjanjian Agung',
      badge: '12 EPISODE SERIES',
      countLabel: '42+ Bahasa',
      accent: '#4F46E5',
      grad: 'linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(99,102,241,0.06) 100%)',
      iconBg: 'linear-gradient(135deg, #4F46E5, #818CF8)',
      icon: 'sparkles'
    }
  ],
  homeLanguages: ui.data.homeLanguages,
  regions: ui.data.regions,
  videos: ui.data.videos,
  latestVideos: ui.data.latestVideos,
  apps: ui.data.apps,
  privacyWeb: ui.data.privacyWeb,
  privacyApp: ui.data.privacyApp,
  contactScreen: ui.screens.contact.components[0],
  watchExample: ui.screens.watch.components[0].example,
  drawer: ui.drawer,
  drawerFooter: ui.drawerFooter
};

const html = `<!DOCTYPE html>
<html lang="id" data-mode="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#EEF2F6">
<title>TOKO MEDIA — Media Nusantara</title>
<meta name="description" content="Pusat media rohani, film, video, dan aplikasi Kitab Suci dalam 177 bahasa daerah Nusantara.">
<meta property="og:title" content="TOKO MEDIA — Media Nusantara">
<meta property="og:description" content="Pusat media rohani, film, video, dan aplikasi Kitab Suci dalam 177 bahasa daerah Nusantara.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://suwandhih.github.io/TokoMedia/">
<meta name="twitter:title" content="TOKO MEDIA — Media Nusantara">
<meta name="twitter:description" content="Pusat media rohani, film, video, dan aplikasi Kitab Suci dalam 177 bahasa daerah Nusantara.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #ECF1F7;
  --bg-mesh-1: rgba(16, 185, 129, 0.22);
  --bg-mesh-2: rgba(99, 102, 241, 0.18);
  --bg-mesh-3: rgba(14, 165, 233, 0.16);
  --glass: rgba(255, 255, 255, 0.78);
  --glass-strong: rgba(255, 255, 255, 0.92);
  --glass-subtle: rgba(255, 255, 255, 0.58);
  --glass-border: rgba(15, 23, 42, 0.08);
  --glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.95);
  --text: #0F172A;
  --text-secondary: #334155;
  --muted: #64748B;
  --primary: #059669;
  --primary-light: #10B981;
  --primary-soft: rgba(5, 150, 105, 0.12);
  --primary-contrast: #FFFFFF;
  --accent: #4F46E5;
  --danger: #E11D48;
  --shadow-sm: 0 6px 18px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 16px 40px rgba(15, 23, 42, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  --shadow-lg: 0 24px 60px rgba(15, 23, 42, 0.12);
  --radius-xl: 32px;
  --radius-lg: 26px;
  --radius-md: 20px;
  --radius-sm: 14px;
  --font-display: 'Outfit', system-ui, -apple-system, sans-serif;
  --font-body: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

html[data-mode="dark"] {
  --bg: #080C14;
  --bg-mesh-1: rgba(16, 185, 129, 0.16);
  --bg-mesh-2: rgba(79, 70, 229, 0.16);
  --bg-mesh-3: rgba(14, 165, 233, 0.12);
  --glass: rgba(17, 24, 39, 0.76);
  --glass-strong: rgba(17, 24, 39, 0.92);
  --glass-subtle: rgba(30, 41, 59, 0.55);
  --glass-border: rgba(255, 255, 255, 0.09);
  --glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --text: #F8FAFC;
  --text-secondary: #CBD5E1;
  --muted: #94A3B8;
  --primary: #10B981;
  --primary-light: #34D399;
  --primary-soft: rgba(16, 185, 129, 0.16);
  --primary-contrast: #03150E;
  --accent: #818CF8;
  --shadow-sm: 0 6px 18px rgba(0, 0, 0, 0.35);
  --shadow-md: 0 16px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.07);
  --shadow-lg: 0 28px 70px rgba(0, 0, 0, 0.65);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
[hidden] { display: none !important; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  overflow-x: hidden;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  transition: background 0.3s ease, color 0.3s ease;
}
a { color: inherit; text-decoration: none; }
button, input, textarea, select { font: inherit; color: inherit; }
img { max-width: 100%; display: block; }

/* Spatial Ambient Mesh Background */
.spatial-mesh {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.mesh-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
}
.mesh-blob--1 {
  width: 560px; height: 560px;
  top: -180px; left: -120px;
  background: var(--bg-mesh-1);
}
.mesh-blob--2 {
  width: 520px; height: 520px;
  top: 25%; right: -160px;
  background: var(--bg-mesh-2);
}
.mesh-blob--3 {
  width: 480px; height: 480px;
  bottom: -140px; left: 20%;
  background: var(--bg-mesh-3);
}

/* Viewport Frame Switcher (Allows testing Desktop/Tablet vs Mobile 430px) */
.stage-wrapper {
  position: relative;
  z-index: 1;
  transition: max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.stage-wrapper.mobile-frame {
  max-width: 450px;
  margin: 20px auto 40px;
  border-radius: 44px;
  border: 8px solid #1E293B;
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.38);
  overflow: hidden;
  background: var(--bg);
}
.stage-wrapper.mobile-frame .desktop-pills,
.stage-wrapper.mobile-frame .search-pill-btn__label,
.stage-wrapper.mobile-frame .search-pill-btn kbd {
  display: none !important;
}
.stage-wrapper.mobile-frame .topbar__row {
  padding: 10px 14px;
  gap: 8px;
}
.stage-wrapper.mobile-frame .topbar__left {
  gap: 8px;
  min-width: 0;
}
.stage-wrapper.mobile-frame .glass-icon-btn,
.stage-wrapper.mobile-frame .search-pill-btn {
  width: 38px;
  height: 38px;
  padding: 0;
  justify-content: center;
  flex: none;
}
.stage-wrapper.mobile-frame .brand-link {
  gap: 8px;
  min-width: 0;
}
.stage-wrapper.mobile-frame .brand-svg-logo {
  height: 25px;
  width: auto;
  max-width: 130px;
  flex: none;
}
.stage-wrapper.mobile-frame .brand-link__tag {
  font-size: 8px;
  letter-spacing: 0.1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stage-wrapper.mobile-frame .crumbs-ribbon {
  padding: 7px 14px;
  gap: 8px;
}

.app-container {
  max-width: 1260px;
  margin: 0 auto;
  min-height: 100vh;
  padding-bottom: 104px;
}

/* Top Spatial Glass Bar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--glass);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--glass-highlight);
}
.topbar__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
}
.topbar__left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.glass-icon-btn {
  width: 42px; height: 42px;
  flex: none;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: var(--glass-strong);
  box-shadow: var(--shadow-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.2s ease, background 0.2s ease;
}
.glass-icon-btn:hover {
  transform: translateY(-1px);
  border-color: var(--primary);
}
.brand-link {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
  text-decoration: none;
}
.brand-svg-logo {
  height: 26px;
  width: auto;
  max-width: 140px;
  display: block;
  flex: none;
  color: var(--text);
  overflow: visible;
}
.brand-link__text {
  display: block;
  line-height: 1;
}
.brand-link__tag {
  font-family: var(--font-mono);
  font-size: 7.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
}

.desktop-pills {
  display: none;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: var(--glass-subtle);
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
}
@media (min-width: 1080px) {
  .desktop-pills { display: inline-flex; }
}
.dpill {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
  transition: all 0.2s;
}
.dpill:hover, .dpill.active {
  background: var(--primary);
  color: var(--primary-contrast);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.28);
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.search-pill-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 42px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: var(--glass-strong);
  color: var(--muted);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.search-pill-btn svg { flex: none; }
.search-pill-btn:hover {
  border-color: var(--primary);
  color: var(--text);
}
.search-pill-btn__label {
  font-size: 13px;
  font-weight: 500;
  display: none;
  white-space: nowrap;
}
@media (min-width: 640px) and (max-width: 1079px), (min-width: 1180px) {
  .search-pill-btn__label { display: inline; }
}
.search-pill-btn kbd {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--glass-subtle);
  border: 1px solid var(--glass-border);
  display: none;
}
@media (min-width: 640px) {
  .search-pill-btn kbd { display: inline-block; }
}
@media (max-width: 520px) {
  .topbar__row { padding: 10px 14px; gap: 8px; }
  .glass-icon-btn, .search-pill-btn { width: 38px; height: 38px; padding: 0; }
  .brand-link__title { font-size: 16px; }
  .brand-link__tag { font-size: 8.5px; letter-spacing: 0.08em; }
}

/* Breadcrumbs Ribbon */
.crumbs-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 20px;
  border-top: 1px solid var(--glass-border);
  background: var(--glass-subtle);
  font-size: 12.5px;
}
.crumbs-list {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}
.crumbs-list::-webkit-scrollbar { display: none; }
.crumb-a {
  color: var(--muted);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
}
.crumb-a:hover {
  background: var(--primary-soft);
  color: var(--primary);
}
.crumb-sep { color: var(--muted); opacity: 0.45; }
.crumb-now {
  color: var(--text);
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
}
.crumbs-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}
.mini-chip-btn {
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass-strong);
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
}
.mini-chip-btn.active, .mini-chip-btn:hover {
  color: var(--primary);
  border-color: var(--primary);
}

/* Slide-Out Spatial Drawer */
.scrim {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease;
}
.scrim.open { opacity: 1; pointer-events: auto; }
.drawer {
  position: fixed;
  top: 12px; bottom: 12px; left: 12px;
  z-index: 70;
  width: min(86vw, 340px);
  border-radius: var(--radius-xl);
  background: var(--glass-strong);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform: translateX(-115%);
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
}
.drawer.open { transform: translateX(0); }
.drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--glass-border);
}
.drawer__nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 16px 0;
}
.drawer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}
.drawer-item:hover {
  background: var(--primary-soft);
  color: var(--primary);
  transform: translateX(4px);
}
.drawer__foot {
  padding-top: 14px;
  border-top: 1px solid var(--glass-border);
  font-size: 12px;
  color: var(--muted);
}
.drawer__foot-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}
.drawer__foot-links a {
  font-weight: 700;
  color: var(--text-secondary);
}
.drawer__foot-links a:hover { color: var(--primary); }

/* Expandable Search Bar */
.search-sheet {
  position: sticky;
  top: 97px;
  z-index: 38;
  padding: 12px 20px;
  background: var(--glass-strong);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
}
.search-sheet__form {
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
}
.search-sheet__input {
  flex: 1;
  height: 46px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: var(--bg);
  color: var(--text);
  font-size: 15px;
  outline: none;
}
.search-sheet__input:focus { border-color: var(--primary); }
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 22px;
  height: 46px;
  border-radius: var(--radius-sm);
  border: 0;
  background: var(--primary);
  color: var(--primary-contrast);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.25);
  transition: transform 0.18s ease;
}
.btn-primary:hover { transform: translateY(-1px); }

/* Main Content Layout */
main {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Spatial Hero Bento Card */
.hero-bento {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 920px) {
  .hero-bento {
    grid-template-columns: 1.55fr 1fr;
  }
}
.stage-wrapper.mobile-frame .hero-bento {
  grid-template-columns: 1fr;
}

.hero-main-card {
  position: relative;
  border-radius: var(--radius-xl);
  padding: clamp(22px, 3.5vw, 38px);
  background: var(--glass);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
}
.hero-main-card__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(circle at 85% 20%, rgba(16, 185, 129, 0.22), transparent 55%),
              radial-gradient(circle at 15% 85%, rgba(79, 70, 229, 0.15), transparent 55%);
}
.hero-main-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.spatial-pill {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.spatial-pill__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--primary);
}
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(26px, 3.8vw, 44px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.025em;
}
.hero-desc {
  font-size: 14.5px;
  color: var(--text-secondary);
  max-width: 56ch;
}
.hero-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}
.btn-glass {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 20px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: var(--glass-strong);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-glass:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
}

.hero-stats-Side {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.stat-bento {
  border-radius: var(--radius-lg);
  padding: 20px;
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.stat-bento__tag {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--muted);
  text-transform: uppercase;
}
.stat-bento__num {
  font-family: var(--font-display);
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 800;
  color: var(--primary);
  margin: 8px 0 2px;
}
.stat-bento__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Section Headers */
.sec-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.sec-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--primary);
  display: block;
  margin-bottom: 3px;
}
.sec-title {
  font-family: var(--font-display);
  font-size: clamp(20px, 2.6vw, 28px);
  font-weight: 800;
  letter-spacing: -0.02em;
}
.sec-sub {
  font-size: 13px;
  color: var(--muted);
}

/* Category Bento Cards (5 Categories) */
.cat-bento-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.cat-bento-card:nth-child(1) {
  grid-column: 1 / -1;
}
.cat-bento-card:nth-child(2),
.cat-bento-card:nth-child(3),
.cat-bento-card:nth-child(4),
.cat-bento-card:nth-child(5) {
  grid-column: span 1;
}

.cat-bento-card {
  position: relative;
  border-radius: var(--radius-lg);
  padding: 20px;
  background: var(--glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 162px;
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s;
}
.cat-bento-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--card-grad);
  pointer-events: none;
}
.cat-bento-card:hover {
  transform: translateY(-4px);
  border-color: var(--card-accent);
}
.cat-bento-card__top, .cat-bento-card__mid, .cat-bento-card__bot {
  position: relative;
  z-index: 1;
}
.cat-bento-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.cat-icon-box {
  width: 40px; height: 40px;
  border-radius: 13px;
  background: var(--icon-bg);
  color: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 14px rgba(0,0,0,0.12);
}
.cat-badge-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
}
.cat-bento-card__mid { margin: 14px 0; }
.cat-bento-card__title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}
.cat-bento-card__sub {
  font-size: 12.5px;
  color: var(--muted);
  margin-top: 3px;
}
.cat-bento-card__bot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--glass-border);
  font-size: 12px;
  font-weight: 700;
}
.cat-bento-card__count {
  font-family: var(--font-mono);
  color: var(--muted);
}
.cat-bento-card__go {
  color: var(--card-accent);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Spatial Surface Container (Used for Language Explorer) */
.glass-panel {
  border-radius: var(--radius-xl);
  padding: clamp(18px, 3vw, 30px);
  background: var(--glass);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
}

/* Language View Mode Toggle (Squircle Bubbles vs A-Z Index) */
.view-switch {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: var(--glass-subtle);
  border: 1px solid var(--glass-border);
}
.view-switch button {
  border: 0;
  background: transparent;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
}
.view-switch button.active {
  background: var(--primary);
  color: var(--primary-contrast);
}

/* Squircle Avatar Carousel */
.squircle-row {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 8px 2px 16px;
  -webkit-overflow-scrolling: touch;
}
.squircle-item {
  flex: 0 0 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  transition: transform 0.2s;
}
.squircle-item:hover { transform: translateY(-3px); }
.squircle-avatar {
  position: relative;
  width: 66px; height: 66px;
  border-radius: 22px;
  background: var(--primary-soft);
  color: var(--primary);
  border: 2px solid var(--glass-strong);
  box-shadow: var(--shadow-sm);
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 16px;
  overflow: hidden;
}
.squircle-avatar img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.squircle-name {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
}

/* A-Z Alphabet Filter Explorer */
.az-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin: 14px 0;
  padding-top: 14px;
  border-top: 1px solid var(--glass-border);
}
.az-hero-badge {
  display: flex;
  align-items: center;
  gap: 14px;
}
.az-big-letter {
  width: 56px; height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: #fff;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 10px 24px rgba(5, 150, 105, 0.25);
}
.az-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 16px;
}
.az-btn {
  min-width: 35px; height: 35px;
  padding: 0 8px;
  border-radius: 11px;
  border: 1px solid var(--glass-border);
  background: var(--glass-strong);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
}
.az-btn:hover {
  border-color: var(--primary);
  color: var(--text);
  transform: translateY(-2px);
}
.az-btn.on {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-contrast);
  box-shadow: 0 6px 14px rgba(5, 150, 105, 0.28);
}

.lang-bento-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}
.stage-wrapper.mobile-frame .lang-bento-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.lang-bento-item a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border-radius: var(--radius-md);
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
  transition: transform 0.18s ease, border-color 0.2s ease;
}
.lang-bento-item a:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}
.lang-mono-badge {
  flex: none;
  width: 36px; height: 36px;
  border-radius: 12px;
  background: hsl(var(--hue, 160) 70% 45% / 0.15);
  color: hsl(var(--hue, 160) 75% 38%);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 800;
  display: grid;
  place-items: center;
}
html[data-mode="dark"] .lang-mono-badge {
  color: hsl(var(--hue, 160) 80% 68%);
}
.lang-bento-name {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}
.lang-bento-arrow {
  color: var(--primary);
  font-weight: 800;
}

/* Sort Chips */
.chips-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.sort-chip {
  flex: none;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass);
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.sort-chip:hover { color: var(--text); border-color: var(--primary); }
.sort-chip.on {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-contrast);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.25);
}

/* Video Bento Grid (Featured Spotlight + Cards) */
.video-bento-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .video-bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 980px) {
  .video-bento-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .video-bento-grid .vcard:first-child {
    grid-column: span 2;
    grid-row: span 2;
  }
}
.stage-wrapper.mobile-frame .video-bento-grid {
  grid-template-columns: 1fr;
}
.stage-wrapper.mobile-frame .video-bento-grid .vcard:first-child {
  grid-column: span 1;
  grid-row: span 1;
}

.vcard {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  padding: 12px;
  background: var(--glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s;
}
.vcard:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
}
.vcard__thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #1E293B, #334155);
  overflow: hidden;
}
.vcard__thumb img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}
.vcard:hover .vcard__thumb img {
  transform: scale(1.04);
}
.vcard:first-child .vcard__spotlight {
  position: absolute;
  top: 12px; left: 12px;
  z-index: 2;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-contrast);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.vcard:not(:first-child) .vcard__spotlight { display: none; }
.vcard__duration {
  position: absolute;
  right: 10px; bottom: 10px;
  padding: 3px 9px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(6px);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
}
.vcard__body {
  padding: 12px 6px 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.vcard__title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}
.vcard:first-child .vcard__title {
  font-size: clamp(18px, 2.2vw, 23px);
}
.vcard__meta-row {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--muted);
  border-top: 1px solid var(--glass-border);
}
.vcard__channel {
  color: var(--primary);
  font-weight: 700;
}

/* Region Accordion Groups */
.region-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.region-bento {
  border-radius: var(--radius-lg);
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}
.region-bento summary {
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  list-style: none;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  transition: background 0.2s ease;
}
.region-bento summary:hover {
  background: var(--primary-soft);
}
.region-bento summary::-webkit-details-marker { display: none; }
.region-bento--nasional {
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.08);
}
.region-bento--nasional summary {
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%);
}
.region-summary-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.region-arrow-icon {
  font-size: 13px;
  color: var(--primary);
  display: inline-block;
  transition: transform 0.25s ease;
}
.region-bento[open] .region-arrow-icon {
  transform: rotate(90deg);
}
.region-count-pill {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
}
.region-bento__content {
  padding: 0 20px 20px;
  border-top: 1px solid var(--glass-border);
  padding-top: 16px;
}

/* Apps Catalog Grid (269 Apps) */
.apps-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.apps-filter-input {
  flex: 1;
  min-width: 240px;
  height: 44px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: var(--glass-strong);
  color: var(--text);
  outline: none;
}
.apps-filter-input:focus { border-color: var(--primary); }
.apps-bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.app-bento-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, border-color 0.2s;
}
.app-bento-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}
.app-bento-logo {
  flex: none;
  width: 50px; height: 50px;
  border-radius: 16px;
  background: var(--primary-soft);
  color: var(--primary);
  display: grid;
  place-items: center;
  font-weight: 800;
  overflow: hidden;
  position: relative;
}
.app-bento-logo img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.app-bento-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
}
.app-bento-dl {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 13px;
  border-radius: 12px;
  background: var(--primary);
  color: var(--primary-contrast);
  font-size: 12px;
  font-weight: 700;
}
.pager-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  padding: 14px 20px;
  border-radius: var(--radius-md);
  background: var(--glass);
  border: 1px solid var(--glass-border);
  font-size: 13px;
  color: var(--muted);
}
.pager-bar select {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: var(--glass-strong);
  color: var(--text);
  font-weight: 700;
}

/* Watch Screen */
.watch-bento-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 960px) {
  .watch-bento-layout {
    grid-template-columns: minmax(0, 1.9fr) minmax(300px, 1fr);
  }
}
.stage-wrapper.mobile-frame .watch-bento-layout {
  grid-template-columns: 1fr;
}
.watch-primary-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.watch-player-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: #0F172A;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
}
.watch-player-thumb {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.watch-player-thumb img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0.78;
}
.watch-play-btn-big {
  position: relative;
  z-index: 2;
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--primary-contrast);
  display: grid;
  place-items: center;
  box-shadow: 0 16px 40px rgba(0,0,0,0.45);
  transition: transform 0.2s;
}
.watch-play-btn-big:hover { transform: scale(1.08); }

.publisher-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--glass-border);
}
.pub-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pub-avatar {
  width: 44px; height: 44px;
  border-radius: 14px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  padding: 5px;
  object-fit: contain;
}
.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 999px;
  border: 1px solid var(--danger);
  background: transparent;
  color: var(--danger);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.like-btn[aria-pressed="true"] {
  background: var(--danger);
  color: #fff;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.tag-pill {
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}

/* Forms & Captcha */
.bento-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-group span {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-secondary);
}
.field-group input, .field-group textarea {
  width: 100%;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: var(--glass-strong);
  color: var(--text);
  outline: none;
}
.field-group input:focus, .field-group textarea:focus {
  border-color: var(--primary);
}
.captcha-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.captcha-box {
  width: 126px; height: 42px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: #fff;
  overflow: hidden;
}
.captcha-box svg { width: 100%; height: 100%; display: block; }
.form-status {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  min-height: 1.3em;
}
.form-status.error { color: var(--danger); }

/* Floating Spatial Bottom Dock */
.spatial-dock {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 45;
  width: min(92vw, 430px);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 6px;
  border-radius: 999px;
  background: var(--glass-strong);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
}
.dock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 7px 4px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--muted);
  transition: all 0.2s;
}
.dock-item.active {
  background: var(--primary);
  color: var(--primary-contrast);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}
</style>
</head>
<body>
<div class="spatial-mesh" aria-hidden="true">
  <div class="mesh-blob mesh-blob--1"></div>
  <div class="mesh-blob mesh-blob--2"></div>
  <div class="mesh-blob mesh-blob--3"></div>
</div>

<div class="stage-wrapper" id="stageWrapper">
  <div class="app-container">
    <!-- Top Spatial Glass Header -->
    <header class="topbar">
      <div class="topbar__row">
        <div class="topbar__left">
          <button type="button" class="glass-icon-btn" id="menuBtn" aria-label="Buka Menu Utama">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 7h16M4 12h12M4 17h16"/></svg>
          </button>
          <button type="button" class="glass-icon-btn" id="backBtn" aria-label="Kembali" hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <a href="#home" class="brand-link" aria-label="Beranda TokoMedia">
            ${logoSvg}
            <div class="brand-link__text">
              <span class="brand-link__tag">MEDIA NUSANTARA</span>
            </div>
          </a>
        </div>

        <nav class="desktop-pills" aria-label="Navigasi Cepat">
          <a href="#home" class="dpill active" data-dpill="home">Beranda</a>
          <a href="#languages/film-riwayat-isa-al-masih" class="dpill" data-dpill="film">Film &amp; Video</a>
          <a href="#languages/app" class="dpill" data-dpill="app">269 Aplikasi</a>
          <a href="#contact" class="dpill" data-dpill="contact">Kontak Kami</a>
        </nav>

        <div class="topbar__actions">
          <button type="button" class="search-pill-btn" id="searchBtn" aria-label="Cari">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4.2-4.2"/></svg>
            <span class="search-pill-btn__label">Cari bahasa, film, kitab...</span>
            <kbd>/</kbd>
          </button>
          <button type="button" class="glass-icon-btn" id="themeBtn" title="Ganti Mode Terang / Gelap" aria-label="Ganti Tema">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </button>
        </div>
      </div>

      <!-- Breadcrumb & Viewport Tools Ribbon -->
      <div class="crumbs-ribbon">
        <nav class="crumbs-list" id="crumbs" aria-label="Breadcrumb"></nav>
        <div class="crumbs-tools">
          <button type="button" class="mini-chip-btn active" data-vp="resp" title="Tampilan Responsif Penuh">Layar Penuh</button>
          <button type="button" class="mini-chip-btn" data-vp="mobile" title="Simulasi Ukuran Layar HP 430px">Mode HP 430px</button>
        </div>
      </div>
    </header>

    <!-- Expandable Search Bar -->
    <section class="search-sheet" id="searchSheet" hidden>
      <form class="search-sheet__form" id="searchForm">
        <input type="search" class="search-sheet__input" id="searchInput" placeholder="Ketik bahasa daerah (mis. Toraja, Sunda, Batak) atau judul video..." autocomplete="off">
        <button type="submit" class="btn-primary">Cari</button>
      </form>
    </section>

    <!-- Slide-out Drawer -->
    <div class="scrim" id="scrim"></div>
    <aside class="drawer" id="drawer" aria-label="Menu Utama">
      <div>
        <div class="drawer__head">
          <div>
            <span class="sec-eyebrow">NAVIGASI UTAMA</span>
            <strong style="font-family:var(--font-display);font-size:20px">TOKO MEDIA</strong>
          </div>
          <button type="button" class="glass-icon-btn" id="closeDrawerBtn" aria-label="Tutup">&times;</button>
        </div>
        <nav class="drawer__nav" id="drawerNav"></nav>
      </div>
      <div class="drawer__foot" id="drawerFoot"></div>
    </aside>

    <!-- Main Dynamic View -->
    <main id="appMain"></main>

    <!-- Floating Spatial Bottom Dock -->
    <nav class="spatial-dock" aria-label="Navigasi Bawah">
      <a href="#home" class="dock-item active" data-dock="home">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        <span>Beranda</span>
      </a>
      <a href="#languages/film-riwayat-isa-al-masih" class="dock-item" data-dock="languages">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span>177 Bahasa</span>
      </a>
      <a href="#watch" class="dock-item" data-dock="watch">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Tonton</span>
      </a>
      <a href="#languages/app" class="dock-item" data-dock="apps">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        <span>269 Aplikasi</span>
      </a>
    </nav>
  </div>
</div>

<script>
window.TM_PAYLOAD = ${JSON.stringify(payload)};
</script>
<script>
(function () {
  var P = window.TM_PAYLOAD;
  var SITE = P.app.siteUrl;
  var CHANNEL = P.app.channel;
  var SEARCH_URL = SITE + '/search/v/';
  var appMain = document.getElementById('appMain');
  var crumbsEl = document.getElementById('crumbs');
  var backBtn = document.getElementById('backBtn');
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('scrim');
  var searchSheet = document.getElementById('searchSheet');
  var searchInput = document.getElementById('searchInput');
  var stageWrapper = document.getElementById('stageWrapper');

  var langMap = new Map();
  P.regions.forEach(function (r) {
    r.languages.forEach(function (l) {
      if (!langMap.has(l.slug)) langMap.set(l.slug, { name: l.name, slug: l.slug, region: r.name, image: '' });
    });
  });
  P.homeLanguages.forEach(function (l) {
    if (!langMap.has(l.slug)) langMap.set(l.slug, { name: l.name, slug: l.slug, region: 'Nusantara', image: l.image });
    else langMap.get(l.slug).image = l.image;
  });
  var allLanguages = Array.from(langMap.values()).sort(function (a, b) { return a.name.localeCompare(b.name); });

  var activeLetter = 'A';
  var langViewMode = 'az'; // 'az' | 'bubbles'
  var activeSort = 'trending';
  var lastCategory = 'film-riwayat-isa-al-masih';
  var lastCrumbs = [['Beranda', '#home']];
  var lastRoute = 'home';
  var watchData = P.watchExample;
  var appPage = 1;
  var appPageSize = 12;
  var appFilter = '';
  var searchToken = 0;

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function iconSvg(kind) {
    var map = {
      film: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/></svg>',
      play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>',
      clip: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><polygon points="10 9 15 12 10 15 10 9" fill="currentColor"/></svg>',
      app: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
      sparkles: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>',
      download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>'
    };
    return map[kind] || map.play;
  }

  // Populate Drawer
  (function initDrawer() {
    var navHtml = P.drawer.map(function (item) {
      var href = item.target.url ? esc(item.target.url) : (item.target.screen === 'languages' ? '#languages/' + esc(item.target.params.category) : '#' + esc(item.target.screen));
      var ext = item.target.url ? ' target="_blank" rel="noopener"' : '';
      return '<a class="drawer-item" href="' + href + '"' + ext + '><span>' + esc(item.title) + '</span><span>&rsaquo;</span></a>';
    }).join('');
    document.getElementById('drawerNav').innerHTML = navHtml;

    var footLinks = P.drawerFooter.links.map(function (l) {
      var r = l.target.screen === 'privacyWeb' ? '#privacy-web' : '#privacy-app';
      return '<a href="' + r + '">' + esc(l.title) + '</a>';
    }).join('');
    document.getElementById('drawerFoot').innerHTML =
      '<p>' + esc(P.drawerFooter.copyright) + ' <strong>' + esc(P.drawerFooter.brand) + '</strong></p>' +
      '<div class="drawer__foot-links">' + footLinks + '</div>';
  })();

  function sortVideoItems(items) {
    var list = items.slice();
    if (activeSort === 'popular') return list.sort(function (a, b) { return b.views - a.views; });
    if (activeSort === 'unviral') return list.sort(function (a, b) { return a.views - b.views; });
    if (activeSort === 'newest') return list.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    if (activeSort === 'oldest') return list.sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
    return list;
  }

  function renderVideoCardHtml(v, idx) {
    var imgUrl = v.image ? (v.image.indexOf('http') === 0 ? v.image : encodeURI(SITE + v.image)) : '';
    var hrefUrl = v.href ? (v.href.indexOf('http') === 0 ? v.href : encodeURI(SITE + v.href)) : '';
    var likesStr = v.likes ? ' &#9829; ' + v.likes : '';
    return (
      '<a class="vcard" href="#watch" data-watch="1"' +
      ' data-title="' + esc(v.title) + '"' +
      ' data-views="' + esc(v.views) + '"' +
      ' data-date-label="' + esc(v.dateLabel) + '"' +
      ' data-image="' + esc(imgUrl) + '"' +
      ' data-href="' + esc(hrefUrl) + '">' +
      '<div class="vcard__thumb">' +
      (imgUrl ? '<img src="' + esc(imgUrl) + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
      '<span class="vcard__spotlight">Sorotan Utama</span>' +
      '<span class="vcard__duration">' + esc(v.duration) + '</span>' +
      '</div>' +
      '<div class="vcard__body">' +
      '<h3 class="vcard__title">' + esc(v.title) + '</h3>' +
      '<div class="vcard__meta-row">' +
      '<span class="vcard__channel">' + esc(CHANNEL) + ' &#10004;' + likesStr + '</span>' +
      '<span>' + Number(v.views || 0).toLocaleString('en-US') + ' views &bull; ' + esc(v.dateLabel) + '</span>' +
      '</div></div></a>'
    );
  }

  function renderSortChipsHtml() {
    var opts = [
      { id: 'trending', label: 'Tren' },
      { id: 'popular', label: 'Populer' },
      { id: 'unviral', label: 'Unseen' },
      { id: 'newest', label: 'New' },
      { id: 'oldest', label: 'Old' }
    ];
    return '<div class="chips-bar" role="group">' + opts.map(function (o) {
      return '<button type="button" class="sort-chip' + (activeSort === o.id ? ' on' : '') + '" data-sort="' + o.id + '">' + esc(o.label) + '</button>';
    }).join('') + '</div>';
  }

  function renderHome() {
    var heroVideo = P.latestVideos[0];
    var heroImg = heroVideo.image ? encodeURI(SITE + heroVideo.image) : '';
    var heroHref = heroVideo.href ? encodeURI(SITE + heroVideo.href) : '';

    var catCardsHtml = P.categories.map(function (c) {
      return (
        '<a class="cat-bento-card" href="#languages/' + esc(c.id) + '" style="--card-grad:' + c.grad + ';--card-accent:' + c.accent + ';--icon-bg:' + c.iconBg + '">' +
        '<div class="cat-bento-card__top">' +
        '<span class="cat-icon-box">' + iconSvg(c.icon) + '</span>' +
        '<span class="cat-badge-tag">' + esc(c.badge) + '</span>' +
        '</div>' +
        '<div class="cat-bento-card__mid">' +
        '<h3 class="cat-bento-card__title">' + esc(c.title) + '</h3>' +
        '<p class="cat-bento-card__sub">' + esc(c.subtitle) + '</p>' +
        '</div>' +
        '<div class="cat-bento-card__bot">' +
        '<span class="cat-bento-card__count">' + esc(c.countLabel) + '</span>' +
        '<span class="cat-bento-card__go">Daftar Bahasa &rsaquo;</span>' +
        '</div></a>'
      );
    }).join('');

    var squirclesHtml = P.homeLanguages.map(function (l) {
      var img = l.image ? '<img src="' + esc(encodeURI(SITE + l.image)) + '" alt="" loading="lazy" onerror="this.remove()">' : '';
      return (
        '<a class="squircle-item" href="#videos/' + esc(l.slug) + '">' +
        '<span class="squircle-avatar">' + esc(l.name.slice(0, 2).toUpperCase()) + img + '</span>' +
        '<span class="squircle-name">' + esc(l.name) + '</span></a>'
      );
    }).join('');

    var letters = [];
    allLanguages.forEach(function (l) {
      var ch = l.name.trim().charAt(0).toUpperCase();
      if (letters.indexOf(ch) === -1) letters.push(ch);
    });
    if (letters.indexOf(activeLetter) === -1) activeLetter = letters[0] || 'A';
    var letterLangs = allLanguages.filter(function (l) { return l.name.trim().charAt(0).toUpperCase() === activeLetter; });

    var azBtns = letters.map(function (l) {
      return '<button type="button" class="az-btn' + (l === activeLetter ? ' on' : '') + '" data-letter="' + esc(l) + '">' + esc(l) + '</button>';
    }).join('');

    var azCells = letterLangs.map(function (l) {
      var ch = l.name.trim().charAt(0).toUpperCase();
      var hue = (ch.charCodeAt(0) * 37) % 360;
      return (
        '<li class="lang-bento-item" style="--hue:' + hue + '">' +
        '<a href="#videos/' + esc(l.slug) + '">' +
        '<span class="lang-mono-badge">' + esc(ch) + '</span>' +
        '<span class="lang-bento-name">' + esc(l.name) + '</span>' +
        '<span class="lang-bento-arrow">&rsaquo;</span>' +
        '</a></li>'
      );
    }).join('');

    var sortedLatest = sortVideoItems(P.latestVideos);
    var homeFeaturedVideos = sortedLatest.slice(0, 4);

    appMain.innerHTML =
      '<!-- Spatial Hero Bento -->' +
      '<section class="hero-bento">' +
      '<div class="hero-main-card">' +
      '<div class="hero-main-card__bg"></div>' +
      '<div class="hero-main-card__content">' +
      '<span class="spatial-pill"><span class="spatial-pill__dot"></span>PUSAT MEDIA NUSANTARA</span>' +
      '<h1 class="hero-title">Film, Video &amp; Aplikasi Kitab Suci Nusantara.</h1>' +
      '<p class="hero-desc">Nikmati ribuan tayangan rohani bermakna, kisah para nabi, serta aplikasi Kitab Suci Android dalam bahasa ibu dari Sabang sampai Merauke.</p>' +
      '<div class="hero-cta-row">' +
      '<a href="#watch" class="btn-primary" data-watch="1" data-title="' + esc(heroVideo.title) + '" data-views="' + esc(heroVideo.views) + '" data-date-label="' + esc(heroVideo.dateLabel) + '" data-image="' + esc(heroImg) + '" data-href="' + esc(heroHref) + '">&#9654; Tonton Tayangan Sorotan</a>' +
      '<a href="#languages/film-riwayat-isa-al-masih" class="btn-glass">Jelajahi Wilayah &rarr;</a>' +
      '</div></div></div>' +
      '<div class="hero-stats-Side">' +
      '<div class="stat-bento"><span class="stat-bento__tag">BAHASA DAERAH</span><strong class="stat-bento__num">177</strong><span class="stat-bento__label">Bahasa Suku &amp; Kepulauan</span></div>' +
      '<div class="stat-bento"><span class="stat-bento__tag">KATALOG ANDROID</span><strong class="stat-bento__num">' + P.apps.length + '</strong><span class="stat-bento__label">Aplikasi Kitab Suci</span></div>' +
      '<div class="stat-bento"><span class="stat-bento__tag">KOLEKSI MEDIA</span><strong class="stat-bento__num">5</strong><span class="stat-bento__label">Kategori Film &amp; Klip</span></div>' +
      '<div class="stat-bento"><span class="stat-bento__tag">WILAYAH BESAR</span><strong class="stat-bento__num">5</strong><span class="stat-bento__label">Sumatera hingga Papua</span></div>' +
      '</div></section>' +

      '<!-- Kategori Utama Bento -->' +
      '<section>' +
      '<div class="sec-head">' +
      '<div><span class="sec-eyebrow">01 &bull; KATEGORI UTAMA</span><h2 class="sec-title">Pilih Format Media</h2></div>' +
      '<span class="sec-sub">Ketuk kartu untuk melihat daftar bahasa per wilayah</span>' +
      '</div>' +
      '<div class="cat-bento-grid">' + catCardsHtml + '</div>' +
      '</section>' +

      '<!-- Kategori Bahasa & Format -->' +
      '<section class="glass-panel">' +
      '<div class="sec-head">' +
      '<div><span class="sec-eyebrow">02 &bull; EKSPLORASI BAHASA</span><h2 class="sec-title">Kategori Bahasa &amp; Format</h2></div>' +
      '<div class="view-switch" role="group" aria-label="Mode tampilan bahasa">' +
      '<button type="button" class="' + (langViewMode === 'az' ? 'active' : '') + '" data-lview="az">Indeks A–Z</button>' +
      '<button type="button" class="' + (langViewMode === 'bubbles' ? 'active' : '') + '" data-lview="bubbles">Galeri Ikon</button>' +
      '</div></div>' +
      (langViewMode === 'bubbles' ? '<div class="squircle-row">' + squirclesHtml + '</div>' : '') +
      (langViewMode === 'az' ? (
        '<div class="az-header">' +
        '<div class="az-hero-badge">' +
        '<span class="az-big-letter">' + esc(activeLetter) + '</span>' +
        '<div><span class="sec-eyebrow">BAHASA BERAWALAN HURUF ' + esc(activeLetter) + '</span>' +
        '<strong style="font-family:var(--font-display);font-size:18px">' + letterLangs.length + ' Bahasa Tersedia</strong></div>' +
        '</div></div>' +
        '<div class="az-rail" role="group" aria-label="Filter huruf awal">' + azBtns + '</div>' +
        '<ul class="lang-bento-grid">' + azCells + '</ul>'
      ) : '') +
      '</section>' +

      '<!-- Tayangan Pilihan Terbaru -->' +
      '<section>' +
      '<div class="sec-head">' +
      '<div><span class="sec-eyebrow">03 &bull; STREAMING TERKINI</span><h2 class="sec-title">Tayangan Pilihan Terbaru</h2></div>' +
      renderSortChipsHtml() +
      '</div>' +
      '<div class="video-bento-grid">' + homeFeaturedVideos.map(renderVideoCardHtml).join('') + '</div>' +
      '<div style="text-align:center;margin-top:20px">' +
      '<a href="#languages/film-riwayat-isa-al-masih" class="btn-glass" style="display:inline-flex;padding:12px 28px;border-radius:999px;font-weight:700">Jelajahi Semua Koleksi per Wilayah &rarr;</a>' +
      '</div>' +
      '</section>';
  }

  function renderRegions(categorySlug) {
    lastCategory = categorySlug || 'film-riwayat-isa-al-masih';
    var catObj = P.categories.find(function (c) { return c.id === lastCategory; }) || P.categories[0];
    
    // Accordion Paling Atas: Indonesia (Bahasa Nasional)
    var indHtml =
      '<details class="region-bento region-bento--nasional">' +
      '<summary><span class="region-summary-title"><span class="region-arrow-icon">&#9654;</span><strong>Indonesia</strong> <span style="font-weight:600;font-size:14px;color:var(--muted)">(Bahasa Nasional)</span></span>' +
      '<span class="region-count-pill" style="background:var(--primary);color:#fff">Utama</span></summary>' +
      '<div class="region-bento__content">' +
      '<ul class="lang-bento-grid">' +
      '<li class="lang-bento-item" style="--hue:150">' +
      '<a href="#videos/indonesia">' +
      '<span class="lang-mono-badge">ID</span>' +
      '<span class="lang-bento-name">Bahasa Indonesia</span>' +
      '<span class="lang-bento-arrow">&rsaquo;</span>' +
      '</a></li>' +
      '</ul></div>' +
      '</details>';

    // Accordion Wilayah Kepulauan Besar: Semua selalu tertutup secara default
    var regionsHtml = P.regions.map(function (r) {
      var items = r.languages.map(function (l) {
        var ch = l.name.trim().charAt(0).toUpperCase();
        var hue = (ch.charCodeAt(0) * 37) % 360;
        return (
          '<li class="lang-bento-item" style="--hue:' + hue + '">' +
          '<a href="#videos/' + esc(l.slug) + '">' +
          '<span class="lang-mono-badge">' + esc(ch) + '</span>' +
          '<span class="lang-bento-name">' + esc(l.name) + '</span>' +
          '<span class="lang-bento-arrow">&rsaquo;</span>' +
          '</a></li>'
        );
      }).join('');
      return (
        '<details class="region-bento">' +
        '<summary><span class="region-summary-title"><span class="region-arrow-icon">&#9654;</span><span>' + esc(r.name) + '</span></span>' +
        '<span class="region-count-pill">' + r.languages.length + ' Bahasa</span></summary>' +
        '<div class="region-bento__content"><ul class="lang-bento-grid">' + items + '</ul></div>' +
        '</details>'
      );
    }).join('');

    appMain.innerHTML =
      '<section class="glass-panel">' +
      '<span class="sec-eyebrow">' + esc(catObj.badge) + ' &bull; PILIH WILAYAH &amp; BAHASA</span>' +
      '<h1 class="sec-title">' + esc(catObj.title) + '</h1>' +
      '<p class="sec-sub" style="margin-top:4px">' + esc(catObj.subtitle) + ' — Pilih kepulauan atau Bahasa Nasional di bawah ini.</p>' +
      '</section>' +
      '<section class="region-stack">' + indHtml + regionsHtml + '</section>';
  }

  function renderLanguageVideos(langSlug) {
    var langObj = langMap.get(langSlug) || { name: langSlug, region: 'Nusantara' };
    var vids = P.videos.map(function (v, i) {
      var sample = P.latestVideos[i % P.latestVideos.length] || {};
      return {
        title: v.title.replace('{languageName}', langObj.name),
        duration: v.duration,
        views: v.views,
        date: v.date,
        dateLabel: v.dateLabel,
        image: sample.image || '',
        href: sample.href || ''
      };
    });
    var sorted = sortVideoItems(vids);

    appMain.innerHTML =
      '<section class="glass-panel">' +
      '<div class="sec-head">' +
      '<div><span class="sec-eyebrow">KOLEKSI BAHASA &bull; ' + esc(langObj.region) + '</span>' +
      '<h1 class="sec-title">Koleksi Media ' + esc(langObj.name) + '</h1></div>' +
      renderSortChipsHtml() +
      '</div>' +
      '<div class="video-bento-grid">' + sorted.map(renderVideoCardHtml).join('') + '</div>' +
      '</section>';
  }

  function renderApps() {
    var filtered = P.apps.filter(function (a) {
      return !appFilter || a.name.toLowerCase().indexOf(appFilter.toLowerCase()) > -1;
    });
    var pages = Math.max(1, Math.ceil(filtered.length / appPageSize));
    if (appPage > pages) appPage = 1;
    var start = (appPage - 1) * appPageSize;
    var slice = filtered.slice(start, start + appPageSize);

    var cards = slice.map(function (app) {
      var img = app.image ? '<img src="' + esc(encodeURI(SITE + app.image)) + '" alt="" loading="lazy" onerror="this.remove()">' : '';
      var init = esc(app.name.replace(/^Bahasa\s+/i, '').slice(0, 2).toUpperCase());
      return (
        '<article class="app-bento-card">' +
        '<div class="app-bento-logo"><span>' + init + '</span>' + img + '</div>' +
        '<h3 class="app-bento-name">' + esc(app.name) + ' <span style="color:var(--primary);font-size:11px">&#10004;</span></h3>' +
        '<a class="app-bento-dl" href="' + esc(app.link) + '" target="_blank" rel="noopener">' + iconSvg('download') + '<span>Unduh</span></a>' +
        '</article>'
      );
    }).join('');

    var opts = [];
    for (var i = 1; i <= pages; i++) {
      opts.push('<option value="' + i + '"' + (i === appPage ? ' selected' : '') + '>' + i + '</option>');
    }

    appMain.innerHTML =
      '<section class="glass-panel">' +
      '<span class="sec-eyebrow">KATALOG RESMI GOOGLE PLAY &bull; ' + P.apps.length + ' APLIKASI</span>' +
      '<h1 class="sec-title">Aplikasi Kitab Suci Nusantara</h1>' +
      '<div class="apps-toolbar" style="margin-top:14px">' +
      '<input type="search" id="appFilterInput" class="apps-filter-input" value="' + esc(appFilter) + '" placeholder="Filter nama bahasa aplikasi (mis. Toraja, Muna, Banjar, Sunda)...">' +
      '</div>' +
      '<div class="apps-bento-grid">' + (cards || '<p class="sec-sub">Tidak ada aplikasi yang cocok dengan pencarian.</p>') + '</div>' +
      '<div class="pager-bar">' +
      '<span>Konten : <b>' + (filtered.length ? start + 1 : 0) + '</b> - <b>' + Math.min(start + appPageSize, filtered.length) + '</b> dari total <b>' + filtered.length + '</b> Data.</span>' +
      '<label>Halaman: <select id="appPageSelect">' + opts.join('') + '</select> dari ' + pages + '</label>' +
      '</div></section>';

    var filterEl = document.getElementById('appFilterInput');
    if (filterEl) {
      filterEl.addEventListener('input', function () {
        appFilter = filterEl.value;
        appPage = 1;
        renderApps();
        var nextEl = document.getElementById('appFilterInput');
        if (nextEl) {
          nextEl.focus();
          nextEl.setSelectionRange(nextEl.value.length, nextEl.value.length);
        }
      });
    }
    var selEl = document.getElementById('appPageSelect');
    if (selEl) {
      selEl.addEventListener('change', function () {
        appPage = Number(selEl.value) || 1;
        renderApps();
      });
    }
  }

  function renderWatch() {
    var v = watchData || P.watchExample;
    var imgUrl = v.image ? (v.image.indexOf('http') === 0 ? v.image : encodeURI(SITE + v.image)) : '';
    var webHref = v.href ? (v.href.indexOf('http') === 0 ? v.href : encodeURI(SITE + v.href)) : SITE;
    var tags = (v.tags && v.tags.length ? v.tags : P.watchExample.tags) || [];
    var related = P.latestVideos.slice(0, 4);

    appMain.innerHTML =
      '<div class="watch-bento-layout">' +
      '<div class="watch-primary-col">' +
      '<div class="watch-player-card">' +
      '<a class="watch-player-thumb" href="' + esc(webHref) + '" target="_blank" rel="noopener" aria-label="Tonton di website">' +
      (imgUrl ? '<img src="' + esc(imgUrl) + '" alt="" onerror="this.remove()">' : '') +
      '<span class="watch-play-btn-big"><svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg></span>' +
      '</a></div>' +

      '<section class="glass-panel">' +
      '<span class="sec-eyebrow">' + esc(v.category || P.watchExample.category) + '</span>' +
      '<h1 class="sec-title">' + esc(v.title) + '</h1>' +
      '<p class="sec-sub" style="margin-top:4px">Dilihat ' + Number(v.views || 0).toLocaleString('en-US') + ' kali</p>' +
      '<div class="publisher-bar">' +
      '<div class="pub-left">' +
      '<img src="' + P.logoSrc + '" alt="" class="pub-avatar">' +
      '<div><strong style="color:var(--primary)">' + esc(CHANNEL) + ' &#10004;</strong>' +
      '<div class="sec-sub">Publikasi ' + esc(v.dateLabel || P.watchExample.dateLabel) + '</div></div>' +
      '</div>' +
      '<button type="button" class="like-btn" aria-pressed="false">&#9829; Suka</button>' +
      '</div></section>' +

      '<section class="glass-panel">' +
      '<h2 class="sec-title" style="font-size:18px;margin-bottom:8px">Deskripsi &amp; Tag</h2>' +
      '<p style="font-size:14px;white-space:pre-line;color:var(--text-secondary)">' + esc(v.description || P.watchExample.description) + '</p>' +
      '<div class="tag-list">' + tags.map(function (t) { return '<span class="tag-pill">#' + esc(t) + '</span>'; }).join('') + '</div>' +
      '</section>' +

      '<section class="glass-panel">' +
      '<h2 class="sec-title" style="font-size:18px">Tanggapan Anda</h2>' +
      '<form class="bento-form comment-form">' +
      '<label class="field-group"><span>Nama Anda</span><input type="text" name="name" placeholder="Ketik nama lengkap Anda" required></label>' +
      '<label class="field-group"><span>Email</span><input type="email" name="email" placeholder="Isi alamat email Anda" required></label>' +
      '<label class="field-group"><span>Nomor HP</span><input type="tel" name="phone" placeholder="+62 xxxxxxxxxx"></label>' +
      '<label class="field-group"><span>Tanggapan setelah melihat klip ini</span><textarea name="message" rows="4" placeholder="Isi ulasan/komentar/tanggapan Anda" required></textarea></label>' +
      '<div class="field-group"><span>Lengkapi Kode Validasi dibawah ini:</span>' +
      '<div class="captcha-row"><span class="captcha-box captcha" aria-hidden="true"></span>' +
      '<button type="button" class="glass-icon-btn captcha-refresh" title="Muat ulang kode">&#8635;</button>' +
      '<input type="text" name="captcha" placeholder="Kode" required style="flex:1;min-width:110px"></div></div>' +
      '<p class="form-status" role="status"></p>' +
      '<button type="submit" class="btn-primary">KIRIM TANGGAPAN</button>' +
      '</form></section>' +
      '</div>' +

      '<aside style="display:flex;flex-direction:column;gap:14px">' +
      '<h2 class="sec-title" style="font-size:19px">Tayangan Lainnya</h2>' +
      related.map(renderVideoCardHtml).join('') +
      '</aside>' +
      '</div>';

    initCaptchas();
  }

  function renderContact() {
    var c = P.contactScreen;
    var fieldsHtml = c.fields.map(function (f) {
      var ctrl = f.type === 'textarea'
        ? '<textarea name="' + esc(f.name) + '" rows="5" placeholder="' + esc(f.placeholder) + '"' + (f.required ? ' required' : '') + '></textarea>'
        : '<input type="' + esc(f.type) + '" name="' + esc(f.name) + '" placeholder="' + esc(f.placeholder) + '"' + (f.required ? ' required' : '') + '>';
      return '<label class="field-group"><span>' + esc(f.label) + '</span>' + ctrl + '</label>';
    }).join('');

    appMain.innerHTML =
      '<section class="glass-panel" style="max-width:740px;margin:0 auto;width:100%">' +
      '<span class="sec-eyebrow">HUBUNGI KAMI</span>' +
      '<h1 class="sec-title">' + esc(c.title) + '</h1>' +
      '<p class="sec-sub" style="margin:6px 0 16px">' + esc(c.intro) + '</p>' +
      '<form class="bento-form comment-form">' +
      fieldsHtml +
      '<div class="field-group"><span>' + esc(c.captchaLabel) + '</span>' +
      '<div class="captcha-row"><span class="captcha-box captcha" aria-hidden="true"></span>' +
      '<button type="button" class="glass-icon-btn captcha-refresh" title="Muat ulang kode">&#8635;</button>' +
      '<input type="text" name="captcha" placeholder="Ketik kode" required style="flex:1;min-width:110px"></div></div>' +
      '<p class="form-status" role="status"></p>' +
      '<button type="submit" class="btn-primary">' + esc(c.submit) + '</button>' +
      '</form></section>';

    initCaptchas();
  }

  function renderLegal(sourceKey, title) {
    var blocks = P[sourceKey].blocks || [];
    var html = '';
    var inList = false;
    blocks.forEach(function (entry) {
      var kind = entry[0], text = entry[1];
      if (kind === 'li') {
        if (!inList) html += '<ol style="padding-left:22px;margin-bottom:12px">';
        inList = true;
        html += '<li style="margin-bottom:6px;color:var(--text-secondary)">' + esc(text) + '</li>';
        return;
      }
      if (inList) { html += '</ol>'; inList = false; }
      if (kind === 'h') html += '<h3 style="font-family:var(--font-display);font-size:17px;margin:18px 0 6px">' + esc(text) + '</h3>';
      else html += '<p style="margin-bottom:10px;color:var(--text-secondary);font-size:14px">' + esc(text) + '</p>';
    });
    if (inList) html += '</ol>';

    appMain.innerHTML =
      '<section class="glass-panel">' +
      '<span class="sec-eyebrow">DOKUMEN RESMI</span>' +
      '<h1 class="sec-title" style="margin-bottom:12px">' + esc(title) + '</h1>' +
      html +
      '</section>';
  }

  function parseWebsiteSearchHtml(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return Array.prototype.map.call(doc.querySelectorAll('.video-card'), function (card) {
      var link = card.querySelector('.play-icon') || card.querySelector('a');
      var img = card.querySelector('img');
      var time = card.querySelector('.time');
      var title = card.querySelector('.video-title');
      var view = card.querySelector('.video-view');
      var text = view ? view.textContent : '';
      var views = ((text.match(/Dilihat\s*([\d.,]+)/i) || text.match(/([\d.,]+)\s*views/i) || [])[1]) || '0';
      var date = (text.match(/\d{2} [A-Za-z]{3} \d{2}/) || [])[0] || '';
      return {
        href: link ? link.getAttribute('href') : '',
        image: img ? img.getAttribute('src') : '',
        title: title ? title.textContent.trim() : '',
        duration: time ? time.textContent.trim() : '',
        views: Number(views.replace(/\D/g, '') || 0),
        dateLabel: date
      };
    });
  }

  function renderSearch(query) {
    var q = (query || '').trim();
    var qLower = q.toLowerCase();
    var localLangs = allLanguages.filter(function (l) { return qLower && l.name.toLowerCase().indexOf(qLower) > -1; });
    var localVids = P.latestVideos.filter(function (v) { return qLower && v.title.toLowerCase().indexOf(qLower) > -1; });

    var langHtml = localLangs.length ? (
      '<div style="margin-top:16px"><h3 class="sec-title" style="font-size:17px;margin-bottom:10px">Bahasa Daerah Cocok (' + localLangs.length + ')</h3>' +
      '<ul class="lang-bento-grid">' + localLangs.map(function (l) {
        var ch = l.name.charAt(0).toUpperCase();
        return '<li class="lang-bento-item"><a href="#videos/' + esc(l.slug) + '"><span class="lang-mono-badge">' + esc(ch) + '</span><span class="lang-bento-name">' + esc(l.name) + '</span><span class="lang-bento-arrow">&rsaquo;</span></a></li>';
      }).join('') + '</ul></div>'
    ) : '';

    appMain.innerHTML =
      '<section class="glass-panel">' +
      '<span class="sec-eyebrow">PENCARIAN PINTAR</span>' +
      '<h1 class="sec-title">' + (q ? 'Hasil pencarian untuk \u201C' + esc(q) + '\u201D' : 'Pencarian') + '</h1>' +
      '<p class="sec-sub" id="searchStatus" style="margin-top:4px">' + (q ? 'Mencari di katalog lokal &amp; server...' : 'Ketik kata kunci pada kotak pencarian di atas.') + '</p>' +
      (q ? '<p style="margin-top:6px"><a href="' + esc(SEARCH_URL + encodeURIComponent(q)) + '" target="_blank" rel="noopener" style="color:var(--primary);font-weight:700;font-size:13px">Lihat semua hasil di website resmi &#8599;</a></p>' : '') +
      langHtml +
      '</section>' +
      '<section class="video-bento-grid" id="searchResultsGrid">' +
      localVids.map(renderVideoCardHtml).join('') +
      '</section>';

    if (!q) return;
    var token = ++searchToken;
    fetch(SEARCH_URL + encodeURIComponent(q))
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        if (token !== searchToken) return;
        var remoteItems = parseWebsiteSearchHtml(html);
        var grid = document.getElementById('searchResultsGrid');
        var status = document.getElementById('searchStatus');
        if (remoteItems.length && grid) {
          grid.innerHTML = remoteItems.map(renderVideoCardHtml).join('');
        }
        if (status) {
          var totalCount = remoteItems.length || localVids.length;
          status.textContent = totalCount ? (totalCount + ' video & ' + localLangs.length + ' bahasa ditemukan') : 'Tidak ada video ditemukan untuk \u201C' + q + '\u201D';
        }
      })
      .catch(function () {
        if (token !== searchToken) return;
        var status = document.getElementById('searchStatus');
        if (status) {
          status.textContent = 'Menampilkan ' + localVids.length + ' video lokal & ' + localLangs.length + ' bahasa daerah.';
        }
      });
  }

  var CAPTCHA_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  function rnd(min, max) { return Math.floor(min + Math.random() * (max - min + 1)); }
  function drawCaptcha(box) {
    var code = '';
    for (var i = 0; i < 4; i++) code += CAPTCHA_CHARS.charAt(rnd(0, CAPTCHA_CHARS.length - 1));
    var svg = '<svg viewBox="0 0 120 40" aria-hidden="true">';
    for (var n = 0; n < 4; n++) {
      svg += '<line x1="' + rnd(0, 120) + '" y1="' + rnd(0, 40) + '" x2="' + rnd(0, 120) + '" y2="' + rnd(0, 40) + '" stroke="#94A3B8"/>';
    }
    for (var j = 0; j < code.length; j++) {
      var x = 10 + j * 27;
      svg += '<text x="' + x + '" y="' + rnd(24, 30) + '" transform="rotate(' + rnd(-18, 18) + ' ' + x + ' 25)" font-family="Arial,sans-serif" font-size="' + rnd(20, 24) + '" font-weight="700" fill="#0F172A">' + code.charAt(j) + '</text>';
    }
    box.innerHTML = svg + '</svg>';
    box.dataset.code = code;
  }
  function initCaptchas() {
    document.querySelectorAll('.captcha').forEach(drawCaptcha);
  }

  function renderCrumbs(key, current) {
    var catTitles = {};
    P.categories.forEach(function (c) { catTitles[c.id] = c.title; });
    var items;
    if (key === 'home') {
      items = [['Beranda', null]];
    } else if (key.indexOf('languages/') === 0) {
      var cat = current.slice('languages/'.length);
      lastCategory = cat;
      items = [
        ['Beranda', '#home'],
        [catTitles[cat] || cat, '#languages/' + cat],
        [cat === 'app' ? 'Daftar Aplikasi' : 'Daftar Bahasa', null]
      ];
    } else if (key.indexOf('videos/') === 0) {
      var langSlug = current.slice('videos/'.length);
      var lObj = langMap.get(langSlug);
      items = [
        ['Beranda', '#home'],
        [catTitles[lastCategory] || lastCategory, '#languages/' + lastCategory],
        ['Daftar Bahasa', '#languages/' + lastCategory],
        [lObj ? lObj.name : langSlug, null]
      ];
    } else if (key === 'contact') {
      items = [['Beranda', '#home'], ['Kontak Kami', null]];
    } else if (key === 'privacy-web') {
      items = [['Beranda', '#home'], ['Kebijakan Privasi Situs', null]];
    } else if (key === 'privacy-app') {
      items = [['Beranda', '#home'], ['Kebijakan Privasi Aplikasi', null]];
    } else if (key === 'watch') {
      var origin = lastCrumbs[lastCrumbs.length - 1];
      items = lastCrumbs.slice(0, -1).concat([[origin[0], '#' + lastRoute], ['Detail Video', null]]);
    } else {
      var q = current === 'search' ? '' : current.slice('search/'.length);
      items = [['Beranda', '#home'], ['Pencarian \u201C' + q + '\u201D', null]];
    }
    if (key !== 'watch') {
      lastCrumbs = items;
      lastRoute = current;
    }
    crumbsEl.innerHTML = items.map(function (it, idx) {
      var sep = idx > 0 ? '<span class="crumb-sep">&rsaquo;</span>' : '';
      var node = it[1] ? '<a class="crumb-a" href="' + esc(it[1]) + '">' + esc(it[0]) + '</a>' : '<span class="crumb-now">' + esc(it[0]) + '</span>';
      return sep + node;
    }).join('');
  }

  function showRoute() {
    var current = decodeURIComponent(location.hash.replace(/^#/, '')) || 'home';
    var key = (current === 'search' || current.indexOf('search/') === 0) ? 'search' : current;

    drawer.classList.remove('open');
    scrim.classList.remove('open');
    searchSheet.hidden = true;
    backBtn.hidden = (key === 'home');
    window.scrollTo(0, 0);
    renderCrumbs(key, current);

    // Sync nav highlights
    document.querySelectorAll('.dock-item').forEach(function (el) {
      var d = el.dataset.dock;
      var on = (d === 'home' && key === 'home') ||
               (d === 'languages' && ((key.indexOf('languages/') === 0 && key !== 'languages/app') || key.indexOf('videos/') === 0)) ||
               (d === 'watch' && key === 'watch') ||
               (d === 'apps' && key === 'languages/app');
      el.classList.toggle('active', on);
    });
    document.querySelectorAll('.dpill').forEach(function (el) {
      var d = el.dataset.dpill;
      var on = (d === 'home' && key === 'home') ||
               (d === 'film' && ((key.indexOf('languages/') === 0 && key !== 'languages/app') || key.indexOf('videos/') === 0)) ||
               (d === 'app' && key === 'languages/app') ||
               (d === 'contact' && key === 'contact');
      el.classList.toggle('active', on);
    });

    if (key === 'home') renderHome();
    else if (key === 'languages/app') renderApps();
    else if (key.indexOf('languages/') === 0) renderRegions(current.slice('languages/'.length));
    else if (key.indexOf('videos/') === 0) renderLanguageVideos(current.slice('videos/'.length));
    else if (key === 'watch') renderWatch();
    else if (key === 'contact') renderContact();
    else if (key === 'privacy-web') renderLegal('privacyWeb', 'Kebijakan Privasi Situs');
    else if (key === 'privacy-app') renderLegal('privacyApp', 'Kebijakan Privasi Aplikasi');
    else if (key === 'search') renderSearch(current === 'search' ? '' : current.slice('search/'.length));
    else {
      location.replace('#home');
    }
  }

  document.addEventListener('click', function (e) {
    var watchCard = e.target.closest('[data-watch]');
    if (watchCard) {
      watchData = {
        title: watchCard.dataset.title || '',
        views: Number(watchCard.dataset.views || 0),
        dateLabel: watchCard.dataset.dateLabel || '',
        image: watchCard.dataset.image || '',
        href: watchCard.dataset.href || '',
        category: P.watchExample.category,
        description: P.watchExample.description,
        tags: P.watchExample.tags
      };
      return;
    }

    var letterBtn = e.target.closest('[data-letter]');
    if (letterBtn) {
      activeLetter = letterBtn.dataset.letter;
      renderHome();
      return;
    }

    var lviewBtn = e.target.closest('[data-lview]');
    if (lviewBtn) {
      langViewMode = lviewBtn.dataset.lview;
      renderHome();
      return;
    }

    var sortBtn = e.target.closest('[data-sort]');
    if (sortBtn) {
      activeSort = sortBtn.dataset.sort;
      showRoute();
      return;
    }

    var likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
      likeBtn.setAttribute('aria-pressed', String(likeBtn.getAttribute('aria-pressed') !== 'true'));
      return;
    }

    var refreshBtn = e.target.closest('.captcha-refresh');
    if (refreshBtn) {
      var row = refreshBtn.parentNode;
      drawCaptcha(row.querySelector('.captcha'));
      row.querySelector('input').value = '';
      return;
    }

    var vpBtn = e.target.closest('[data-vp]');
    if (vpBtn) {
      document.querySelectorAll('[data-vp]').forEach(function (b) { b.classList.toggle('active', b === vpBtn); });
      stageWrapper.classList.toggle('mobile-frame', vpBtn.dataset.vp === 'mobile');
      return;
    }
  });

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.classList.contains('comment-form')) return;
    e.preventDefault();
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

  document.getElementById('menuBtn').addEventListener('click', function () {
    drawer.classList.toggle('open');
    scrim.classList.toggle('open');
  });
  document.getElementById('closeDrawerBtn').addEventListener('click', function () {
    drawer.classList.remove('open');
    scrim.classList.remove('open');
  });
  scrim.addEventListener('click', function () {
    drawer.classList.remove('open');
    scrim.classList.remove('open');
  });
  backBtn.addEventListener('click', function () {
    if (history.length > 1) history.back();
    else location.hash = '#home';
  });

  document.getElementById('searchBtn').addEventListener('click', function () {
    searchSheet.hidden = !searchSheet.hidden;
    if (!searchSheet.hidden) searchInput.focus();
  });
  document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = searchInput.value.trim();
    if (!q) return;
    var target = '#search/' + encodeURIComponent(q);
    searchSheet.hidden = true;
    if (location.hash === target) showRoute();
    else location.hash = target;
  });

  document.getElementById('themeBtn').addEventListener('click', function () {
    var htmlEl = document.documentElement;
    var next = htmlEl.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-mode', next);
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchInput && ['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) === -1) {
      e.preventDefault();
      searchSheet.hidden = false;
      searchInput.focus();
    }
  });

  window.addEventListener('hashchange', showRoute);
  showRoute();
})();
</script>
</body>
</html>`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log('Built standalone Spatial Bento app:', outputPath, (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB');
