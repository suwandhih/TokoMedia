<?php
defined("BASEPATH") or exit("No direct script access allowed");

if (!function_exists('debug')) {

    function debug($var)
    {
        echo '<pre>';
        print_r($var);
        echo '</pre>';
    }

}
if (!function_exists('get_offset')) {

    function get_offset($page = 0, $limit = 10)
    {
        return ($page == 0 ? $page : ($page - 1)) * $limit;
    }

}

if (!function_exists('extractNameFromEmail')) {

    function extractNameFromEmail($email)
    {
        // Split the email by '@'
        $parts = explode('@', $email);

        // Return the first part (name before @)
        return $parts[0];
    }
}
if (!function_exists('format_indo_date')) {

    function format_indo_date($datetime_str)
    {
        date_default_timezone_set('Asia/Jakarta');
        $date = new DateTime($datetime_str);
        return $date->format('d M Y');
    }
}

?>