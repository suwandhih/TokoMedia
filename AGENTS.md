# 🧠 AGENTS.md — Aturan Kerja TokoMedia

> **Untuk siapa:** **AI** yang mengerjakan proyek TokoMedia. **WAJIB dibaca setiap sesi sebelum kerja.**
> **Dibuat:** 18 Oktober 2026
> **Diperbarui:** 27 Oktober 2026
> **Repositori GitHub:** [https://github.com/suwandhih/TokoMedia](https://github.com/suwandhih/TokoMedia)
> **Live Site (GitHub Pages):** [https://suwandhih.github.io/TokoMedia/](https://suwandhih.github.io/TokoMedia/)

---

## 🔴 ATURAN PALING UTAMA & ANTI-LOOPING (Wajib Dipatuhi)

> ⚡ **1. JANGAN mulai apa pun tanpa aba-aba dari Bapak.**  
> ⚡ **2. BACA ULANG berkas ini SETIAP SESI** — bukan asumsi, bukan menebak-nebak.  
> ⚡ **3. ESTIMASI WAKTU JELAS & TEGAS:**
>    - Beri tahu berapa lama waktu yang diperlukan sebelum mulai pengerjaan (misal: "±2 menit").
>    - Jika waktu berjalan sudah tidak sesuai estimasi, **SEGERA HENTIKAN**, jangan diam atau lanjut terus.
> ⚡ **4. ATURAN ANTI-LOOPING & GANTI CARA:**
>    - Jika ada kendala/error, **DILARANG KERAS mengulangi cara/tindakan yang sama berkali-kali**.
>    - Segera **ganti pendekatan/metode kerja**, atau **hentikan dan laporkan solusinya kepada Bapak**.
> ⚡ **5. JANGAN tinggalkan sampah di script.** Kode tak terpakai wajib dihapus bersih.  
> ⚡ **6. CATAT SEMUA PEKERJAAN di `rencanakerja.md`** — selesai maupun baru. Jangan andalkan riwayat chat.

---

## A. Aturan tentang CARA KERJA AI

| # | Aturan |
|---|--------|
| **A1** | Baca `AGENTS.md` dulu setiap mulai sesi. |
| **A2** | **Jangan mulai apa pun tanpa aba-aba Bapak.** |
| **A3** | **WAJIB sebut estimasi waktu** sebelum mulai ("±2 menit", "±5 menit"). Lebih lama → **kabari**, jangan diam. |
| **A4** | Kalau ragu memahami maksud instruksi/chat → **TANYA dulu secara terstruktur**, jangan berasumsi atau menebak. |
| **A5** | **Perbaikan error = langsung kerjakan**, tetap backup dulu bila diperlukan. |
| **A6** | **Tiap selesai satu butir → uji & lapor ke Bapak** sebelum melanjutkan hal lain. |
| **A7** | **WAJIB selalu commit & push ke GitHub** setiap selesai merevisi dan menguji. |
| **A8** | **WAJIB catat semua pekerjaan di `rencanakerja.md`** — pekerjaan selesai tetap dicatat dengan status `✅ SELESAI` + tanggal; pekerjaan baru langsung dicatat di bagian **TAHAP BARU**. Tujuannya agar tidak perlu membaca ulang percakapan chat. |

---

## B. Aturan tentang UJI / DEBUGGING ⏱️

> *"Saya tidak mau menunggu lama tanpa kejelasan. Jika cek waktu sudah tidak sesuai, hentikan atau ganti cara."*

| # | Aturan |
|---|--------|
| **B1** | **WAJIB uji sendiri dulu** sebelum meminta Bapak mengetes. |
| **B2** | **Uji HANYA pada bagian yang direvisi** — bukan seluruh sistem/aplikasi. |
| **B3** | **Uji bermasalah & lama → jangan ulangi cara yang sama.** Ganti pendekatan baru atau hentikan. |
| **B4** | **Lapor hasil konkret**: bagian apa yang diubah, hasil uji tampilan/fungsi, dan status push ke GitHub. |
| **B5** | **Uji Responsive (PC & HP).** Jika menyentuh header atau tampilan utama, pastikan tidak terpotong di kedua mode. |

---

## C. Aturan tentang KODE & KEBERSIHAN SCRIPT

| # | Aturan |
|---|--------|
| **C1** | ❌ **DILARANG** meninggalkan kode coba-coba atau kode lama yang tidak terpakai di script. |
| **C2** | Seluruh aset logo, CSS, dan logika JavaScript harus bersih, ringkas, dan berfungsi langsung. |
| **C3** | Tidak boleh ada file sampah atau file sementara yang tertinggal setelah tugas selesai. |
| **C4** | ❌ **DILARANG menyusun logo/brand dari potongan `Text` + ikon.** Pakai **satu berkas gambar utuh** agar proporsi pasti sama dan tidak terpengaruh skala font HP. |

---

## D. Identitas & Standar TokoMedia

| Item | Standar |
|---|---|
| **Logo Resmi** | Mengikuti desain resmi `tokomedia.org`: Ikon toko hijau (pin lokasi merah) + T O K + Play hijau (O) + M E D + Pause hijau (I) + A. |
| **Berkas Logo** | **Satu gambar utuh** `TokoMediaAndroid/app/src/main/res/drawable/ic_tm_brand.png` (1162×308, transparan) untuk header; sumber komposisi `TokoMediaAndroid/logo-preview.png`. Ikon saja: `ic_tm_logo.png`. |
| **Tagline Resmi** | **`MEDIA NUSANTARA`** sudah menyatu di dalam gambar logo, sejajar di bawah wordmark. |
| **Kategori Bahasa Teratas** | **`Indonesia (Bahasa Nasional)`** selalu tampil di urutan paling atas halaman kategori/wilayah. |
| **Accordion Kepulauan** | Seluruh accordion kepulauan default-nya **tertutup rapi (collapsed)**. |
| **GitHub Pages** | Branch `main` dengan root path `/` di [https://suwandhih.github.io/TokoMedia/](https://suwandhih.github.io/TokoMedia/). |
| **API aktif** | `https://suwandhih.my.id/index.php/api` |
| **Bridge publik** | `https://suwandhih.my.id/tm-bridge.php`; token tetap di server |
| **Panduan ulang** | `prompt.md` untuk membangun UI yang sama |
| **Peta koneksi** | `datapemetaan.md` untuk aplikasi lain |
| **CMS demo hero** | `https://suwandhih.my.id/cms_tokomedia.html` mengelola isi Pusat Media Nusantara; endpoint data `https://suwandhih.my.id/cms_tokomedia_api.php` |
| **APK Android** | `TokoMediaAndroid/TokoMedia-debug.apk` (tidak masuk Git — diabaikan `.gitignore`) |
| **Responsif Android** | Batas skala font `MAX_FONT_SCALE = 1.3f` (`Theme.kt`); rasio logo `BRAND_LOGO_ASPECT` (`Theme.kt`). Wajib diuji di 320dp & 430dp. |

---

## E. Koneksi yang Sudah Terbukti (21–22 Okt 2026)

- UI GitHub Pages & Aplikasi Android memanggil bridge `https://suwandhih.my.id/tm-bridge.php`, bukan API live `tokomedia.org:8009`.
- Pengunjung tidak diminta token; token diinjeksi aman di sisi server bridge.
- Slug bahasa dikirim dalam bentuk segmen terakhir, contoh `musi-palembang`.
- Video diputar langsung dari playlist streaming HLS (.m3u8 Wowza) dari field `source`, baik di web maupun di Android (ExoPlayer).
- Tampilan Android Native 100% presisi mengikuti Spatial Bento `index.html` (Mode HP 430px) sesuai persetujuan client.
- Layar detail video di Android menerapkan pemutar video freeze (sticky) di posisi atas, sehingga area deskripsi, form tanggapan, dan tayangan lainnya dapat di-scroll bebas di bawahnya.
- Jangan ulangi uji lewat `file://`; origin `null` memang ditolak CORS.
- Jangan tulis token atau password di Git, dokumentasi, atau riwayat pekerjaan.
- CMS demo saat ini tanpa login sesuai persetujuan client; jangan menambahkan kredensial ke repository. Jika dipakai produksi, wajib tambahkan autentikasi server-side.
- File CMS yang berjalan di Rumahweb berada berdampingan dengan API di `/home/suwj4466/public_html/`: `cms_tokomedia.html`, `cms_tokomedia_api.php`, dan `cms_tokomedia_data.json`.

---

## F. Pelajaran Android Native (27 Okt 2026) — Jangan Diulang

| # | Pelajaran | Aturan turunan |
|---|---|---|
| **F1** | Logo yang disusun dari potongan `Text` + ikon **selalu rapuh**: lebar `Text` ikut skala font HP, ikon/spasi tetap dp → rumus selalu salah. | Pakai **satu gambar utuh** (C4). |
| **F2** | Ukuran tetap (`height(56.dp)`, `Row` tanpa `weight`) menyebabkan tumpang tindih di layar sempit / font besar. | Pakai `weight`, `heightIn(min)`, `maxLines`, dan `BoxWithConstraints`. |
| **F3** | Menguji banyak kombinasi (3 lebar × 3 skala font) memakan waktu lama dan emulator bisa macet. | **Uji hanya bagian yang direvisi**, di **1–2 kondisi ekstrem** (mis. 320dp + font 2.0). |
| **F4** | Emulator `Pixel_7` pernah macet di package manager saat install. | Ganti AVD (mis. `uji-alkitab`) atau reboot; **jangan ulangi install yang sama berkali-kali**. |
| **F5** | Emulator crash `SIGILL` di `libhwui` bila memakai GPU host. | Jalankan emulator dengan `-gpu swiftshader_indirect`. |
| **F6** | Uji lewat `file://` selalu gagal karena origin `null` ditolak CORS. | Uji lewat `http://`/`https://` atau langsung di APK. |
