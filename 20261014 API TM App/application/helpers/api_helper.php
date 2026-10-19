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
        }
        return $item;
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
