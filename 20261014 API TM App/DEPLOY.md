# Panduan Deploy API TokoMedia — InfinityFree (PHP 8.4 + MySQL 8)

Panduan menaikkan API CodeIgniter 3 di folder ini ke hosting gratis
**InfinityFree** (VistaPanel). Perkiraan waktu: **±25 menit**.

Spesifikasi: 5 GB disk, unlimited bandwidth, **PHP 8.4**, **MySQL 8.0**,
SSL gratis, tanpa iklan.

---

## 0. Berkas yang disiapkan

| Berkas | Ukuran | Kegunaan |
|---|---|---|
| `Backup/tokomedia-api-infinityfree.zip` | 6,7 MB | Seluruh kode API, siap unggah |
| `20261014 API TM App/deploy-tokomedia-mysql8.sql.gz` | 4,1 MB | Data untuk diimpor |

> Dump asli `20261014-tokomedia DB Structure and Data.sql` **jangan** dipakai —
> berisi 2.516 tanggal nol yang ditolak MySQL 8.

---

## 1. Buat akun

1. Buka <https://dash.infinityfree.com/register>
2. Isi email + password, lalu **verifikasi lewat tautan di email**.
3. Setelah masuk, klik **Create Account** → pilih subdomain gratis
   (mis. `tokomedia-api.rf.gd` atau `*.great-site.net`).
4. Tunggu aktivasi (± beberapa menit). Catat:
   - Alamat situs, mis. `http://tokomedia-api.rf.gd`
   - URL **Control Panel** (VistaPanel)

---

## 2. Buat database MySQL

Di **VistaPanel → MySQL Databases**:

1. Buat database, mis. `tokomedia` → sistem menambah prefiks akun,
   hasil akhirnya seperti `if0_12345678_tokomedia`.
2. Buat user MySQL + password, lalu **Add user to database** dengan
   **ALL PRIVILEGES**.
3. Catat 4 nilai ini:

| Nilai | Contoh |
|---|---|
| Host | `sqlXXX.infinityfree.com` |
| Nama database | `if0_12345678_tokomedia` |
| User | `if0_12345678` |
| Password | (password yang dibuat) |

---

## 3. Impor data

1. VistaPanel → **phpMyAdmin** → pilih database yang baru dibuat.
2. Tab **Import** → pilih **`deploy-tokomedia-mysql8.sql.gz`**
   (4,1 MB — sudah terkompresi, aman di bawah batas unggah).
3. Tunggu sampai selesai (± 1–2 menit).
4. Impor juga **`database/20261019_priority3.sql`** (tabel `videolike` +
   kolom password).

Verifikasi di tab **SQL**:

```sql
SELECT COUNT(*) FROM videodb;   -- harus 16586
SELECT COUNT(*) FROM category;  -- harus 321
SELECT COUNT(*) FROM appdb;     -- harus 275
```

---

## 4. Unggah kode API

1. VistaPanel → **File Manager** (atau FTP: host/user/password sama seperti
   akun hosting).
2. Masuk ke folder **`htdocs`**.
3. Unggah `tokomedia-api-infinityfree.zip`, lalu **Extract** di dalam `htdocs`.
4. Pastikan strukturnya:

```
htdocs/
├── .htaccess
├── index.php
├── application/
├── assets/
├── database/
├── docs/
└── system/
```

> Bila File Manager tidak bisa mengekstrak ZIP, unggah isi folder satu per satu
> lewat FTP.

---

## 5. Isi kredensial

Di File Manager, buat berkas baru
**`htdocs/application/config/secrets.local.php`** berisi:

```php
<?php
return array(
	'TM_API_TOKEN' => '<token rahasia>',

	'TM_SMTP_HOST' => 'smtp.contoh.com',
	'TM_SMTP_PORT' => 587,
	'TM_SMTP_USER' => 'info@contoh.com',
	'TM_SMTP_PASS' => '<password smtp>',
	'TM_SMTP_CRYPTO' => 'tls',
	'TM_SMTP_FROM' => 'info@contoh.com',
	'TM_SMTP_FROM_NAME' => 'Mobile Apps',
	'TM_SMTP_TO' => 'info@contoh.com',

	'TM_DB_HOST' => 'sqlXXX.infinityfree.com',
	'TM_DB_USER' => 'if0_12345678',
	'TM_DB_PASS' => '<password database>',
	'TM_DB_NAME' => 'if0_12345678_tokomedia',
	'TM_DB_PORT' => 3306,
);
```

Berkas ini **tidak boleh** di-commit ke Git (sudah ada di `.gitignore`).

---

## 6. Uji

> ⚠️ **`curl` TIDAK BISA dipakai untuk menguji InfinityFree.** Dua sebab:
> 1. InfinityFree memblokir User-Agent non-browser → `curl` gagal (exit 52 / HTTP 000).
> 2. InfinityFree menyajikan **halaman tantangan JavaScript AES** (`/aes.js`, cookie
>    `__test`) yang hanya bisa dipecahkan browser sungguhan.
>
> Jadi uji **wajib dari browser**. Ini normal dan bukan tanda API rusak.

> ⚠️ **Console harus dibuka DI halaman InfinityFree itu sendiri** (satu origin).
> Bila Console dibuka di halaman GitHub Pages, permintaan bersifat lintas-origin,
> cookie `__test` tidak dikirim, dan yang diterima adalah halaman tantangan
> (`text/html` ±871 byte) — bukan JSON. Itu keterbatasan host, bukan API-nya.
> Penjelasan lengkap: **8a**.

### 6a. Uji dari Console browser

Buka <https://suwandhih.site.je/> di browser, tekan **F12 → Console**, lalu tempel:

```js
fetch('https://suwandhih.site.je/index.php/api/category/tree', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  body: 'token=<TOKEN>'
}).then(r => r.json()).then(d => console.log(d.status, d.data.length));
```

Hasil yang benar: `200 7` (7 kategori akar).

### 6b. Uji header CORS

Masih di Console, jalankan:

```js
fetch('https://suwandhih.site.je/index.php/api/category/tree', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  body: 'token=<TOKEN>'
}).then(r => console.log('ACAO =', r.headers.get('access-control-allow-origin')));
```

Harus mencetak `ACAO = https://suwandhih.github.io` (atau origin tempat UI dibuka).
Bila `ACAO = null` → lihat **8. Troubleshooting CORS**. Perhatikan juga
`Content-Type` balasan: `text/html` berarti permintaan tidak sampai ke PHP
(tantangan InfinityFree — bagian **8a**), bukan masalah konfigurasi.

### 6c. Uji token salah

```js
fetch('https://suwandhih.site.je/index.php/api/category/tree', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  body: 'token=salah'
}).then(r => r.json()).then(d => console.log(d.status, d.message));
```

Hasil yang benar: `404 No Permission`.

Bila muncul halaman HTML alih-alih JSON, buka `application/logs/` atau set
sementara `CI_ENV=development`.

---

## 7. Hubungkan UI

**JANGAN menulis token di `index.html`** — berkas itu ikut Git dan dapat dibaca
siapa pun. Token diisi lewat berkas terpisah yang tidak ikut Git.

### 7a. Ubah `apiBase` di `index.html`

Satu baris saja (root repositori):

```js
var TM_CONFIG = {
  apiBase: 'https://suwandhih.site.je/index.php/api',
  token: (window.TM_CONFIG && window.TM_CONFIG.token) || ''
};
```

### 7b. Isi token lewat `config.local.js`

Salin `config.example.js` menjadi `config.local.js` di root repositori, lalu isi:

```js
window.TM_CONFIG = {
  token: '<TOKEN>'
};
```

`config.local.js` sudah ada di `.gitignore` sehingga tidak akan ter-commit.
UI memuatnya otomatis lewat `loadLocalConfig()`.

### 7c. Untuk pengujian cepat tanpa berkas

Tambahkan query string pada URL halaman:

```
https://suwandhih.github.io/TokoMedia/?api=https://suwandhih.site.je/index.php/api
```

Bila UI juga dipasang di domain API, tambahkan origin tersebut ke
`$config['cors_origins']` di `application/config/config.php`.

---

## 8. Troubleshooting CORS

Gejala: API membalas JSON dengan benar bila dibuka langsung, tetapi UI di
GitHub Pages gagal dengan pesan CORS di Console browser.

### Langkah pertama: bedakan 2 kemungkinan

Buka Console browser di halaman UI, lalu periksa **`Content-Type`** balasan:

| `Content-Type` balasan | Artinya | Tindakan |
|---|---|---|
| `text/html` (±871 byte) | Permintaan **tidak sampai ke PHP** — dijawab halaman tantangan InfinityFree | Lihat **8a** |
| `application/json` tapi tanpa `Access-Control-Allow-Origin` | PHP jalan, tetapi daftar origin kosong | Lihat **8b** |

Cara cepat memeriksanya:

```js
fetch('https://suwandhih.site.je/index.php/api/category/tree', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  body: 'token=<TOKEN>'
}).then(r => console.log(r.headers.get('content-type'),
                        r.headers.get('access-control-allow-origin')));
```

### 8a. `text/html` — tantangan JavaScript AES InfinityFree

InfinityFree memasang tantangan anti-bot (`/aes.js` + cookie `__test`) di depan
**seluruh akun**, termasuk berkas statis. Permintaan lintas-origin dari GitHub
Pages tidak membawa cookie `__test`, jadi yang diterima selalu halaman
tantangan — PHP tidak pernah dijalankan, `Api_cors.php` tidak jalan, dan header
CORS tidak pernah dikirim.

**Ini tidak bisa diperbaiki dari sisi kode.** Tidak ada pengaturan di
`config.php`, `hooks.php`, `.htaccess`, maupun panel InfinityFree untuk
mematikannya.

**Bukti bahwa kode CORS-nya sudah benar:** bila cookie `__test` dikirim, API
membalas `application/json` (68.819 byte) **lengkap dengan**
`Access-Control-Allow-Origin: https://suwandhih.github.io`.

**Pilihan:** pasang Cloudflare di depan domain, pindah ke host lain, atau pakai
XAMPP untuk demo lokal. Rincian lengkap: `../TEMUAN-TANTANGAN-AES-INFINITYFREE.md`.

### 8b. `application/json` tanpa ACAO — daftar origin kosong

Hook CORS (`application/hooks/Api_cors.php`) membaca daftar origin dari
`$config['cors_origins']` di `application/config/config.php`. Bila berkas
`config.php` yang terpasang **versi lama** (tanpa `cors_origins`), daftar itu
kosong → tidak ada origin yang cocok → header `Access-Control-Allow-Origin`
**tidak pernah dikirim**.

Ciri khas: header `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`,
dan `Access-Control-Max-Age` **ada**, tetapi `Access-Control-Allow-Origin`
**tidak ada**.

**Perbaikan:**

1. VistaPanel → **File Manager** → masuk `htdocs/application/config/`.
2. Unduh dulu `config.php` yang lama sebagai cadangan (mis. `config.php.bak`).
3. Dari `Backup/tokomedia-api-infinityfree.zip`, ekstrak
   `application/config/config.php` lalu unggah menimpanya.
4. Pastikan `htdocs/application/config/hooks.php` juga versi baru (berisi
   `$hook['post_controller_constructor'][]` untuk `Api_cors`).
5. Pastikan `htdocs/application/hooks/Api_cors.php` ada.
6. Uji ulang dengan langkah **6b**.

Cek cepat isi `config.php` — cari baris:

```php
$config['cors_origins'] = array(
	'https://suwandhih.github.io',
	'https://tokomedia.org',
	'https://www.tokomedia.org',
);
```

Bila baris ini tidak ada → itulah penyebabnya.

### Jangan pakai `Access-Control-Allow-Origin: *`

Wildcard membuat API dapat dipanggil dari situs mana pun. Cukup daftarkan
origin yang benar-benar dipakai di `$config['cors_origins']`.

---

## Catatan teknis

| Hal | Keterangan |
|---|---|
| Environment | `index.php` memakai `production` secara default (JSON bersih). Set `CI_ENV=development` untuk menampilkan error. |
| CORS | Hook `post_controller_constructor` → `application/hooks/Api_cors.php`. Daftar origin di `$config['cors_origins']` (`application/config/config.php`). Bila `config.php` masih versi lama, header `Access-Control-Allow-Origin` tidak dikirim — lihat bagian **8b**. |
| Kredensial | `application/config/secrets.php` membaca environment variable lebih dulu, lalu `secrets.local.php`. |
| Charset | `utf8mb4` / `utf8mb4_unicode_ci` agar cocok dengan collation tabel. |
| Proteksi | `.htaccess` memblokir akses ke `application/`, `system/`, `database/`, `docs/`, serta berkas `.sql`/`.zip`/`.log`. |
| Stateless | Library `session` tidak di-autoload — API tidak memakainya. |
| Kompatibilitas | Diuji pada PHP 5.6.40, 8.3.35, dan 8.4.26: 25/25 endpoint status 200. |
| Tantangan AES | InfinityFree menyajikan halaman tantangan JavaScript (`/aes.js`, cookie `__test`) sebelum permintaan sampai ke PHP. Berlaku untuk **seluruh akun**, termasuk berkas statis. Browser biasa bisa melewatinya saat membuka halaman, tetapi `fetch()` lintas-origin **tidak** — jadi host ini tidak layak untuk API yang dipanggil dari domain lain. Lihat bagian **8a**. |
| User-Agent | InfinityFree memblokir User-Agent non-browser. Uji selalu dari browser. |
| Status HTTP | Selalu `200`. Kode sebenarnya ada di field `status` pada body JSON (200 sukses / 201 validasi / 404 gagal). |
| Token kosong | Bila `TM_API_TOKEN` kosong, **semua** endpoint menolak dengan `{"status":404,"message":"No Permission"}`. |
