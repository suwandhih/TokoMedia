# prompt.md — Bangun Ulang UI TokoMedia

> Untuk AI lain. Baca `AGENTS.md` dan `datapemetaan.md` sebelum mengubah kode.
> Jangan tulis token, password, atau isi `secrets.local.php` ke Git.
> **Diperbarui:** 27 Oktober 2026 — mencakup Web UI (GitHub Pages) **dan** Android Native.

## Hasil yang harus sama

Buat satu halaman `index.html` di GitHub Pages yang menampilkan data yang sama dengan situs TokoMedia:

- Beranda, kategori, wilayah, bahasa, daftar video, detail video, aplikasi, pencarian, dan kontak.
- Logo resmi dan tagline `MEDIA NUSANTARA`.
- `Indonesia (Bahasa Nasional)` selalu di urutan atas.
- Accordion kepulauan tertutup saat pertama dibuka.
- Pengunjung tidak diminta token.
- Video diputar di halaman GitHub, tidak membuka `tokomedia.org`.

Alamat live: `https://suwandhih.github.io/TokoMedia/`

## Logo & tagline (WAJIB satu gambar)

Logo **tidak boleh** disusun dari potongan `Text` + ikon. Lebar `Text` ikut skala font HP sedangkan ikon dan spasi tetap dp, sehingga rumus ukuran selalu salah dan logo tampak tidak proporsional.

| Item | Berkas | Ukuran |
|---|---|---|
| Logo lengkap (ikon + `TOK▶MED‖A` + tagline) | `TokoMediaAndroid/app/src/main/res/drawable/ic_tm_brand.png` | 1162×308, transparan |
| Sumber komposisi | `TokoMediaAndroid/logo-preview.png` | 1162×308 |
| Ikon saja (avatar kanal, ikon peluncur) | `res/drawable/ic_tm_logo.png`, `res/mipmap-*/ic_launcher.png` | 256×256 |

Cara pakai di Compose: patok **tinggi**, lebar mengikuti rasio `BRAND_LOGO_ASPECT` (`Theme.kt` = 1162/308).

```kotlin
val logoHeight = minOf(
    if (maxWidth < 360.dp) 30.dp else 36.dp,
    maxWidth / BRAND_LOGO_ASPECT
)
Image(
    painter = painterResource(R.drawable.ic_tm_brand),
    contentDescription = "TokoMedia — Media Nusantara",
    modifier = Modifier.height(logoHeight).width(logoHeight * BRAND_LOGO_ASPECT)
)
```

Efeknya: proporsi selalu sama di semua ukuran layar, **tidak terpengaruh pengaturan ukuran huruf HP**, dan tidak ada rumus yang bisa salah.

## Arsitektur yang wajib dipakai

```text
GitHub Pages index.html
        | POST path + parameter
        v
https://suwandhih.my.id/tm-bridge.php
        | tambah token di server
        v
https://suwandhih.my.id/index.php/api/{endpoint}
        |
        v
MySQL TokoMedia
```

Jangan panggil API live `tokomedia.org:8009`. Client meminta salinan API dijalankan sendiri. Jangan taruh UI di InfinityFree karena tantangan AES-nya memblokir `fetch`.

## Yang harus disediakan pengguna

| Item | Nilai |
|---|---|
| Hosting PHP | Rumahweb, PHP 8.4, MySQL, SSL |
| API | Isi folder `20261014 API TM App` |
| Database | Dump `20261014-tokomedia DB Structure and Data.sql` |
| Database | Nama dan user `suwj4466_tm`, host `localhost` |
| Secrets | `application/config/secrets.local.php`, tidak masuk Git |
| Bridge | `public_html/tm-bridge.php`, tidak masuk Git |
| Origin UI | `https://suwandhih.github.io` ada di `cors_origins` |

Password database dan token hanya disimpan di server. Jangan meminta pengguna menempelkannya di chat bila berkas server sudah terisi.

## Bridge

`tm-bridge.php` menerima `path`, memeriksa allow-list, menambahkan token, lalu meneruskan POST ke API. Izinkan hanya endpoint ini:

```text
category/tree
other/latestvideo
other/detailvideo_readonly
other/likevideo
other/commentvideo
aplikasi/list
search
contact
ckitab/index
vkitab/languagepref
riwayat/languagepref
ikatan/languagepref
```

Tolak path lain dengan JSON `status: 201` dan pesan `Endpoint tidak diizinkan`.

## Permintaan dari UI

```javascript
function apiPost(path, params) {
  var body = new URLSearchParams();
  body.set('path', path);
  Object.keys(params || {}).forEach(function (key) {
    if (params[key] != null) body.set(key, params[key]);
  });
  return fetch('https://suwandhih.my.id/tm-bridge.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: body.toString()
  }).then(function (res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  });
}
```

Jangan mengirim token dari browser pada jalur publik.

## CMS demo Pusat Media Nusantara

Panel editor tersedia di `https://suwandhih.my.id/cms_tokomedia.html`. Panel ini hanya mengelola label, judul, deskripsi, dan dua teks tombol pada hero beranda. Data disimpan oleh `cms_tokomedia_api.php` ke `cms_tokomedia_data.json` di Rumahweb. APK Android membaca endpoint tersebut saat beranda dibuka dan memakai teks bawaan sebagai fallback jika endpoint gagal.

CMS ini sengaja tanpa login untuk demo client. Jangan gunakan konfigurasi tanpa autentikasi untuk produksi.

## Peta halaman

| UI | Endpoint | Parameter penting |
|---|---|---|
| Awal | `category/tree` | tidak ada |
| Beranda | `other/latestvideo` | `per_page=12` |
| Film Isa | `riwayat/languagepref` | `id` = slug bahasa terakhir |
| Video Kitab | `vkitab/languagepref` | `id` = slug bahasa terakhir |
| Film Ikatan | `ikatan/languagepref` | `id` = slug bahasa terakhir |
| Clip | `ckitab/index` | `per_page=100` |
| Detail | `other/detailvideo_readonly` | `id` = seq video |
| Aplikasi | `aplikasi/list` | `page`, `per_page`, `q` |
| Cari | `search` | `q` |

Slug `film-riwayat-isa-al-masih/musi-palembang` harus dikirim sebagai `id=musi-palembang`, bukan `8` dan bukan slug lengkap. `indonesia` adalah kasus khusus API untuk kategori 2.

Root kategori:

| Slug UI | ID root |
|---|---|
| `film-riwayat-isa-al-masih` | 1 |
| `video` | 126 |
| `clip` | 127 |
| `film-ikatan-ilahi` | 304 |

## Pemutar video

Detail video mengembalikan `source` berupa playlist `.m3u8`. Pasang `hls.js` hanya untuk browser yang tidak mendukung HLS bawaan. Jangan jadikan thumbnail sebagai tautan ke `tokomedia.org`.

## Uji wajib

**Web UI (GitHub Pages):**

1. Buka situs GitHub Pages. Tidak ada dialog token.
2. `category/tree` mengembalikan 7 root.
3. Halaman Musi memuat video dan tidak menampilkan `Endpoint tidak diizinkan`.
4. Halaman tonton menampilkan elemen `<video>`, bukan tautan keluar.
5. Uji di lebar PC dan 430px.

**Android Native (APK):**

1. Header: logo utuh & proporsional di **430dp/font 1.0** dan **320dp/font 2.0**.
2. Tidak ada teks tumpang tindih di dock, kartu bento, dan layar detail.
3. Pemutar video freeze tetap di atas saat halaman detail di-scroll.

**Cara uji cepat di emulator:**

```powershell
$adb = "C:\Users\suwan\AppData\Local\Android\Sdk\platform-tools\adb.exe"
& $adb shell wm size 720x1600; & $adb shell wm density 360   # = 320dp
& $adb shell settings put system font_scale 2.0              # skala font ekstrem
& $adb shell wm size reset; & $adb shell wm density reset    # kembali normal
```

Jangan menguji `index.html` lewat `file://`. Origin lokal `null` memang ditolak CORS dan bukan bukti API rusak.

## Larangan

- Jangan ulangi metode uji yang gagal.
- Jangan tulis token atau password di repo, log, atau dokumentasi.
- Jangan biarkan skrip PHP sementara di web root.
- Jangan anggap Live API client sebagai target UI ini.
- **Jangan susun logo dari potongan `Text` + ikon** — pakai satu gambar utuh.
- **Jangan uji seluruh aplikasi** saat hanya satu bagian yang direvisi.
- Jangan tinggalkan berkas sementara (screenshot uji, APK ganda) setelah tugas selesai.
