<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Videocomment_model extends CI_Model
{
    var $total_rows;
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }
    public function get_all_comment($limit, $offset)
    {
        $this->db->order_by('sentdate', 'DESC');
        $this->db->limit($limit, $offset);
        $result = $this->db->get('videocomment')->result_array();
        $this->total_rows = $this->db->count_all_results('videocomment');
        return $result;
    }

    // Fetch a User by ID
    public function get_by_id($id)
    {
        return $this->db->get_where('videocomment', ['seq' => $id])->row_array();
    }
    public function get_by_videoid($id)
    {
        return $this->db->get_where('videocomment', ['videoid' => $id])->result_array();
    }

    public function insert_comment($data)
    {
        return $this->db->insert('videocomment', [
            'contactname' => $data['contactname'],
            'emailaddress' => $data['emailaddress'],
            'phonenumber' => $data['phonenumber'],
            'messagecontent' => $data['messagecontent'],
            'sentdate' => $data['sentdate'],
            'videoid' => $data['videoid'],
            'videotitle' => $data['videotitle']
        ]);
    }

}
?>