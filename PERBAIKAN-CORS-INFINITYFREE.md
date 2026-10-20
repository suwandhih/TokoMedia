# Perbaikan CORS API TokoMedia di InfinityFree

**Masalah:** UI di GitHub Pages tidak bisa memanggil API di `suwandhih.site.je`.
Console browser melaporkan error CORS.

**Sebab:** berkas `application/config/config.php` yang terpasang di hosting masih
**versi lama** (tanpa `$config['cors_origins']`). Akibatnya hook CORS tidak punya
daftar origin yang diizinkan, sehingga header `Access-Control-Allow-Origin`
tidak pernah dikirim.

**Perkiraan waktu: ±5 menit.** Hanya **1 berkas** yang perlu diganti.

---

## Bukti diagnosis

| Berkas | Zip client asli (14 Okt) | Zip infinityfree (19 Okt) |
|---|---|---|
| `application/config/config.php` | 19.257 B — **tanpa** `cors_origins` | 19.797 B — **ada** `cors_origins` |
| `application/config/hooks.php` | 430 B — **tanpa** hook CORS | 772 B — **ada** hook CORS |
| `application/hooks/Api_cors.php` | **tidak ada** | ada (1.341 B) |

Di server Bapak, `hooks.php` dan `Api_cors.php` sudah versi baru, tetapi
`config.php` masih versi lama. Ciri khasnya: header
`Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, dan
`Access-Control-Max-Age` **ada**, tetapi `Access-Control-Allow-Origin`
**tidak ada**.

---

## Langkah perbaikan

### 1. Masuk File Manager

1. Buka <https://dash.infinityfree.com/>
2. Pilih akun `if0_43217990` (`suwandhih.site.je`)
3. Klik **File Manager** (atau **Control Panel** → VistaPanel → File Manager)

### 2. Cadangkan `config.php` yang lama

1. Masuk folder `htdocs/application/config/`
2. Klik kanan `config.php` → **Download** (simpan sebagai cadangan di komputer)
3. Setelah terunduh, klik kanan `config.php` → **Rename** → `config.php.bak`

> Langkah ini penting agar bisa dikembalikan bila ada masalah.

### 3. Unggah `config.php` yang baru

1. Di komputer, buka `Backup/tokomedia-api-infinityfree.zip`
2. Ekstrak hanya berkas `application/config/config.php`
3. Di File Manager (masih di `htdocs/application/config/`), klik **Upload**
4. Pilih `config.php` hasil ekstrak tadi
5. Pastikan nama berkasnya tepat `config.php` (bukan `config (1).php`)

### 4. Pastikan 2 berkas pendukung sudah versi baru

Masih di File Manager, cek:

| Lokasi | Yang harus ada |
|---|---|
| `htdocs/application/config/hooks.php` | baris `$hook['post_controller_constructor'][]` dengan `'class' => 'Api_cors'` |
| `htdocs/application/hooks/Api_cors.php` | berkas ada, ukuran ±1.341 B |

Bila salah satu belum ada, unggah juga dari zip yang sama.

### 5. Verifikasi isi `config.php`

Buka `htdocs/application/config/config.php` di File Manager (klik kanan → **Edit**),
cari baris ini:

```php
$config['cors_origins'] = array(
	'https://suwandhih.github.io',
	'https://tokomedia.org',
	'https://www.tokomedia.org',
);
```

Bila baris ini **ada** → perbaikan berhasil dipasang.

---

## Uji hasil perbaikan

> ⚠️ `curl` **tidak bisa** dipakai untuk InfinityFree (diblokir User-Agent
> non-browser + ada tantangan JavaScript AES). Uji **wajib dari browser**.

1. Buka <https://suwandhih.github.io/TokoMedia/> di browser
2. Tekan **F12** → tab **Console**
3. Tempel perintah ini (ganti `<TOKEN>` dengan token API):

```js
fetch('https://suwandhih.site.je/index.php/api/category/tree', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  body: 'token=<TOKEN>'
}).then(r => {
  console.log('ACAO =', r.headers.get('access-control-allow-origin'));
  return r.json();
}).then(d => console.log('status =', d.status, '| jumlah kategori =', d.data.length));
```

**Hasil yang benar:**

```
ACAO = https://suwandhih.github.io
status = 200 | jumlah kategori = 7
```

Bila `ACAO = null` → `config.php` belum tergantikan, atau browser masih memakai
cache. Coba **Ctrl+Shift+R** (hard reload) lalu ulangi.

---

## Setelah berhasil

1. Hapus `config.php.bak` dari `htdocs/application/config/` agar tidak tertinggal
2. Muat ulang <https://suwandhih.github.io/TokoMedia/> — data dari API akan
   menggantikan data bawaan di halaman

---

## Catatan

- **Jangan** memakai `Access-Control-Allow-Origin: *`. Wildcard membuat API dapat
  dipanggil dari situs mana pun. Cukup daftarkan origin yang benar-benar dipakai.
- CORS hanya berlaku di **browser**. Aplikasi Android native tidak mengirim header
  `Origin` dan tidak terpengaruh CORS sama sekali.
- Referensi teknis lengkap: `20261014 API TM App/DEPLOY.md` bagian **8. Troubleshooting CORS**.
