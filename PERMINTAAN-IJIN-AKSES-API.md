# Permintaan Ijin Akses API TokoMedia

> ## ⛔ TIDAK DIPERLUKAN LAGI — 20 Oktober 2026
>
> **Berkas ini disimpan hanya sebagai catatan sejarah. JANGAN dikirim ke tim IT client.**
>
> **Alasannya:** pada 20 Oktober 2026 tim IT client menegaskan:
>
> > *"ini source code API dan database TM. jadi ini bisa diinstal sendiri, boleh di hosting atau localhost (laptop sendiri). Jadi bisa simulasi sendiri API call nya. **jadi tidak perlu pakai live API yg ada batasan CORS.**"*
>
> Jadi client **tidak menawarkan Live API** untuk aplikasi ini — yang ditawarkan adalah **source code untuk dipasang sendiri**. Meminta ijin CORS sekarang akan terkesan tidak menyimak arahan mereka.
>
> **Yang berlaku sekarang:** self-host di `suwandhih.site.je` (sudah jalan). Lihat `rencanakerja.md` bagian **H7**, **H7b**, dan **G5**.
>
> **Bila nanti Live API tetap diperlukan** (setelah client puas dengan hasilnya), permintaan disusun ulang memakai kalimat **"Tahap 2"** di `rencanakerja.md` bagian **G5** — bukan berkas ini.

**Untuk:** Tim IT pengelola server `tokomedia.org`
**Dari:** Pengelola antarmuka web TokoMedia (`https://suwandhih.github.io/TokoMedia/`)
**Tanggal:** 20 Oktober 2026

> **Cara pakai berkas ini:** Bagian 1 disalin ke email/WhatsApp. Bagian 2 dilampirkan
> sebagai script siap tempel. Bagian 3 dipakai untuk memverifikasi setelah mereka selesai.

---

## Ringkasan masalah

Antarmuka web TokoMedia berjalan di domain `https://suwandhih.github.io`, sedangkan
API berada di domain `tokomedia.org`. Karena **berbeda domain**, browser otomatis
memblokir pembacaan respons API. Ini bukan bug API — ini aturan keamanan browser
yang bernama **CORS** (*Cross-Origin Resource Sharing*).

Solusinya: server API menambahkan **satu baris header izin** yang menyebutkan
domain antarmuka web. Tidak perlu akses FTP dari pihak kami, tidak mengubah logika
API yang sudah ada.

### Hasil pemeriksaan 20 Oktober 2026

| Uji | Hasil |
|---|---|
| `POST https://www.tokomedia.org/api/index.php/api/category/tree` | HTTP 200, `Content-Type: text/html` — halaman login website, bukan JSON |
| `POST https://www.tokomedia.org/api/index.php/api/riwayat` | Sama — HTML |
| `OPTIONS` (preflight) | Sama — HTML |
| Header `Access-Control-Allow-Origin` | Tidak ada |

**Kesimpulan:** endpoint API belum aktif di alamat tersebut, dan header CORS belum
terpasang. Keduanya perlu dibantu dari sisi server.

---

## Bagian 1 — Kalimat permintaan (siap salin)

> **Subjek: Permohonan penambahan header CORS + konfirmasi URL endpoint API TokoMedia**
>
> Selamat pagi/siang Bapak/Ibu,
>
> Terima kasih atas API TokoMedia yang telah diberikan. Kami sudah menyiapkan
> antarmuka web yang akan memakainya, dan saat ini terkendala satu hal teknis yang
> hanya bisa diselesaikan dari sisi server Bapak/Ibu.
>
> **1. Ijin akses (CORS)**
>
> Antarmuka kami berjalan di `https://suwandhih.github.io`. Karena berbeda domain
> dengan API, browser otomatis memblokir pembacaan respons API. Mohon ditambahkan
> header berikut pada respons API:
>
> ```
> Access-Control-Allow-Origin: https://suwandhih.github.io
> ```
>
> Kami lampirkan potongan script siap tempel (PHP / Apache / Nginx — silakan pilih
> sesuai server yang dipakai). Cukup ±10 baris, tidak mengubah logika API yang sudah
> ada, dan tidak perlu akses FTP dari kami.
>
> **2. Konfirmasi URL endpoint API**
>
> Saat kami uji, alamat `https://www.tokomedia.org/api/index.php/api/category/tree`
> mengembalikan halaman HTML website, bukan respons JSON. Mohon dibantu konfirmasi
> **URL endpoint API yang benar dan sudah aktif**, beserta contoh satu request yang
> berhasil.
>
> **3. Rotasi token + pengikatan ke origin (WAJIB)**
>
> Mohon **diterbitkan token API yang baru** dan token lama **dinonaktifkan**. Alasannya:
> token lama pernah tertulis terbuka di repositori publik kami, sehingga harus
> dianggap sudah bocor.
>
> Sebagai pengaman tambahan, mohon token baru tersebut **hanya berlaku bila request
> datang dari origin `https://suwandhih.github.io`**. Dengan begitu, kalau token itu
> suatu saat bocor lagi, token tersebut tidak bisa dipakai dari situs lain.
> Contoh penerapannya kami lampirkan pada Bagian 2 Varian D.
>
> **4. Konfirmasi URL endpoint API**
>
> Saat kami uji, alamat `https://www.tokomedia.org/api/index.php/api/category/tree`
> mengembalikan halaman HTML website, bukan respons JSON. Mohon dibantu konfirmasi
> **URL endpoint API yang benar dan sudah aktif**, beserta contoh satu request yang
> berhasil.
>
> Setelah poin 1–4 selesai, kami akan langsung melakukan pengujian dan melaporkan
> hasilnya.
>
> Terima kasih atas bantuannya.
>
> Hormat kami,
> [Nama]

---

## Bagian 2 — Script ijin akses (siap tempel)

Pilih **salah satu** sesuai jenis server yang dipakai. Ketiganya memberi hasil sama.

### Varian A — PHP

Tempel di **baris paling atas** berkas pintu masuk API (mis. `index.php`),
sebelum baris `<?php` yang sudah ada digabung — atau tepat setelah `<?php` pertama.

```php
<?php
// ===== Ijin akses (CORS) untuk UI TokoMedia di GitHub Pages =====
$tm_allowed_origins = array(
    'https://suwandhih.github.io',
);

$tm_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if ($tm_origin !== '' && in_array($tm_origin, $tm_allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $tm_origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
// ===== akhir ijin akses =====
```

### Varian B — Apache (`.htaccess`)

```apache
<IfModule mod_headers.c>
    SetEnvIf Origin "^https://suwandhih\.github\.io$" TM_CORS=$0
    Header always set Access-Control-Allow-Origin "%{TM_CORS}e" env=TM_CORS
    Header always set Vary "Origin" env=TM_CORS
    Header always set Access-Control-Allow-Methods "POST, GET, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, X-Requested-With"
</IfModule>
```

### Varian C — Nginx

```nginx
location /api/ {
    if ($http_origin ~* "^https://suwandhih\.github\.io$") {
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Vary Origin always;
    }
    add_header Access-Control-Allow-Methods "POST, GET, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, X-Requested-With" always;
    if ($request_method = OPTIONS) { return 204; }
}
```

### Varian D — Pengikatan token ke origin (pengaman tambahan)

Tempel **setelah** ijin akses Varian A/B/C. Fungsinya: token hanya berlaku bila
request datang dari origin yang diizinkan. Kalau token bocor, tetap tidak berguna
dari situs lain.

```php
<?php
// ===== Token hanya berlaku dari origin resmi =====
$tm_token_terikat_origin = true;   // set false untuk mematikan pengaman ini

if ($tm_token_terikat_origin) {
    $tm_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    if (!in_array($tm_origin, $tm_allowed_origins, true)) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(403);
        echo json_encode(array(
            'status'  => 403,
            'message' => 'No Permission',
            'data'    => null,
        ));
        exit;
    }
}
// ===== akhir pengikatan =====
```

### ⚠️ Yang harus dihindari

**Jangan** memakai `Access-Control-Allow-Origin: *`. Tanda bintang berarti **semua
situs di internet** boleh membaca API. Cukup sebutkan origin antarmuka web saja.

---

## Bagian 3 — Cara memverifikasi setelah dipasang

Ganti `<TOKEN>` dengan token yang berlaku.

```bash
curl -s -i -X POST "https://www.tokomedia.org/api/index.php/api/category/tree" \
  -H "Origin: https://suwandhih.github.io" \
  -d "token=<TOKEN>"
```

**Hasil yang diharapkan:**

```
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: https://suwandhih.github.io
```

Bila `Content-Type` masih `text/html`, berarti URL endpoint belum benar.
Bila `Access-Control-Allow-Origin` belum muncul, berarti script ijin belum aktif.

---

## Bagian 4 — Catatan teknis

| Hal | Keterangan |
|---|---|
| Nama teknis | CORS (*Cross-Origin Resource Sharing*) |
| Header inti | `Access-Control-Allow-Origin` |
| Origin yang diminta | `https://suwandhih.github.io` |
| Metode | `POST` (form-urlencoded), `GET`, `OPTIONS` |
| Header request | `Content-Type`, `X-Requested-With` |
| Preflight | Tidak wajib untuk request saat ini, tetapi disiapkan agar aman bila header berubah |
| Dampak ke API | Tidak ada — hanya menambah header pada respons |
| Akses FTP | Tidak diperlukan dari pihak kami |

### Catatan untuk sisi kami

Kode CORS yang setara **sudah tersedia** di repositori ini:

- `20261014 API TM App/application/hooks/Api_cors.php`
- `20261014 API TM App/application/config/config.php` → `$config['cors_origins']`

Bila kelak API dipasang di server kami sendiri, script di atas tidak perlu diminta
ke pihak lain.
