<?php
defined('BASEPATH') or exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| TokoMedia API — Secrets
|--------------------------------------------------------------------------
| Kredensial TIDAK boleh ditulis langsung di source code.
|
| Urutan pengambilan nilai:
|   1. Environment variable (disarankan untuk produksi)
|   2. application/config/secrets.local.php (untuk pengembangan lokal,
|      berkas ini TIDAK di-commit ke Git)
|
| Jika nilai kosong, API akan menolak semua request ("No Permission")
| dan pengiriman email akan gagal — ini disengaja agar aman secara default.
|
| Environment variable yang dikenali:
|   TM_API_TOKEN, TM_SMTP_HOST, TM_SMTP_PORT, TM_SMTP_USER, TM_SMTP_PASS,
|   TM_SMTP_CRYPTO, TM_SMTP_FROM, TM_SMTP_FROM_NAME, TM_SMTP_TO
*/

$tm_local = array();
$tm_local_file = __DIR__ . '/secrets.local.php';
if (is_file($tm_local_file)) {
	$tm_local = include $tm_local_file;
	if (!is_array($tm_local)) {
		$tm_local = array();
	}
}

if (!function_exists('tm_secret')) {
	function tm_secret($key, $local, $default = '')
	{
		$value = getenv($key);
		if ($value === false || $value === '') {
			$value = isset($_SERVER[$key]) ? $_SERVER[$key] : '';
		}
		if ($value === '') {
			$value = isset($local[$key]) ? $local[$key] : $default;
		}
		return $value;
	}
}

defined('TOKEN') or define('TOKEN', tm_secret('TM_API_TOKEN', $tm_local));
defined('SMTP_HOST') or define('SMTP_HOST', tm_secret('TM_SMTP_HOST', $tm_local));
defined('SMTP_PORT') or define('SMTP_PORT', (int) tm_secret('TM_SMTP_PORT', $tm_local, 587));
defined('SMTP_USER') or define('SMTP_USER', tm_secret('TM_SMTP_USER', $tm_local));
defined('SMTP_PASS') or define('SMTP_PASS', tm_secret('TM_SMTP_PASS', $tm_local));
defined('SMTP_CRYPTO') or define('SMTP_CRYPTO', tm_secret('TM_SMTP_CRYPTO', $tm_local, 'tls'));
defined('SMTP_FROM') or define('SMTP_FROM', tm_secret('TM_SMTP_FROM', $tm_local));
defined('SMTP_FROM_NAME') or define('SMTP_FROM_NAME', tm_secret('TM_SMTP_FROM_NAME', $tm_local, 'Mobile Apps'));
defined('SMTP_TO') or define('SMTP_TO', tm_secret('TM_SMTP_TO', $tm_local));
