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
        // Subquery (di-escape oleh query builder)
        $subquery = $this->db
            ->select('seq')
            ->from('category')
            ->where('parentid', $parent_category)
            ->get_compiled_select();

        // Main query — cocokkan lewat nama kategori atau slug. Slug di database
        // berbentuk "film-riwayat-isa-al-masih/aceh", sedangkan client mengirim
        // "aceh", jadi dicocokkan juga sebagai akhiran slug.
        $suffix = $this->db->escape('%/' . $this->db->escape_like_str($category_name));
        $this->db->select('seq');
        $this->db->from('category');
        $this->db->where("parentid IN ($subquery)", null, false); // raw subquery
        $this->db->group_start();
        $this->db->where('categoryname', $category_name);
        $this->db->or_where('slug', $category_name);
        $this->db->or_where("slug LIKE $suffix ESCAPE '!'", null, false);
        $this->db->group_end();
        $result = $this->db->get()->row_array();
        return $result ? $result['seq'] : null;
    }

    /**
     * Seluruh kategori sebagai pohon (root -> children -> grandchildren).
     */
    public function get_tree()
    {
        $rows = $this->db
            ->select('seq, categoryname, slug, description, parentid, thumbnail')
            ->order_by('parentid', 'ASC')
            ->order_by('seq', 'ASC')
            ->get('category')
            ->result_array();

        $by_parent = array();
        foreach ($rows as $row) {
            $by_parent[(int) $row['parentid']][] = $row;
        }

        $build = function ($parent_id, $depth) use (&$build, $by_parent) {
            $nodes = array();
            if (!isset($by_parent[$parent_id])) {
                return $nodes;
            }
            foreach ($by_parent[$parent_id] as $row) {
                $children = $depth < 2 ? $build((int) $row['seq'], $depth + 1) : array();
                $nodes[] = array(
                    'id' => (int) $row['seq'],
                    'name' => $row['categoryname'],
                    'slug' => $row['slug'],
                    'description' => $row['description'],
                    'thumbnail' => $row['thumbnail'] === null ? null : SERVER_URL . $row['thumbnail'],
                    'haschild' => count($children) > 0 ? 1 : 0,
                    'children' => $children,
                );
            }
            return $nodes;
        };

        return $build(0, 0);
    }

    /**
     * Daftar bahasa (kategori daun) lintas region untuk satu root kategori.
     *
     * Region yang tidak punya anak (mis. "Indonesia" pada Film Isa Al-Masih)
     * dihitung sebagai bahasa itu sendiri.
     *
     * @param int   $root_id    ID kategori root (mis. 1 = Film Isa Al-Masih)
     * @param array $region_ids ID anak langsung dari root (region)
     */
    public function get_languages_by_root($root_id, $region_ids = array())
    {
        $regions = $this->get_category_by_parent($root_id, 'seq');
        if (empty($region_ids)) {
            foreach ($regions as $row) {
                $region_ids[] = (int) $row['seq'];
            }
        }
        if (empty($region_ids)) {
            return array();
        }

        $rows = $this->db
            ->select('c.seq, c.categoryname, c.slug, c.parentid, p.categoryname AS regionname')
            ->from('category c')
            ->join('category p', 'p.seq = c.parentid', 'left')
            ->where_in('c.parentid', $region_ids)
            ->order_by('c.categoryname', 'ASC')
            ->get()
            ->result_array();

        $out = array();
        $with_children = array();
        foreach ($rows as $row) {
            $with_children[(int) $row['parentid']] = true;
            $out[] = array(
                'id' => (int) $row['seq'],
                'name' => $row['categoryname'],
                'slug' => $row['slug'],
                'region' => $row['regionname'],
            );
        }

        // Region tanpa anak = bahasa itu sendiri
        foreach ($regions as $row) {
            if (!isset($with_children[(int) $row['seq']])) {
                $out[] = array(
                    'id' => (int) $row['seq'],
                    'name' => $row['categoryname'],
                    'slug' => $row['slug'],
                    'region' => $row['categoryname'],
                );
            }
        }

        usort($out, function ($a, $b) {
            return strcasecmp($a['name'], $b['name']);
        });

        return $out;
    }


}
?>