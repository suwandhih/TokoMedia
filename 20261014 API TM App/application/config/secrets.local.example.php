<?php
defined('BASEPATH') or exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| TokoMedia API — Secrets (CONTOH)
|--------------------------------------------------------------------------
| Salin berkas ini menjadi `secrets.local.php` di server, lalu isi nilainya.
| Berkas `secrets.local.php` TIDAK di-commit ke Git (lihat .gitignore).
|
| Alternatif yang lebih aman untuk produksi: set environment variable
| dengan nama yang sama (TM_API_TOKEN, TM_SMTP_HOST, dst).
*/

return array(
	'TM_API_TOKEN' => 'ganti-dengan-token-baru',
	'TM_SMTP_HOST' => 'smtp.contoh.com',
	'TM_SMTP_PORT' => 587,
	'TM_SMTP_USER' => 'info@contoh.com',
	'TM_SMTP_PASS' => 'password-smtp',
	'TM_SMTP_CRYPTO' => 'tls',
	'TM_SMTP_FROM' => 'info@contoh.com',
	'TM_SMTP_FROM_NAME' => 'Mobile Apps',
	'TM_SMTP_TO' => 'info@contoh.com',

	// Database (diisi dari cPanel/VistaPanel byet.host)
	'TM_DB_HOST' => 'sqlXXX.byethostX.com',
	'TM_DB_USER' => 'bXX_XXXXXXX',
	'TM_DB_PASS' => 'password-database',
	'TM_DB_NAME' => 'bXX_XXXXXXX_tokomedia',
	'TM_DB_PORT' => 3306,
);
