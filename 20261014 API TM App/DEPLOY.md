# Panduan Deploy API TokoMedia — byet.host (PHP 8.3 + MySQL 8)

Panduan ini menaikkan API CodeIgniter 3 di folder ini ke hosting gratis
**byet.host** (VistaPanel). Perkiraan waktu: **±20 menit**.

---

## 1. Buat akun hosting

1. Buka <https://byet.host/free-hosting/news>
2. Isi formulir: **username** (jadi nama subdomain), **password**, **email**,
   kategori & bahasa situs, lalu **kode captcha**.
3. Setelah aktif, catat:
   - Alamat situs, mis. `http://namasaya.byethost7.com`
   - URL **VistaPanel**: `https://cpanel.byethost7.com` (nomor menyesuaikan)

> Catatan: pendaftaran butuh email + captcha, jadi harus dilakukan manual.

---

## 2. Buat database MySQL

Di **VistaPanel → MySQL Databases**:

1. Buat database, mis. nama `tokomedia` → sistem menambah prefiks akun,
   hasil akhirnya seperti `b7_12345678_tokomedia`.
2. Buat user MySQL + password.
3. Tambahkan user tersebut ke database dengan **ALL PRIVILEGES**.
4. Catat 4 nilai ini (dipakai di langkah 5):

| Nilai | Contoh |
|---|---|
| Host | `sql302.byethost7.com` |
| Nama database | `b7_12345678_tokomedia` |
| User | `b7_12345678` |
| Password | (password yang dibuat) |

---

## 3. Impor data

1. VistaPanel → **phpMyAdmin** → pilih database yang baru dibuat.
2. Tab **Import** → pilih berkas **`deploy-tokomedia-mysql8.sql`**
   (25,9 MB — versi yang sudah dibersihkan untuk MySQL 8).
3. Tunggu sampai selesai. Bila unggahan terputus karena batas ukuran,
   kompres dulu ke `.zip`/`.gz` lalu impor berkas kompresi tersebut.
4. Setelah dump utama masuk, impor juga
   **`database/20261019_priority3.sql`** (tabel `videolike` + kolom password).

Verifikasi cepat di tab **SQL**:

```sql
SELECT COUNT(*) FROM videodb;   -- harus 16586
SELECT COUNT(*) FROM category;  -- harus 321
SELECT COUNT(*) FROM appdb;     -- harus 275
```

> **Jangan** impor `20261014-tokomedia DB Structure and Data.sql` (dump asli).
> Dump itu memuat 2.516 tanggal nol yang ditolak MySQL 8.

---

## 4. Unggah berkas API

Unggah **seluruh isi folder ini** ke `htdocs` (kadang bernama `public_html`)
melalui **File Manager** VistaPanel atau FTP.

Struktur akhir di server:

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

**Jangan diunggah:**

- `20261014-tokomedia DB Structure and Data.sql` (26 MB, tidak diperlukan)
- `deploy-tokomedia-mysql8.sql` (hanya untuk impor, hapus setelah selesai)
- `application/config/secrets.local.php` (buat baru di server, langkah 5)

---

## 5. Isi kredensial

Di server, salin `application/config/secrets.local.example.php` menjadi
`application/config/secrets.local.php`, lalu isi:

```php
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

	'TM_DB_HOST' => 'sql302.byethost7.com',
	'TM_DB_USER' => 'b7_12345678',
	'TM_DB_PASS' => '<password database>',
	'TM_DB_NAME' => 'b7_12345678_tokomedia',
	'TM_DB_PORT' => 3306,
);
```

Berkas ini **tidak boleh** ikut ter-commit ke Git (sudah ada di `.gitignore`).

---

## 6. Uji

Ganti `<TOKEN>` dan `<SITUS>` sesuai nilai sebenarnya.

```bash
# 1. Token salah -> harus "No Permission"
curl -s -X POST "http://<SITUS>/index.php/api/category/tree" -d "token=salah"

# 2. Token benar -> harus JSON status 200
curl -s -X POST "http://<SITUS>/index.php/api/category/tree" -d "token=<TOKEN>"

# 3. Cek header CORS (harus muncul Access-Control-Allow-Origin)
curl -s -i -X POST "http://<SITUS>/index.php/api/category/tree" \
  -H "Origin: https://suwandhih.github.io" -d "token=<TOKEN>" | head -20
```

Bila muncul halaman HTML alih-alih JSON, periksa
`application/logs/` atau aktifkan sementara `CI_ENV=development`.

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
