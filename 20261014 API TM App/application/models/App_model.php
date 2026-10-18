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
        return $this->db->get_where('appdb', ['counter' => $id])->row_array();
    }

}
?>