<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Category_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    // Fetch all category
    public function get_all_category()
    {
        return $this->db->get('category')->result_array();
    }

    // Fetch category by parentid
    public function get_category_by_parent($id, $order)
    {
        $this->db->order_by($order, 'ASC');
        $rst = $this->db->get_where('category', ['parentid' => $id])->result_array();
        // echo $this->db->last_query();
        return $rst;
    }

    // Fetch a single video by ID
    public function get_category_by_id($id)
    {
        return $this->db->get_where('category', ['id' => $id])->row_array();
    }

    public function get_category_name_by_pref($parent_category, $category_name)
    {
        // Subquery
        $subquery = "(SELECT seq FROM category WHERE parentid = " . $parent_category . ")";


        // Main query
        $this->db->select('seq');
        $this->db->from('category');
        $this->db->where("parentid IN ($subquery)", null, false); // raw subquery
        $this->db->where('categoryname', $category_name);
        $result = $this->db->get()->row_array();
        return $result['seq'];
    }


}
?>