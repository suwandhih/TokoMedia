<?php
defined('BASEPATH') or exit('No direct script access allowed');

class App_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    // Fetch all category
    public function get_all_app()
    {
        return $this->db->get('appdb')->result_array();
    }

    // Fetch app by area
    public function get_app_by_area($area = 'indonesia')
    {

        $rst = array();
        switch ($area) {
            case 'indonesia':
                $this->db->from('appdb');
                $this->db->where("tagging LIKE '%indonesia%'");
                $this->db->order_by('createddate', 'ASC');
                $this->db->order_by('appname', 'ASC');
                $rst = $this->db->get()->result_array();
                break;
            case "sumatera":
                $this->db->from('appdb');
                $this->db->where("tagging LIKE '%Sumatera%'");
                $this->db->order_by('createddate', 'ASC');
                $this->db->order_by('appname', 'ASC');
                $rst = $this->db->get()->result_array();
                break;
            case "jawa":
                $this->db->from('appdb');
                $this->db->where("tagging LIKE '%#Jawa-Bali-NusaTenggara%' OR tagging LIKE '%#Jawa-Bali-Nusa Tenggara%'");
                $this->db->order_by('createddate', 'ASC');
                $this->db->order_by('appname', 'ASC');
                $rst = $this->db->get()->result_array();
                break;
            case "kalimantan":
                 $this->db->from('appdb');
                $this->db->where("tagging LIKE '%Kalimantan%'");
                $this->db->order_by('createddate', 'ASC');
                $this->db->order_by('appname', 'ASC');
                $rst = $this->db->get()->result_array();
                break;
            case "sulawesi":
                $this->db->from('appdb');
                $this->db->where("tagging LIKE '%Sulawesi%'");
                $this->db->order_by('createddate', 'ASC');
                $this->db->order_by('appname', 'ASC');
                $rst = $this->db->get()->result_array();
                break;
            case "maluku":
                $this->db->from('appdb');
                $this->db->where("tagging LIKE '%Maluku-Papua%'");
                $this->db->order_by('createddate', 'ASC');
                $this->db->order_by('appname', 'ASC');
                $rst = $this->db->get()->result_array();
                break;
        }
        return $rst;
    }

    // Fetch a single video by ID
    public function get_app_by_id($id)
    {
        return $this->db->get_where('appdb', ['counter' => $id, 'isdeleted' => 0])->row_array();
    }

    // Fetch a single app by slug
    public function get_app_by_slug($slug)
    {
        return $this->db->get_where('appdb', ['slug' => $slug, 'isdeleted' => 0])->row_array();
    }

    /**
     * Daftar semua aplikasi dengan pagination, pencarian, dan sorting.
     */
    public function get_apps($limit = null, $offset = 0, $keyword = '', $sort = 'default')
    {
        $this->db->select('counter, appname, slug, description, downloadlink, clicked, appimage, createddate, tagging, playstorename');
        $this->db->from('appdb');
        $this->db->where('isdeleted', 0);
        if ($keyword !== '') {
            $this->db->group_start();
            $this->db->like('appname', $keyword);
            $this->db->or_like('description', $keyword);
            $this->db->or_like('tagging', $keyword);
            $this->db->group_end();
        }
        switch ($sort) {
            case 'popular':
                $this->db->order_by('clicked', 'DESC');
                $this->db->order_by('appname', 'ASC');
                break;
            case 'newest':
                $this->db->order_by('createddate', 'DESC');
                $this->db->order_by('appname', 'ASC');
                break;
            case 'oldest':
                $this->db->order_by('createddate', 'ASC');
                $this->db->order_by('appname', 'ASC');
                break;
            default:
                $this->db->order_by('appname', 'ASC');
                break;
        }
        $this->db->limit($limit, $offset);
        return $this->db->get()->result_array();
    }

    public function count_apps($keyword = '')
    {
        $this->db->from('appdb');
        $this->db->where('isdeleted', 0);
        if ($keyword !== '') {
            $this->db->group_start();
            $this->db->like('appname', $keyword);
            $this->db->or_like('description', $keyword);
            $this->db->or_like('tagging', $keyword);
            $this->db->group_end();
        }
        return (int) $this->db->count_all_results();
    }

}
?>