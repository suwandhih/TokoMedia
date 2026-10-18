# TokoMedia — Spatial Glass & Bento Edition

Aplikasi katalog media & Kitab Suci multi-bahasa daerah Nusantara berbasis arsitektur **Spatial Bento & Liquid Glass UI**.

🌐 **Live Demo (GitHub Pages):** [https://suwandhih.github.io/TokoMedia/](https://suwandhih.github.io/TokoMedia/)

---

## ✨ Fitur Utama

- **Spatial Bento Grid**: Tampilan kartu kaca modern bergaya glassmorphism dengan *subtle ambient mesh gradient*.
- **Bahasa Nasional & 177 Bahasa Daerah**: 
  - Kategori **Indonesia (Bahasa Nasional)** di urutan pertama.
  - Accordion kepulauan besar (*Sumatera, Jawa, Bali, Nusa Tenggara, Kalimantan, Sulawesi, Maluku, Papua*) yang tertutup rapi secara default.
- **5 Kategori Media Utama**: Feature Film Isa Al-Masih, Video Kitab Suci, Clip Hikmat, Film Seri Ikatan Ilahi, dan Aplikasi Android.
- **Katalog 269 Aplikasi Android**: Dilengkapi pencarian instan dan pagination per halaman.
- **Mode Responsive & Frame HP**: Toggle mode pratinjau mobile 430px langsung di desktop.
- **Light & Dark Mode**: Skema warna adaptif dengan kontras tinggi dan efek blur.
- **Zero Runtime Dependencies**: Satu berkas `index.html` mandiri yang cepat dimuat langsung di browser atau GitHub Pages.

---

## 🚀 Menjalankan Secara Lokal

Cukup buka berkas `index.html` di browser web modern mana pun:

\`\`\`bash
# Atau jalankan server lokal jika diinginkan
npx serve .
\`\`\`

Untuk melakukan kompilasi ulang antarmuka dari data `TokoMediaUI/ui.json`:
\`\`\`bash
cd TokoMediaUI/spatial-bento-app
node build-bento.js
\`\`\`
Lalu perbarui berkas root `index.html`.
