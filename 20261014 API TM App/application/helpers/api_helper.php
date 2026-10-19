<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Helper bersama untuk seluruh controller API.
 * Menyatukan validasi token, format respons, pagination, dan sorting.
 */

if (!function_exists('api_token_valid')) {
    function api_token_valid()
    {
        if (!isset($_POST['token']) || TOKEN === '') {
            return false;
        }
        return hash_equals((string) TOKEN, (string) $_POST['token']);
    }
}

if (!function_exists('api_out')) {
    function api_out($status, $message, $data = array(), $extra = array())
    {
        $payload = array(
            'status' => $status,
            'message' => $message,
            'data' => $data,
        );
        foreach ($extra as $key => $value) {
            $payload[$key] = $value;
        }
        echo json_encode($payload);
    }
}

if (!function_exists('api_require_token')) {
    /**
     * Validasi token. Mengirim respons error dan mengembalikan FALSE bila gagal.
     */
    function api_require_token()
    {
        if (!isset($_POST['token'])) {
            api_out(404, 'Parameter is needed');
            return false;
        }
        if (!api_token_valid()) {
            api_out(404, 'No Permission');
            return false;
        }
        return true;
    }
}

if (!function_exists('api_page_params')) {
    /**
     * Ambil parameter pagination dari POST.
     *
     * Mendukung dua gaya: `page` + `per_page`, atau `limit` + `offset` (gaya lama).
     * $default_per_page = 0 berarti tanpa batas (perilaku lama tetap terjaga).
     *
     * @return array{page:int, per_page:int, offset:int}
     */
    function api_page_params($default_per_page = 0, $max_per_page = 100)
    {
        $page = isset($_POST['page']) ? (int) $_POST['page'] : 0;
        $per_page = isset($_POST['per_page']) ? (int) $_POST['per_page'] : 0;
        $limit = isset($_POST['limit']) ? (int) $_POST['limit'] : 0;
        $offset = isset($_POST['offset']) ? (int) $_POST['offset'] : 0;

        if ($per_page <= 0) {
            $per_page = $limit > 0 ? $limit : $default_per_page;
        }
        if ($max_per_page > 0 && $per_page > $max_per_page) {
            $per_page = $max_per_page;
        }
        if ($offset < 0) {
            $offset = 0;
        }

        if ($page > 0) {
            $offset = ($page - 1) * ($per_page > 0 ? $per_page : 1);
        } elseif ($per_page > 0) {
            $page = (int) floor($offset / $per_page) + 1;
        } else {
            $page = 1;
        }

        return array('page' => $page, 'per_page' => $per_page, 'offset' => $offset);
    }
}

if (!function_exists('api_pagination')) {
    /**
     * Metadata pagination. `per_page` 0 berarti tanpa batas (semua baris).
     */
    function api_pagination($total, $page, $per_page)
    {
        $total = (int) $total;
        $per_page = (int) $per_page;
        if ($per_page <= 0) {
            return array(
                'total' => $total,
                'page' => 1,
                'per_page' => $total,
                'has_more' => false,
            );
        }
        return array(
            'total' => $total,
            'page' => (int) $page,
            'per_page' => $per_page,
            'has_more' => ($page * $per_page) < $total,
        );
    }
}

if (!function_exists('api_sort')) {
    /**
     * Validasi parameter `sort` dari POST.
     */
    function api_sort($allowed = null, $default = 'default')
    {
        if ($allowed === null) {
            $allowed = array('default', 'trending', 'popular', 'newest', 'oldest', 'unseen');
        }
        $sort = isset($_POST['sort']) ? strtolower(trim((string) $_POST['sort'])) : '';
        if ($sort === '' || !in_array($sort, $allowed, true)) {
            return $default;
        }
        return $sort;
    }
}

if (!function_exists('api_apply_sort')) {
    /**
     * Terapkan ORDER BY sesuai kunci sort pada query builder.
     *
     * @param CI_DB_query_builder $db
     * @param string              $sort
     */
    function api_apply_sort($db, $sort)
    {
        switch ($sort) {
            case 'trending':
                $db->order_by('watchcounter', 'DESC');
                $db->order_by('seq', 'DESC');
                break;
            case 'popular':
                $db->order_by('favoritecounter', 'DESC');
                $db->order_by('watchcounter', 'DESC');
                break;
            case 'newest':
                $db->order_by('dateschedule', 'DESC');
                $db->order_by('seq', 'DESC');
                break;
            case 'oldest':
                $db->order_by('dateschedule', 'ASC');
                $db->order_by('seq', 'ASC');
                break;
            case 'unseen':
                $db->order_by('watchcounter', 'ASC');
                $db->order_by('seq', 'ASC');
                break;
            default:
                $db->order_by('seq', 'ASC');
                break;
        }
    }
}

if (!function_exists('api_video_item')) {
    /**
     * Bentuk satu baris `videodb` menjadi item ringkas untuk daftar.
     *
     * `dateschedule` tetap berformat Indonesia (kompatibel dengan client lama),
     * `dateschedule_iso` menyediakan ISO 8601 untuk sorting/parsing di client baru.
     */
    function api_video_item($row, $with_date = true)
    {
        $item = array(
            'id' => (int) $row['seq'],
            'name' => $row['displayname'],
            'thumbnail' => SERVER_URL . $row['thumbnail'],
            'watchcounter' => (int) $row['watchcounter'],
            'duration' => $row['duration'],
        );
        if ($with_date) {
            $item['dateschedule'] = format_indo_date($row['dateschedule']);
            $item['dateschedule_iso'] = api_iso_date($row['dateschedule']);
        }
        return $item;
    }
}

if (!function_exists('api_iso_date')) {
    /**
     * Ubah datetime database menjadi ISO 8601 (WIB). Null/zero-date -> null.
     */
    function api_iso_date($value)
    {
        if ($value === null || $value === '' || strpos((string) $value, '0000-00-00') === 0) {
            return null;
        }
        try {
            $date = new DateTime($value, new DateTimeZone('Asia/Jakarta'));
        } catch (Exception $e) {
            return null;
        }
        return $date->format('c');
    }
}

if (!function_exists('api_video_source')) {
    /**
     * Bentuk URL streaming dari `sourcelink`.
     *
     * `sourcelink` berisi path dengan spasi (mis. "1. RIA/RIA Indonesia/01 ...mp4"),
     * sehingga setiap segmen path harus di-encode agar URL valid.
     */
    function api_video_source($sourcelink)
    {
        $path = trim((string) $sourcelink);
        if ($path === '') {
            return '';
        }
        $segments = array_map('rawurlencode', explode('/', $path));
        return VIDEO_LINK_S . implode('/', $segments) . VIDEO_LINK_E;
    }
}

if (!function_exists('api_validate_email')) {
    function api_validate_email($email)
    {
        return filter_var(trim((string) $email), FILTER_VALIDATE_EMAIL) !== false;
    }
}

if (!function_exists('api_validate_phone')) {
    /**
     * Nomor telepon: 6–20 digit, boleh diawali +, spasi, tanda hubung, atau kurung.
     */
    function api_validate_phone($phone)
    {
        $phone = trim((string) $phone);
        if ($phone === '') {
            return false;
        }
        if (!preg_match('/^\+?[0-9][0-9\s\-().]{4,19}$/', $phone)) {
            return false;
        }
        $digits = preg_replace('/\D/', '', $phone);
        return strlen($digits) >= 6 && strlen($digits) <= 20;
    }
}

if (!function_exists('api_validate_length')) {
    function api_validate_length($value, $min, $max)
    {
        $value = trim((string) $value);
        // mbstring tidak selalu tersedia di shared hosting
        $len = function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
        return $len >= $min && $len <= $max;
    }
}

if (!function_exists('api_client_id')) {
    /**
     * Identitas client untuk proteksi duplikat like.
     * Diambil dari POST `device_id`, atau hash IP + User-Agent sebagai cadangan.
     */
    function api_client_id()
    {
        if (isset($_POST['device_id']) && trim((string) $_POST['device_id']) !== '') {
            return substr(preg_replace('/[^A-Za-z0-9_\-]/', '', (string) $_POST['device_id']), 0, 64);
        }
        $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
        $ua = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        return substr(sha1($ip . '|' . $ua), 0, 40);
    }
}

if (!function_exists('api_rate_limit')) {
    /**
     * Rate limit sederhana berbasis file (tanpa Redis/Memcached).
     *
     * @param string $bucket  Nama bucket, mis. 'likevideo'
     * @param int    $max     Jumlah maksimum permintaan dalam jendela waktu
     * @param int    $window  Panjang jendela dalam detik
     * @return bool TRUE bila masih diizinkan
     */
    function api_rate_limit($bucket, $max = 30, $window = 60)
    {
        $dir = APPPATH . 'cache';
        if (!is_dir($dir) || !is_writable($dir)) {
            return true; // jangan blokir API bila cache tidak bisa ditulis
        }

        $key = preg_replace('/[^a-z0-9_\-]/i', '', $bucket) . '_' . sha1(api_client_id());
        $file = $dir . '/ratelimit_' . $key . '.json';
        $now = time();

        $hits = array();
        if (is_file($file)) {
            $raw = @file_get_contents($file);
            $decoded = json_decode((string) $raw, true);
            if (is_array($decoded)) {
                $hits = $decoded;
            }
        }

        $hits = array_values(array_filter($hits, function ($ts) use ($now, $window) {
            return is_int($ts) && ($now - $ts) < $window;
        }));

        if (count($hits) >= $max) {
            return false;
        }

        $hits[] = $now;
        @file_put_contents($file, json_encode($hits), LOCK_EX);
        return true;
    }
}

if (!function_exists('api_app_item')) {
    function api_app_item($row)
    {
        return array(
            'id' => (int) $row['counter'],
            'name' => $row['appname'],
            'slug' => $row['slug'],
            'url' => $row['downloadlink'],
            'thumbnail' => SERVER_URL . $row['appimage'],
            'clicked' => (int) $row['clicked'],
            'tag' => $row['tagging'],
        );
    }
}
