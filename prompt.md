# prompt.md — Bangun Ulang UI TokoMedia

> Untuk AI lain. Baca `AGENTS.md` dan `datapemetaan.md` sebelum mengubah kode.
> Jangan tulis token, password, atau isi `secrets.local.php` ke Git.

## Hasil yang harus sama

Buat satu halaman `index.html` di GitHub Pages yang menampilkan data yang sama dengan situs TokoMedia:

- Beranda, kategori, wilayah, bahasa, daftar video, detail video, aplikasi, pencarian, dan kontak.
- Logo resmi dan tagline `MEDIA NUSANTARA`.
- `Indonesia (Bahasa Nasional)` selalu di urutan atas.
- Accordion kepulauan tertutup saat pertama dibuka.
- Pengunjung tidak diminta token.
- Video diputar di halaman GitHub, tidak membuka `tokomedia.org`.

Alamat live: `https://suwandhih.github.io/TokoMedia/`

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

1. Buka situs GitHub Pages. Tidak ada dialog token.
2. `category/tree` mengembalikan 7 root.
3. Halaman Musi memuat video dan tidak menampilkan `Endpoint tidak diizinkan`.
4. Halaman tonton menampilkan elemen `<video>`, bukan tautan keluar.
5. Uji di lebar PC dan 430px.

Jangan menguji `index.html` lewat `file://`. Origin lokal `null` memang ditolak CORS dan bukan bukti API rusak.

## Larangan

- Jangan ulangi metode uji yang gagal.
- Jangan tulis token atau password di repo, log, atau dokumentasi.
- Jangan biarkan skrip PHP sementara di web root.
- Jangan anggap Live API client sebagai target UI ini.
