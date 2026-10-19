<?php
defined('BASEPATH') or exit('No direct script access allowed');

class MY_Controller extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
    }

    function is_logged()
    {
        if ($this->session->userdata('islogged')) {
            return true;
        } else {
            return false;
        }
    }
    protected function build_pagination($base_url = '', $uri_segment = NULL, $total_rows = 0, $limit = 10, $num_links = 10)
    {
        $this->load->library('pagination');

        if (is_array($base_url)) {
            $base_url_val = $base_url[0];
            if (!empty($base_url[1])) {
                $fragment_val = $base_url[1];
            }
        } else {
            $base_url_val = $base_url;
            $fragment_val = '';
        }

        $config = array(
            'base_url' => $base_url_val,
            'total_rows' => $total_rows,
            'per_page' => $limit,
            'num_links' => $num_links,
            'uri_segment' => $uri_segment,
            'full_tag_open' => '<nav aria-label="Page Navigation"><ul class="pagination justify-content-center">',
            'full_tag_close' => '</ul></nav>',
            'use_page_numbers' => TRUE,
            'cur_tag_open' => '<li class="page-item active"><a class="page-link" href="#">',
            'cur_tag_close' => "</a></li>",
            'first_link' => 'first',
            'first_tag_open' => ' <li class="page-item">',
            'first_tag_close' => '</li>',
            'last_link' => 'last',
            'last_tag_open' => '<li class="page-item">',
            'last_tag_close' => '</li>',
            'next_link' => '&raquo;',
            'next_tag_open' => '<li class="page-item">',
            'next_tag_close' => '</li>',
            'prev_link' => '&laquo;',
            'prev_tag_open' => '<li class="page-item">',
            'prev_tag_close' => '</li>',
            'num_tag_open' => '<li class="page-item">',
            'num_tag_close' => '</li>',
            'fragment' => $base_url_val,
            'attributes' => array('class' => 'page-link')
        );

        $this->pagination->initialize($config);
        return $this->pagination->create_links();
    }

}
?>