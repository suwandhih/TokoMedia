# datapemetaan.md — Koneksi Aplikasi ke API TokoMedia

> Untuk AI atau aplikasi baru. Tujuan: tersambung tanpa mengulang masalah CORS, token, dan slug.
> Jangan simpan token di aplikasi publik.

## Pilihan koneksi

| Aplikasi | Cara yang benar |
|---|---|
| Web publik | Panggil `https://suwandhih.my.id/tm-bridge.php` |
| Android atau aplikasi server | Boleh panggil API langsung bila token disimpan aman |
| Uji lokal | Jangan pakai `file://`; gunakan origin yang diizinkan |

API langsung: `https://suwandhih.my.id/index.php/api/`

Semua permintaan memakai `POST` dan `application/x-www-form-urlencoded`. HTTP sering tetap 200. Yang menentukan hasil adalah JSON `status`.

| JSON status | Arti |
|---|---|
| 200 | Berhasil |
| 201 | Permintaan ditolak atau data kosong |
| 404 | Parameter, izin, atau data tidak ditemukan |

## Skrip web anti-gagal

```javascript
async function tmPost(path, params) {
  var body = new URLSearchParams();
  body.set('path', path);
  Object.entries(params || {}).forEach(function (entry) {
    if (entry[1] != null && entry[1] !== '') body.set(entry[0], String(entry[1]));
  });

  var res = await fetch('https://suwandhih.my.id/tm-bridge.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: body.toString()
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);

  var json = await res.json();
  if (!json || json.status !== 200) {
    throw new Error((json && json.message) || 'API gagal');
  }
  return json;
}
```

## Skrip aplikasi yang menyimpan token dengan aman

```javascript
async function tmDirect(path, params, token) {
  var body = new URLSearchParams();
  body.set('token', token);
  Object.entries(params || {}).forEach(function (entry) {
    if (entry[1] != null && entry[1] !== '') body.set(entry[0], String(entry[1]));
  });

  var res = await fetch('https://suwandhih.my.id/index.php/api/' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: body.toString()
  });
  var json = await res.json();
  if (!json || json.status !== 200) throw new Error(json.message || 'API gagal');
  return json;
}
```

Token dibaca dari penyimpanan aman aplikasi, bukan dari kode sumber publik.

## Endpoint dan parameter

### Data awal

```text
category/tree
```

Hasil `data` berisi `id,name,slug,description,thumbnail,haschild,children`.

```text
other/latestvideo
per_page=12
```

Item berisi `id,name,thumbnail,slug,watchcounter,duration,dateschedule_iso`.

### Video per bahasa

```text
riwayat/languagepref     id=musi-palembang&per_page=100
vkitab/languagepref      id=slug-bahasa-terakhir&per_page=100
ikatan/languagepref      id=slug-bahasa-terakhir&per_page=100
ckitab/index             per_page=100
```

Aturan slug:

```text
film-riwayat-isa-al-masih/musi-palembang -> musi-palembang
indonesia -> indonesia
```

Jangan kirim ID angka kategori ke `languagepref`. API akan menjawab `Bahasa ini tidak terdaftar` bila slug tidak cocok.

### Detail dan pemutar

```text
other/detailvideo_readonly
id=16730
```

Field penting: `title,content,source,duration,watchcounter,tag,favcounter,thumbnail,slug,recomended`.

`source` adalah URL `.m3u8`. Untuk web:

```javascript
if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = source;
} else if (window.Hls && Hls.isSupported()) {
  var hls = new Hls();
  hls.loadSource(source);
  hls.attachMedia(video);
}
```

Thumbnail tetap berasal dari `https://www.tokomedia.org`, tetapi pemutaran tidak boleh membuka halaman situs itu.

### Aplikasi, cari, suka, komentar, kontak

```text
aplikasi/list      page=1&per_page=12&q=toraja
search             q=kata-cari
other/likevideo    id=16730
other/commentvideo contactname,emailaddress,phonenumber,messagecontent,videoid,videotitle
contact            field sesuai formulir kontak
```

`commentvideo` membatasi 10 permintaan per 5 menit per klien dan membutuhkan SMTP yang valid. Jangan anggap gagal komentar sebagai gagal koneksi database.

## Urutan koneksi yang aman

1. `POST category/tree`. Harus ada 7 root.
2. `POST other/latestvideo` dengan `per_page=1`.
3. Ambil `id` video pertama.
4. `POST other/detailvideo_readonly`.
5. Pastikan `source` berakhir `playlist.m3u8`.
6. Baru panggil endpoint bahasa dengan slug terakhir.

## Penyebab gagal yang sudah terbukti

| Gejala | Penyebab | Perbaikan |
|---|---|---|
| `No Permission` | Token kosong atau salah | Isi `TM_API_TOKEN` di server |
| `Endpoint tidak diizinkan` | Path tidak ada di bridge | Tambah path ke allow-list |
| `Bahasa ini tidak terdaftar` | `id` bukan slug terakhir | Kirim `musi-palembang`, bukan `8` |
| CORS dari `file://` | Origin `null` tidak diizinkan | Uji lewat GitHub Pages |
| HTTP 500 semua endpoint | Password database salah | Perbaiki `TM_DB_PASS` di server |
| UI kosong hanya di InfinityFree | Tantangan AES | Jangan pakai host itu untuk `fetch` |

## Data yang tidak boleh masuk Git

```text
application/config/secrets.local.php
public_html/tm-bridge.php
config.local.js
```

Contoh nama field secrets ada di `application/config/secrets.local.example.php`. Salin contoh itu di server, isi nilainya, dan jangan commit hasil salinannya.
