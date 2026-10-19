<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Header CORS untuk seluruh endpoint API.
 *
 * UI TokoMedia (GitHub Pages) memanggil API dari origin berbeda, sehingga
 * browser memerlukan Access-Control-Allow-Origin. Daftar origin yang diizinkan
 * diatur di application/config/config.php pada $config['cors_origins'].
 *
 * Request dari UI memakai application/x-www-form-urlencoded sehingga tergolong
 * "simple request" (tanpa preflight). Preflight OPTIONS tetap ditangani agar
 * aman bila nanti header request berubah.
 */
class Api_cors
{
	public function handle()
	{
		$CI =& get_instance();
		$allowed = $CI->config->item('cors_origins');
		if (!is_array($allowed)) {
			$allowed = array();
		}

		$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
		if ($origin !== '' && in_array($origin, $allowed, TRUE)) {
			header('Access-Control-Allow-Origin: ' . $origin);
			header('Vary: Origin');
		}

		header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
		header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
		header('Access-Control-Max-Age: 86400');

		if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
			http_response_code(204);
			header('Content-Length: 0');
			exit;
		}
	}
}
