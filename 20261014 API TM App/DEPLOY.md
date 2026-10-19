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

Ganti `<TOKEN>` dan `<SITUS>` sesuai nilai sebenarnya.

```bash
# 1. Token salah -> harus "No Permission"
curl -s -X POST "http://<SITUS>/index.php/api/category/tree" -d "token=salah"

# 2. Token benar -> harus JSON status 200
curl -s -X POST "http://<SITUS>/index.php/api/category/tree" -d "token=<TOKEN>"

# 3. Header CORS (harus muncul Access-Control-Allow-Origin)
curl -s -i -X POST "http://<SITUS>/index.php/api/category/tree" \
  -H "Origin: https://suwandhih.github.io" -d "token=<TOKEN>" | head -20
```

Bila muncul halaman HTML alih-alih JSON, buka
`application/logs/` atau set sementara `CI_ENV=development`.

---

## 7. Hubungkan UI

Ubah satu baris di `index.html` (root repositori):

```js
var TM_CONFIG = {
  apiBase: 'http://<SITUS>/index.php/api',
  token: '<TOKEN>'
};
```

Bila UI juga dipasang di domain API, tambahkan origin tersebut ke
`$config['cors_origins']` di `application/config/config.php`.

---

## Catatan teknis

| Hal | Keterangan |
|---|---|
| Environment | `index.php` memakai `production` secara default (JSON bersih). Set `CI_ENV=development` untuk menampilkan error. |
| CORS | Hook `post_controller_constructor` → `application/hooks/Api_cors.php`. Daftar origin di `$config['cors_origins']`. |
| Kredensial | `application/config/secrets.php` membaca environment variable lebih dulu, lalu `secrets.local.php`. |
| Charset | `utf8mb4` / `utf8mb4_unicode_ci` agar cocok dengan collation tabel. |
| Proteksi | `.htaccess` memblokir akses ke `application/`, `system/`, `database/`, `docs/`, serta berkas `.sql`/`.zip`/`.log`. |
| Stateless | Library `session` tidak di-autoload — API tidak memakainya. |
| Kompatibilitas | Diuji pada PHP 5.6.40, 8.3.35, dan 8.4.26: 25/25 endpoint status 200. |
