# Dokumentasi API TokoMedia (TM App)

**Sumber kode:** `C:\data\TokoMedia\20261014 API TM App`
**Tanggal analisis:** 15 Oktober 2026
**Tujuan dokumen:** menjelaskan isi API, cara pakainya, dan sejauh mana API ini sudah mencakup kebutuhan website [tokomedia.org](https://www.tokomedia.org/)

---

## 1. Ringkasan

| Item | Nilai |
|---|---|
| Framework | CodeIgniter **3.1.13** (PHP) |
| Struktur | `application/` + `system/` + `assets/` + `index.php` (struktur CI3 standar) |
| Database | MySQL, schema `tokomedia` (dump: `20261014-tokomedia DB Structure and Data.sql`, 27 MB) |
| Jenis API | REST-ish, **POST form-data**, respons JSON |
| Autentikasi | 1 token statis global (`TOKEN`) dikirim sebagai field `token` |
| Jumlah controller API | 7 (`Aplikasi`, `Ckitab`, `Contact`, `Ikatan`, `Other`, `Riwayat`, `Vkitab`) |
| Jumlah endpoint | 30 method publik |
| Isi database | 16.586 video, 321 kategori, 275 aplikasi, 640 komentar, 17.107 baris routing |

API ini adalah **backend untuk aplikasi mobile** (Android/iOS) TokoMedia, bukan API untuk website. Website `tokomedia.org` saat ini berjalan dengan aplikasi PHP terpisah (bukan CodeIgniter ini) yang membaca database yang sama.

---

## 2. Arsitektur & Cara Akses

### 2.1 Alur request

```mermaid
flowchart LR
    A["Client<br/>(App / Web)"] -->|"POST + token"| B["index.php<br/>(CI3 front controller)"]
    B --> C["Router CI3"]
    C --> D["Controller<br/>application/controllers/api/*.php"]
    D --> E["Model<br/>application/models/*.php"]
    E --> F[("MySQL<br/>tokomedia")]
    D --> G["JSON Response"]
```

### 2.2 Pola URL

CodeIgniter 3 memakai pola `index.php/<controller>/<method>`:

```
https://<host>/<folder-instalasi>/index.php/api/<controller>/<method>
```

Contoh: `https://www.tokomedia.org/api/index.php/api/vkitab/language`

> **Catatan penting:** `application/config/routes.php` **tidak punya route khusus** — hanya default CI3. Jadi URL mengikuti nama class & method apa adanya (huruf kecil semua, karena `translate_uri_dashes = FALSE`).

### 2.3 Base URL yang terkonfigurasi

Dari `application/config/constants.php`:

```php
define('SERVER_URL',       'https://www.tokomedia.org');
define('BASE_URL',         'https://www.tokomedia.org');
define('VIDEO_LINK_S',     'https://61146e7ab7a66.streamlock.net:8089/tokomedia/definst/mp4:');
define('VIDEO_LINK_E',     '/playlist.m3u8');
define('LOCAL_SERVER_URL', 'http://localhost/tokomedia/public/');
define('LOCAL_BASE_URL',   'http://localhost/tokomedia/public/index.php/');
define('TOKEN',            'GANTI_DENGAN_TOKEN_API_BARU');
```

**Status deployment (diverifikasi 15 Okt 2026):** folder API ini **belum terpasang di produksi**. Semua percobaan akses ke `https://www.tokomedia.org/api/...` mengembalikan halaman login website (bukan JSON). Jadi API ini masih tahap pengembangan/lokal.

### 2.4 Cara memanggil (contoh)

```bash
curl -X POST "https://www.tokomedia.org/api/index.php/api/vkitab" \
     -d "token=GANTI_DENGAN_TOKEN_API_BARU"
```

```javascript
const TOKEN = "GANTI_DENGAN_TOKEN_API_BARU";
const res = await fetch(`${BASE}/api/vkitab/language`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ token: TOKEN, id: "144", limit: "20" })
});
const json = await res.json();
```

---

## 3. Konvensi Umum

### 3.1 Autentikasi

Semua endpoint memerlukan field `token` di body POST. Jika salah/kosong:

```json
{ "status": 404, "message": "No Permission", "data": [] }
```

Jika parameter wajib tidak ada:

```json
{ "status": 404, "message": "Parameter is needed", "data": [] }
```

### 3.2 Format respons

```json
{
  "status": 200,
  "message": "Success",
  "data": { }
}
```

`data` bisa berupa **array** (daftar) atau **object** (detail), tergantung endpoint.

### 3.3 Kode `status` internal (BUKAN HTTP status)

| `status` | Arti | Dipakai untuk |
|---|---|---|
| `200` | Success | Berhasil |
| `201` | Peringatan / validasi | Field kurang, bahasa tidak terdaftar, gagal kirim email |
| `404` | Gagal | Token salah, parameter kurang, data tidak ditemukan |

> ⚠️ HTTP status code **selalu 200**. Client harus membaca `status` di dalam JSON, bukan HTTP status.

### 3.4 Parameter umum

| Parameter | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `token` | string | ✅ | Token statis |
| `id` | string/int | tergantung | ID kategori, region, atau bahasa |
| `limit` | int | ❌ | Jumlah maksimum data |
| `offset` | int | ❌ | Mulai dari baris ke-N (default 0) |
| `tag` | string | ❌ | Untuk pencarian tag |

### 3.5 Helper tanggal

`format_indo_date()` di `application/helpers/share_helper.php` mengubah datetime menjadi format `d M Y` (contoh: `2024-08-01 00:13:05` → `01 Aug 24`).

---

## 4. Daftar Endpoint Lengkap

Base: `POST /api/<controller>/<method>`

| # | Controller | Method | Fungsi | Parameter |
|---|---|---|---|---|
| 1 | `aplikasi` | `index` | Daftar region aplikasi | `token` |
| 2 | `aplikasi` | `area` | Daftar aplikasi per region | `token`, `id` |
| 3 | `aplikasi` | `language` | ⚠️ **Bug** – mengembalikan video, bukan aplikasi | `token`, `id` |
| 4 | `aplikasi` | `detail` | ⚠️ **Bug** – mengembalikan video, bukan aplikasi | `token`, `id` |
| 5 | `ckitab` | `index` | Daftar Clip Kitab Suci (kategori 131) | `token`, `limit`, `offset` |
| 6 | `ckitab` | `detail` | Detail clip + rekomendasi | `token`, `id` |
| 7 | `contact` | `index` | Kirim form kontak + email | `token`, `contactname`, `emailaddress`, `phonenumber`, `messagecontent`, `linkid`, `linkname` |
| 8 | `contact` | `infoo` | ⚠️ **Bahaya** – `phpinfo()` terbuka | – |
| 9 | `ikatan` | `index` | Daftar region Film Ikatan Ilahi | `token` |
| 10 | `ikatan` | `area` | Daftar bahasa per region | `token`, `id` |
| 11 | `ikatan` | `language` | Daftar video per kategori | `token`, `id`, `limit`, `offset` |
| 12 | `ikatan` | `languagepref` | Daftar video per slug bahasa | `token`, `id`, `limit` |
| 13 | `other` | `index` | Placeholder (data kosong) | `token` |
| 14 | `other` | `latestvideo` | Video terbaru (kategori 2 & 305) | `token`, `limit`, `offset` |
| 15 | `other` | `commentvideo` | Kirim komentar video + email | `token`, `contactname`, `emailaddress`, `phonenumber`, `messagecontent`, `videoid`, `videotitle` |
| 16 | `other` | `detailvideo` | Detail video + **increment watchcounter** + rekomendasi | `token`, `id` |
| 17 | `other` | `gettag` | Cari video berdasarkan tag | `token`, `tag`, `limit`, `offset` |
| 18 | `other` | `likevideo` | **Increment favoritecounter** | `token`, `id` |
| 19 | `riwayat` | `index` | Daftar region Film Isa Al-Masih | `token` |
| 20 | `riwayat` | `area` | Daftar bahasa per region | `token`, `id` |
| 21 | `riwayat` | `language` | Daftar video per kategori | `token`, `id`, `limit`, `offset` |
| 22 | `riwayat` | `languagepref` | Daftar video per slug bahasa | `token`, `id`, `limit` |
| 23 | `riwayat` | `detail` | Detail video + rekomendasi | `token`, `id` |
| 24 | `vkitab` | `index` | Daftar region Video Kitab Suci | `token` |
| 25 | `vkitab` | `area` | Daftar kitab (id=144) / sub-kategori | `token`, `id` |
| 26 | `vkitab` | `language` | Daftar video per kategori | `token`, `id`, `limit` |
| 27 | `vkitab` | `languagepref` | Daftar video per slug bahasa | `token`, `id`, `limit` |
| 28 | `vkitab` | `custom` | Video per kitab (Matius/Markus/Lukas/Yahya/Kisah) | `token`, `id` |
| 29 | `vkitab` | `detail` | Detail video + rekomendasi | `token`, `id` |
| 30 | `welcome` | `index` | Halaman default CI3 (bukan API) | – |

---

## 5. Detail Endpoint

### 5.1 `aplikasi` — Aplikasi Kitab Suci

#### `POST /api/aplikasi` — Daftar region

**Request:** `token`

**Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    { "id": "indonesia",  "name": "Indonesia" },
    { "id": "sumatera",   "name": "Sumatera" },
    { "id": "jawa",       "name": "Jawa - Bali - Nusa Tenggara" },
    { "id": "kalimantan", "name": "Kalimantan" },
    { "id": "sulawesi",   "name": "Sulawesi" },
    { "id": "maluku",     "name": "Maluku - Papua" }
  ]
}
```

> `id` di sini berupa **slug string**, berbeda dengan `vkitab`/`riwayat` yang memakai **ID numerik**.

#### `POST /api/aplikasi/area` — Daftar aplikasi per region

**Request:** `token`, `id` (salah satu slug di atas)

**Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "name": "Bahasa Muna (2)",
      "url": "https://play.google.com/store/apps/details?id=org.ipsapps.indonesia.muna",
      "thumbnail": "https://www.tokomedia.org/img/appdb/muna.webp",
      "clicked": 0
    }
  ]
}
```

**Sumber data:** tabel `appdb`, difilter lewat kolom `tagging` (`#Sulawesi`, `#Maluku-Papua`, `#Jawa-Bali-NusaTenggara`, `#Kalimantan`, `#Sumatera`, `#Indonesia`).

**Distribusi data `appdb` (269 aktif):**

| Tag | Jumlah |
|---|---|
| `#Sulawesi` | 74 |
| `#Maluku-Papua` | 72 |
| `#Jawa-Bali-NusaTenggara` | 40 |
| `#Kalimantan` | 26 |
| `#Sumatera` | 15 |
| `#Indonesia` / `#indonesia` | 10 |

#### ⚠️ `POST /api/aplikasi/language` dan `/api/aplikasi/detail`

Kedua method ini **salah implementasi** — isinya hasil copy-paste dari `Vkitab`, sehingga memanggil `video_model` dan mengembalikan **data video**, bukan aplikasi. Endpoint ini tidak bisa dipakai.

---

### 5.2 `riwayat` — Film Isa Al-Masih

#### `POST /api/riwayat` — Daftar region

**Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    { "id": 2, "name": "Indonesia",                 "haschild": 0 },
    { "id": 3, "name": "Sumatera",                  "haschild": 1 },
    { "id": 4, "name": "Jawa, Bali, Nusa Tenggara", "haschild": 1 },
    { "id": 5, "name": "Kalimantan",                "haschild": 1 },
    { "id": 6, "name": "Sulawesi",                  "haschild": 1 },
    { "id": 7, "name": "Maluku, Papua",             "haschild": 1 }
  ]
}
```

`haschild` = 0 berarti region tersebut langsung berisi video (tidak punya sub-bahasa).

#### `POST /api/riwayat/area` — Daftar bahasa per region

**Request:** `token`, `id` (2–7)

**Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    { "id": 11, "name": "Aceh" },
    { "id": 12, "name": "Batak Toba" }
  ]
}
```

**Jumlah bahasa per region:**

| Region | ID | Jumlah bahasa |
|---|---|---|
| Indonesia | 2 | 0 (langsung video) |
| Sumatera | 3 | 27 |
| Jawa, Bali, Nusa Tenggara | 4 | 34 |
| Kalimantan | 5 | 28 |
| Sulawesi | 6 | 56 |
| Maluku, Papua | 7 | 32 |

#### `POST /api/riwayat/language` — Video per kategori

**Request:** `token`, `id` (ID kategori dari `/area`), `limit`, `offset`

**Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 123,
      "name": "01 Pada Mulanya Saat Penciptaan - Indonesia",
      "thumbnail": "https://www.tokomedia.org/img/watch/OT6101.jpg",
      "watchcounter": 39327,
      "duration": "08:09",
      "dateschedule": "01 Apr 21"
    }
  ]
}
```

#### `POST /api/riwayat/languagepref` — Video per slug bahasa

**Request:** `token`, `id` (slug, contoh `aceh`), `limit`

Khusus `id = "indonesia"` akan dipetakan ke kategori 2.

Jika bahasa tidak terdaftar:
```json
{ "status": 201, "message": "Bahasa ini tidak terdaftar di Film Isa Al-Masih", "data": [] }
```

#### `POST /api/riwayat/detail` — Detail video

**Request:** `token`, `id` (seq video)

**Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "id": 123,
    "title": "01 Pada Mulanya Saat Penciptaan - Indonesia",
    "content": "Kisah Isa Al-Masih cocok dengan cerita yang lebih besar...",
    "source": "https://61146e7ab7a66.streamlock.net:8089/tokomedia/definst/mp4:1. RIA/RIA Indonesia/01 Pada Mulanya Saat Penciptaan - Indonesia.mp4/playlist.m3u8",
    "duration": "08:09",
    "dateschedule": "01 Apr 21",
    "watchcounter": 39327,
    "tag": "#IsaAlMasih #DubIndonesia #IsaAl-Masih",
    "favcounter": 9168,
    "thumbnail": "https://www.tokomedia.org/img/watch/OT6101.jpg",
    "recomended": [
      {
        "id": 124,
        "title": "02 Kelahiran Isa Al-Masih - Indonesia",
        "duration": "03:44",
        "thumbnail": "https://www.tokomedia.org/img/watch/OT6102.jpg",
        "watchcounter": 2206,
        "dateschedule": "24 Apr 21"
      }
    ]
  }
}
```

> ⚠️ `source` adalah URL **HLS (.m3u8)** dari server Wowza. `sourcelink` di database berisi path dengan spasi (contoh: `1. RIA/RIA Indonesia/01 Pada Mulanya...mp4`) yang **tidak di-encode**, sehingga URL bisa gagal diputar di beberapa player.

---

### 5.3 `vkitab` — Video Kitab Suci

#### `POST /api/vkitab` — Daftar region

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    { "id": "144", "name": "Indonesia",                 "haschild": 1 },
    { "id": "148", "name": "Sumatera",                  "haschild": 1 },
    { "id": "146", "name": "Jawa - Bali - Nusa Tenggara", "haschild": 1 },
    { "id": "149", "name": "Kalimantan",                "haschild": 1 },
    { "id": "147", "name": "Sulawesi",                  "haschild": 1 },
    { "id": "145", "name": "Maluku - Papua",            "haschild": 1 }
  ]
}
```

> `id` di sini **string numerik** (berbeda dengan `aplikasi` yang slug).

#### `POST /api/vkitab/area` — Daftar kitab / sub-kategori

**Request:** `token`, `id`

Jika `id = 144` (Indonesia) → daftar kitab **hardcoded**:
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    { "id": "matius", "name": "Indonesia Matius",              "custom": "yes" },
    { "id": "markus", "name": "Indonesia Markus",              "custom": "yes" },
    { "id": "lukas",  "name": "Indonesia Lukas",               "custom": "yes" },
    { "id": "yahya",  "name": "Indonesia Yahya",               "custom": "yes" },
    { "id": "kisah",  "name": "Indonesia Kisah Para Rasul",    "custom": "yes" }
  ]
}
```

Jika `id` lain → sub-kategori dari tabel `category`:
```json
{ "status": 200, "message": "Success",
  "data": [ { "id": 150, "name": "Alune", "custom": "no" } ] }
```

**Jumlah sub-kategori per region:**

| Region | ID | Jumlah |
|---|---|---|
| Maluku - Papua | 145 | 30 |
| Jawa - Bali - Nusa Tenggara | 146 | 22 |
| Sulawesi | 147 | 39 |
| Sumatera | 148 | 11 |
| Kalimantan | 149 | 5 |

#### `POST /api/vkitab/language` — Video per kategori

**Request:** `token`, `id`, `limit`

#### `POST /api/vkitab/languagepref` — Video per slug bahasa

**Request:** `token`, `id`, `limit`

Khusus `id = "indonesia"` → kategori 144.

#### `POST /api/vkitab/custom` — Video per kitab

**Request:** `token`, `id` = `matius` | `markus` | `lukas` | `yahya` | `kisah`

**Jumlah video per kitab (Bahasa Indonesia):**

| Kitab | Jumlah video |
|---|---|
| Matius | 33 |
| Markus | 34 |
| Lukas | 52 |
| Yahya | 34 |
| Kisah Para Rasul | 56 |

#### `POST /api/vkitab/detail` — Detail video

Sama seperti `riwayat/detail`, ditambah field `dateschedule`.

---

### 5.4 `ckitab` — Clip Kitab Suci

#### `POST /api/ckitab` — Daftar clip

**Request:** `token`, `limit`, `offset`

Kategori **hardcoded = 131** (Clip Kitab Suci Indonesia). Total **39 video**.

**Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1234,
      "name": "Judul Clip",
      "watchcounter": 120,
      "dateschedule": "2024-08-01 00:13:05",
      "duration": "02:30",
      "thumbnail": "https://www.tokomedia.org/img/watch/xxx.jpg"
    }
  ]
}
```

> ⚠️ `dateschedule` di sini **belum diformat** (raw datetime), berbeda dengan endpoint lain yang memakai `format_indo_date()`.

#### `POST /api/ckitab/detail` — Detail clip

Sama seperti `riwayat/detail` + `recomended`.

---

### 5.5 `ikatan` — Film Ikatan Ilahi

#### `POST /api/ikatan` — Daftar region

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    { "id": 305, "name": "Indonesia",                 "haschild": 0 },
    { "id": 306, "name": "Sumatera",                  "haschild": 1 },
    { "id": 307, "name": "Jawa - Bali - Nusa Tenggara", "haschild": 1 },
    { "id": 308, "name": "Kalimantan",                "haschild": 1 },
    { "id": 309, "name": "Sulawesi",                  "haschild": 1 },
    { "id": 310, "name": "Maluku - Papua",            "haschild": 1 }
  ]
}
```

#### `POST /api/ikatan/area` — Daftar bahasa per region

**Request:** `token`, `id`

| Region | ID | Jumlah bahasa |
|---|---|---|
| Sumatera | 306 | 4 |
| Jawa - Bali - Nusa Tenggara | 307 | 2 |
| Sulawesi | 309 | 2 |
| Kalimantan | 308 | 0 |
| Maluku - Papua | 310 | 0 |

#### `POST /api/ikatan/language` — Video per kategori

**Request:** `token`, `id`, `limit`, `offset`

#### `POST /api/ikatan/languagepref` — Video per slug bahasa

**Request:** `token`, `id`, `limit`

Khusus `id = "indonesia"` → kategori 305.

> ⚠️ Controller `Ikatan` **tidak punya method `detail`**. Detail video harus diambil lewat `other/detailvideo`.

---

### 5.6 `other` — Fungsi Umum

#### `POST /api/other/latestvideo` — Video terbaru

**Request:** `token`, `limit`, `offset`

Mengambil video dari kategori **2 (RIA Indonesia)** dan **305 (Ikatan Ilahi Indonesia)**, diurutkan `dateschedule DESC`.

**Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 17000,
      "name": "Ikatan Ilahi 12 - Pembaharuan Ikatan - Indonesia",
      "thumbnail": "https://www.tokomedia.org/img/watch/cache/Ikatan Ilahi 12-390x218.jpg",
      "watchcounter": 10222,
      "duration": "10.11",
      "dateschedule": "01 Aug 24"
    }
  ]
}
```

#### `POST /api/other/detailvideo` — Detail video + hitung view

**Request:** `token`, `id`

Berbeda dari `riwayat/detail`: endpoint ini **menaikkan `watchcounter` +1** dan menyimpannya ke database.

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "id": 17000,
    "title": "Ikatan Ilahi 12 - Pembaharuan Ikatan - Indonesia",
    "content": "...",
    "source": "https://61146e7ab7a66.streamlock.net:8089/.../playlist.m3u8",
    "duration": "10.11",
    "watchcounter": 10223,
    "dateschedule": "01 Aug 24",
    "tag": "#IkatanIlahi",
    "favcounter": 693,
    "thumbnail": "https://www.tokomedia.org/img/watch/cache/...jpg",
    "recomended": [ ]
  }
}
```

#### `POST /api/other/likevideo` — Like video

**Request:** `token`, `id`

Menaikkan `favoritecounter` +1.

```json
{ "status": 200, "message": "Terimakasih telah menyukai video ini", "data": { "totallike": 694 } }
```

> ⚠️ Tidak ada proteksi duplikat — 1 user bisa like berkali-kali.

#### `POST /api/other/gettag` — Cari video berdasarkan tag

**Request:** `token`, `tag`, `limit`, `offset`

Mencari dengan `tagging LIKE '%<tag>%'`.

#### `POST /api/other/commentvideo` — Kirim komentar video

**Request:** `token`, `contactname`, `emailaddress`, `phonenumber`, `messagecontent`, `videoid`, `videotitle`

Menyimpan ke tabel `videocomment` **dan** mengirim email ke `info@tokomedia.org`.

```json
{ "status": 200, "message": "Terimakasih telah meninggalkan Komentar", "data": { } }
```

---

### 5.7 `contact` — Form Kontak

#### `POST /api/contact` — Kirim pesan kontak

**Request:** `token`, `contactname`, `emailaddress`, `phonenumber`, `messagecontent`, `linkid`, `linkname`

```json
{ "status": 200, "message": "Terimakasih telah menghubungi kami. Kami akan segera merespon anda", "data": { } }
```

> ⚠️ **Bug:** `Contact_model::insert_contact()` menulis ke tabel **`contact`**, tetapi tabel tersebut **tidak ada** di dump database. Tabel yang tersedia adalah **`contributor`** (struktur kolom identik). Akibatnya insert akan gagal dan API mengembalikan `status: 201`.

#### ⚠️ `GET /api/contact/infoo`

Menjalankan `phpinfo()` tanpa autentikasi — membocorkan konfigurasi server (path, versi PHP, environment variable, kredensial). **Harus dihapus sebelum deploy.**

---

## 6. Model Data

### 6.1 Tabel yang dipakai API

| Tabel | Baris | Dipakai oleh | Keterangan |
|---|---|---|---|
| `videodb` | 16.586 | semua controller video | Sumber utama video |
| `category` | 321 | `riwayat`, `vkitab`, `ikatan` | Hierarki kategori (self-referencing `parentid`) |
| `appdb` | 275 | `aplikasi` | Daftar aplikasi Android |
| `videocomment` | 640 | `other/commentvideo` | Komentar video |
| `contributor` | 18 | *(tidak dipakai API)* | Tabel kontak yang sebenarnya |
| `contact` | **tidak ada** | `contact` | ⚠️ Dirujuk model tapi tidak ada |
| `apppohon` | 12 | *(tidak dipakai API)* | Aplikasi "Pohon Kehidupan" |
| `routerdb` | 17.107 | *(tidak dipakai API)* | Routing URL website |
| `user`, `user_login` | 4 + 4 | *(tidak dipakai API)* | Admin website |
| `config`, `privileges`, `privilegepath`, `loginschedule`, `newsletter`, `slideshows` | – | *(tidak dipakai API)* | Konfigurasi & admin |

### 6.2 Struktur `videodb`

| Kolom | Tipe | Dipakai API | Keterangan |
|---|---|---|---|
| `seq` | int PK | ✅ | ID video |
| `displayname` | varchar | ✅ | Judul |
| `messagecontent` | text | ✅ | Deskripsi/sinopsis |
| `slug` | varchar | ❌ | URL slug website |
| `youtubelink` | varchar | ❌ | Link YouTube (14.397 video) |
| `embedlink` | varchar | ❌ | ID embed YouTube |
| `sourcelink` | varchar | ✅ | Path file di server Wowza |
| `duration` | varchar | ✅ | Durasi |
| `createddate` | datetime | ❌ | Tanggal dibuat |
| `watchcounter` | bigint | ✅ | Jumlah view |
| `categoryarray` | int | ✅ | FK ke `category.seq` |
| `tagging` | text | ✅ | Tag dipisah spasi |
| `favoritecounter` | bigint | ✅ | Jumlah like |
| `thumbnail` | varchar | ✅ | Path thumbnail |
| `isdeleted` | tinyint | ✅ | Soft delete |
| `datedeleted` | datetime | ❌ | |
| `datemodified` | datetime | ❌ | |
| `dateschedule` | datetime | ✅ | Tanggal tayang |
| `downloadcounter` | bigint | ❌ | Jumlah download |

### 6.3 Struktur `category`

| Kolom | Keterangan |
|---|---|
| `seq` | PK |
| `categoryname` | Nama kategori/bahasa |
| `slug` | Slug URL |
| `description` | Deskripsi |
| `parentid` | Parent (0 = root) |
| `thumbnail` | Path thumbnail |

**Hierarki root:**

| Root | Nama | Jumlah video |
|---|---|---|
| 1 | Film Isa Al-Masih | 11.036 |
| 126 | Video Kitab Suci | 5.401 |
| 304 | Ikatan Ilahi | 110 |
| 127 | Clip Kitab Suci | 39 |
| 128 | Audio Kitab Suci | 0 |
| 129 | Media Lainnya | 0 |
| 125 | Kitab Injil Yahya | 0 |

### 6.4 Struktur `appdb`

| Kolom | Keterangan |
|---|---|
| `counter` | PK |
| `appname` | Nama aplikasi |
| `slug` | Slug |
| `description` | Deskripsi |
| `downloadlink` | Link Play Store |
| `clicked` | Jumlah klik |
| `appimage` | Path gambar |
| `createddate`, `datemodified`, `datedeleted` | Timestamp |
| `isdeleted` | Soft delete |
| `tagging` | Tag region (`#Sulawesi`, dll) |
| `playstorename` | Nama di Play Store |

---

## 7. Peta Data: API vs Website tokomedia.org

### 7.1 Halaman website yang ada

| Halaman website | URL | Sumber data |
|---|---|---|
| Home | `/` | `category`, `videodb` |
| Film Isa Al-Masih (semua bahasa) | `/film-riwayat-isa-al-masih` | `category` |
| Film Isa Al-Masih per bahasa | `/film-riwayat-isa-al-masih/{slug}` | `videodb` |
| Tonton video | `/film-riwayat-isa-al-masih/{slug}/w/{video-slug}` | `videodb` |
| Film Ikatan Ilahi | `/film-ikatan-ilahi` | `category` |
| Film Ikatan Ilahi per bahasa | `/film-ikatan-ilahi/{slug}` | `videodb` |
| Video Kitab Suci | `/film-kitab-suci-injil` | `category` |
| Video Kitab Suci per kitab | `/video-kitab-suci/indonesia/injil-suci-matius` | `videodb` (tag) |
| Clip Kitab Suci | `/clip/indonesia` | `videodb` |
| Koleksi Aplikasi | `/koleksi-aplikasi` | `appdb` |
| Detail Aplikasi | `/app/p/{slug}` | `appdb` |
| Kontak | `/contact` | `contributor` |
| Pencarian | `/search/v/?v={query}` | `videodb` |
| Admin | `/manage/*`, `/master/*` | semua tabel |

### 7.2 Matriks cakupan API

| Kebutuhan website | Endpoint API | Status |
|---|---|---|
| Home – daftar kategori utama | – | ❌ **Tidak ada** |
| Home – daftar bahasa (letter grid) | `riwayat/area`, `vkitab/area`, `ikatan/area` | ⚠️ Per-region, tidak ada endpoint "semua bahasa" |
| Home – tayangan terbaru | `other/latestvideo` | ✅ Ada (hanya kategori 2 & 305) |
| Film Isa Al-Masih – region | `riwayat` | ✅ |
| Film Isa Al-Masih – bahasa | `riwayat/area` | ✅ |
| Film Isa Al-Masih – daftar video | `riwayat/language`, `riwayat/languagepref` | ✅ |
| Film Isa Al-Masih – detail video | `riwayat/detail` | ✅ |
| Film Ikatan Ilahi – region | `ikatan` | ✅ |
| Film Ikatan Ilahi – bahasa | `ikatan/area` | ✅ |
| Film Ikatan Ilahi – daftar video | `ikatan/language`, `ikatan/languagepref` | ✅ |
| Film Ikatan Ilahi – detail video | – | ⚠️ Pakai `other/detailvideo` |
| Video Kitab Suci – region | `vkitab` | ✅ |
| Video Kitab Suci – bahasa | `vkitab/area` | ✅ |
| Video Kitab Suci – daftar video | `vkitab/language`, `vkitab/languagepref` | ✅ |
| Video Kitab Suci – per kitab | `vkitab/custom` | ✅ |
| Video Kitab Suci – detail video | `vkitab/detail` | ✅ |
| Clip Kitab Suci – daftar | `ckitab` | ✅ |
| Clip Kitab Suci – detail | `ckitab/detail` | ✅ |
| Aplikasi – daftar per region | `aplikasi/area` | ✅ |
| Aplikasi – **semua** aplikasi | – | ❌ **Tidak ada** |
| Aplikasi – detail aplikasi | – | ❌ **Tidak ada** (`aplikasi/detail` rusak) |
| Kontak – kirim pesan | `contact` | ⚠️ Ada tapi **gagal** (tabel `contact` tidak ada) |
| Komentar video | `other/commentvideo` | ✅ |
| Like video | `other/likevideo` | ✅ |
| Pencarian | `other/gettag` | ⚠️ Hanya by tag, bukan full-text |
| Pencarian (seperti website) | – | ❌ **Tidak ada** |
| Kebijakan Privasi | – | ❌ Tidak ada (statis di UI) |
| Audio Kitab Suci | – | ❌ Tidak ada (kategori 128 kosong) |
| Media Lainnya | – | ❌ Tidak ada (kategori 129 kosong) |
| Admin / manajemen konten | – | ❌ Tidak ada (di luar cakupan) |

### 7.3 Ringkasan kesenjangan

**Sudah tercakup (≈70%):** seluruh alur tonton video (4 kategori konten), daftar bahasa per region, detail video + rekomendasi, komentar, like, aplikasi per region.

**Belum tercakup:**

1. **Endpoint "semua bahasa"** — website menampilkan 100 bahasa di home (`homeLanguages`), API hanya bisa per-region.
2. **Daftar semua aplikasi** — website `/koleksi-aplikasi` menampilkan 269 aplikasi sekaligus; API hanya per-region.
3. **Detail aplikasi** — website punya `/app/p/{slug}`; `aplikasi/detail` rusak.
4. **Pencarian full-text** — website `/search/v/?v=` mencari di judul + deskripsi + tag; API hanya `gettag`.
5. **Daftar kategori utama** — untuk membangun home page.
6. **Kontak** — endpoint ada tapi gagal karena tabel salah.
7. **Audio Kitab Suci & Media Lainnya** — kategori ada di database tapi belum ada controller.
8. **Sorting** — UI baru (`TokoMediaUI`) punya chip Tren/Populer/Unseen/New/Old; API hanya bisa urut `dateschedule DESC` (latestvideo) atau default.
9. **Pagination metadata** — tidak ada `total`, `page`, `has_more` di respons.
10. **Detail video tanpa menambah view** — `other/detailvideo` selalu menambah `watchcounter`; tidak ada varian "read-only".

---

## 8. Catatan Teknis & Risiko

### 8.1 Keamanan

| # | Tingkat | Temuan | Lokasi |
|---|---|---|---|
| 1 | 🔴 Kritis | `phpinfo()` terbuka tanpa autentikasi | `Contact::infoo()` |
| 2 | 🔴 Kritis | Kredensial SMTP hardcoded di source code | `Contact::send_email_smtp()`, `Other::send_email_smtp()` |
| 3 | 🔴 Kritis | Token API hardcoded & dipakai bersama semua client | `constants.php` |
| 4 | 🟠 Tinggi | SQL injection via `LIKE` tanpa escaping | `Video_model::get_vkitab_by_book()`, `get_by_tag()` |
| 5 | 🟠 Tinggi | SQL injection via subquery string concat | `Category_model::get_category_name_by_pref()` |
| 6 | 🟡 Sedang | Password hash SHA-1 tanpa salt | tabel `user_login` |
| 7 | 🟡 Sedang | Tidak ada rate limiting pada `likevideo` / `detailvideo` | `Other` |
| 8 | 🟡 Sedang | Tidak ada validasi format email/telepon | `Contact`, `Other::commentvideo` |
| 9 | ⚪ Rendah | `db_debug` aktif saat non-production | `database.php` |

### 8.2 Bug fungsional

| # | Bug | Lokasi |
|---|---|---|
| 1 | `aplikasi/language` & `aplikasi/detail` mengembalikan data video | `Aplikasi.php` |
| 2 | `contact` menulis ke tabel `contact` yang tidak ada | `Contact_model.php` |
| 3 | `Videocomment_model::get_by_videoid()` memanggil `fresult_array()` (typo) | `Videocomment_model.php` |
| 4 | `Video_model::delete_video()` menghapus dari tabel `video` (bukan `videodb`) | `Video_model.php` |
| 5 | `ckitab` tidak memformat `dateschedule` | `Ckitab.php` |
| 6 | `Ikatan` tidak punya method `detail` | `Ikatan.php` |
| 7 | `Aplikasi::index` mendefinisikan `$response` dua kali (dead code) | `Aplikasi.php` |
| 8 | `Category_model::get_category_name_by_pref()` error jika hasil kosong (`$result['seq']` pada `null`) | `Category_model.php` |
| 9 | `sourcelink` tidak di-URL-encode saat membentuk `source` | semua controller detail |
| 10 | `MY_Controller` memuat `user_model` yang tidak ada di folder models | `MY_Controller.php` |

### 8.3 Catatan implementasi

- **Tidak ada `routes.php` kustom** → URL bergantung nama class/method. Kalau ingin `api/v1/...`, perlu tambah route.
- **Tidak ada `.htaccess` di root** → URL harus menyertakan `index.php` kecuali server dikonfigurasi lain.
- **`autoload`** memuat helper `url`, `template`, `form`, `share` dan library `session` di setiap request.
- **`config.php`**: `base_url` kosong, `index_page = 'index.php'`, `encryption_key` kosong.
- **`database.php`**: kredensial masih placeholder (`root` / `YourmySQLipasswordhere`) — perlu diisi saat deploy.
- **`composer.json`** hanya mendeklarasikan CodeIgniter framework; tidak ada dependency tambahan.

---

## 9. Rekomendasi

### Prioritas 1 — Sebelum deploy
1. Hapus `Contact::infoo()`.
2. Pindahkan kredensial SMTP & token ke environment variable / file config di luar web root.
3. Perbaiki `Contact_model` agar menulis ke tabel `contributor`.
4. Perbaiki `aplikasi/language` & `aplikasi/detail` agar memakai `App_model`.
5. Tambahkan escaping pada semua query `LIKE` dan subquery.

### Prioritas 2 — Agar API bisa menggantikan website
6. Tambah endpoint `category/tree` (semua kategori + hierarki) untuk home page.
7. Tambah endpoint `app/list` (semua aplikasi, dengan pagination) dan `app/detail`.
8. Tambah endpoint `search` (full-text di `displayname`, `messagecontent`, `tagging`).
9. Tambah endpoint `language/all` (semua bahasa lintas region).
10. Tambah controller `audio` dan `media` untuk kategori 128 & 129.
11. Tambahkan metadata pagination (`total`, `page`, `per_page`, `has_more`) di semua respons daftar.
12. Tambah parameter `sort` (`trending`/`popular`/`newest`/`oldest`) agar mendukung chip sorting di UI baru.

### Prioritas 3 — Perbaikan kualitas
13. Standarkan format tanggal (semua pakai `format_indo_date()` atau ISO 8601).
14. Tambah `detail` di controller `Ikatan`.
15. Tambah varian detail video tanpa increment `watchcounter`.
16. Tambah proteksi duplikat pada `likevideo` (berbasis device/IP).
17. Tambah validasi input (email, telepon, panjang pesan).
18. Tambah rate limiting.
19. Ganti hash password SHA-1 ke `password_hash()` (bcrypt/argon2).
20. Tambah dokumentasi OpenAPI/Swagger.

---

## 10. Lampiran — Contoh Pemakaian Lengkap

### Alur: menampilkan Film Isa Al-Masih bahasa Aceh

```javascript
const BASE  = "https://www.tokomedia.org/api/index.php/api";
const TOKEN = "GANTI_DENGAN_TOKEN_API_BARU";

const post = (path, body) =>
  fetch(`${BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token: TOKEN, ...body })
  }).then(r => r.json());

// 1. Ambil daftar region
const regions = await post("riwayat", {});
// → [{ id: 2, name: "Indonesia", haschild: 0 }, { id: 3, name: "Sumatera", haschild: 1 }, ...]

// 2. Ambil bahasa di region Sumatera (id=3)
const langs = await post("riwayat/area", { id: 3 });
// → [{ id: 11, name: "Aceh" }, ...]

// 3. Ambil video bahasa Aceh (id=11)
const videos = await post("riwayat/language", { id: 11, limit: 20, offset: 0 });

// 4. Ambil detail video
const detail = await post("riwayat/detail", { id: videos.data[0].id });
// → { data: { title, content, source, duration, watchcounter, recomended: [...] } }
```

### Alur: menampilkan aplikasi region Sulawesi

```javascript
const areas = await post("aplikasi", {});
// → [{ id: "sulawesi", name: "Sulawesi" }, ...]

const apps = await post("aplikasi/area", { id: "sulawesi" });
// → [{ name, url, thumbnail, clicked }, ...]  (74 aplikasi)
```

### Alur: kirim komentar video

```javascript
await post("other/commentvideo", {
  contactname:    "Nama Pengguna",
  emailaddress:   "user@example.com",
  phonenumber:    "+628123456789",
  messagecontent: "Video ini sangat memberkati.",
  videoid:        17000,
  videotitle:     "Ikatan Ilahi 12 - Pembaharuan Ikatan - Indonesia"
});
```

---

*Dokumen ini dibuat berdasarkan analisis statis kode sumber dan dump database per 15 Oktober 2026.*
