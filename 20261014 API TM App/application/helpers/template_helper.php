<?php
defined('BASEPATH') or exit('No direct script access allowed');

function load_view($CI, $view, $data = [])
{
    $data['content'] = $CI->load->view($view, $data, TRUE);
    $CI->load->view('layout', $data);
}
?>