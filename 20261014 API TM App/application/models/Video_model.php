<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Video_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    // Fetch all videos
    public function get_all_videos($limit, $offset)
    {
        $this->db->order_by('slug', 'ASC');
        $this->db->limit($limit > 0 ? $limit : null, $offset);
        $result = $this->db->get('videodb')->result_array();
        $this->total_rows = $this->db->count_all_results('videodb');
        return $result;
    }

    // Fetch a single video by ID
    public function get_video_by_id($id)
    {
        return $this->db->get_where('videodb', ['seq' => $id])->row_array();
    }
    public function get_video_recomendation($id, $category, $limit)
    {
        // First part: Get videos after the given ID
        $this->db->select('seq, displayname, duration, categoryarray, thumbnail, watchcounter, dateschedule');
        $this->db->from('videodb');
        $this->db->where('categoryarray', $category);
        $this->db->where('isdeleted', 0);
        $this->db->where('seq >', $id);
        $this->db->order_by('seq', 'ASC');
        $this->db->limit($limit > 0 ? $limit : null);
        $first_part = $this->db->get()->result_array();

        $count = count($first_part);

        if ($count >= $limit) {
            return $first_part;
        }

        // Second part: Get the remaining from the beginning
        $remaining = $limit - $count;

        $this->db->select('seq, displayname, duration, categoryarray, thumbnail, watchcounter, dateschedule');
        $this->db->from('videodb');
        $this->db->where('categoryarray', $category);
        $this->db->where('isdeleted', 0);
        $this->db->where('seq <=', $id);
        $this->db->order_by('seq', 'ASC');
        $this->db->limit($remaining);
        $second_part = $this->db->get()->result_array();

        return array_merge($first_part, $second_part);
    }


    public function get_latest_video($limit, $offset, $sort = 'default')
    {
        $this->db->select('seq, displayname, duration, categoryarray, thumbnail,watchcounter,dateschedule');
        $this->db->where_in('categoryarray', [2, 305]);
        $this->db->where('isdeleted', 0);
        if ($sort === 'default') {
            $this->db->order_by('dateschedule', 'DESC');
        } else {
            api_apply_sort($this->db, $sort);
        }
        $this->db->limit($limit > 0 ? $limit : null, $offset); // Add limit and offset
        return $this->db->get('videodb')->result_array();
    }

    public function count_latest_video()
    {
        $this->db->where_in('categoryarray', [2, 305]);
        $this->db->where('isdeleted', 0);
        return (int) $this->db->count_all_results('videodb');
    }

    // Fetch a videos by category
    public function get_video_by_category($id, $limit = null, $offset = 0, $sort = 'default')
    {
        $this->db->select('seq, displayname, duration, categoryarray, thumbnail,watchcounter,dateschedule');
        $this->db->where('categoryarray', $id);
        $this->db->where('isdeleted', 0);
        api_apply_sort($this->db, $sort);
        $this->db->limit($limit > 0 ? $limit : null, $offset); // Add limit here
        return $this->db->get('videodb')->result_array();
    }

    public function count_video_by_category($id)
    {
        $this->db->where('categoryarray', $id);
        $this->db->where('isdeleted', 0);
        return (int) $this->db->count_all_results('videodb');
    }

    // Fetch videos dari beberapa kategori sekaligus
    public function get_video_by_categories($ids, $limit = null, $offset = 0, $sort = 'default')
    {
        $this->db->select('seq, displayname, duration, categoryarray, thumbnail,watchcounter,dateschedule');
        $this->db->where_in('categoryarray', $ids);
        $this->db->where('isdeleted', 0);
        api_apply_sort($this->db, $sort);
        $this->db->limit($limit > 0 ? $limit : null, $offset);
        return $this->db->get('videodb')->result_array();
    }

    public function count_video_by_categories($ids)
    {
        $this->db->where_in('categoryarray', $ids);
        $this->db->where('isdeleted', 0);
        return (int) $this->db->count_all_results('videodb');
    }

    // Fetch video kitab with custom parameter
    public function get_vkitab_by_book($book, $limit = null, $offset = 0, $sort = 'default')
    {
        $this->db->select('seq, displayname, duration, categoryarray, thumbnail,watchcounter,dateschedule');
        $this->db->from('videodb');
        $this->db->like('displayname', 'Indonesia');
        $this->db->like('tagging', $book);
        $this->db->where('isdeleted', 0);
        api_apply_sort($this->db, $sort);
        $this->db->limit($limit > 0 ? $limit : null, $offset);
        return $this->db->get()->result_array();
    }

    public function count_vkitab_by_book($book)
    {
        $this->db->from('videodb');
        $this->db->like('displayname', 'Indonesia');
        $this->db->like('tagging', $book);
        $this->db->where('isdeleted', 0);
        return (int) $this->db->count_all_results();
    }

    //Fetch video by tag
    public function get_by_tag($tag, $limit = null, $offset = 0, $sort = 'default')
    {
        $this->db->select('seq, displayname, duration, categoryarray, thumbnail,watchcounter,dateschedule');
        $this->db->from('videodb');
        $this->db->like('tagging', $tag);
        $this->db->where('isdeleted', 0);
        api_apply_sort($this->db, $sort);
        $this->db->limit($limit > 0 ? $limit : null, $offset); // Add limit here
        return $this->db->get()->result_array();
    }

    public function count_by_tag($tag)
    {
        $this->db->from('videodb');
        $this->db->like('tagging', $tag);
        $this->db->where('isdeleted', 0);
        return (int) $this->db->count_all_results();
    }

    /**
     * Pencarian pada judul, deskripsi, dan tag.
     */
    public function search($keyword, $limit = null, $offset = 0, $sort = 'default')
    {
        $this->db->select('seq, displayname, duration, categoryarray, thumbnail,watchcounter,dateschedule');
        $this->db->from('videodb');
        $this->db->group_start();
        $this->db->like('displayname', $keyword);
        $this->db->or_like('messagecontent', $keyword);
        $this->db->or_like('tagging', $keyword);
        $this->db->group_end();
        $this->db->where('isdeleted', 0);
        api_apply_sort($this->db, $sort);
        $this->db->limit($limit > 0 ? $limit : null, $offset);
        return $this->db->get()->result_array();
    }

    public function count_search($keyword)
    {
        $this->db->from('videodb');
        $this->db->group_start();
        $this->db->like('displayname', $keyword);
        $this->db->or_like('messagecontent', $keyword);
        $this->db->or_like('tagging', $keyword);
        $this->db->group_end();
        $this->db->where('isdeleted', 0);
        return (int) $this->db->count_all_results();
    }


    // Insert a new video
    public function insert_video($data)
    {
        return $this->db->insert('videodb', $data);
    }

    // Update an existing video
    public function update_video($id, $data)
    {
        $this->db->where('seq', $id);
        return $this->db->update('videodb', $data);
    }

    // Delete a video
    public function delete_video($id)
    {
        return $this->db->delete('videodb', ['seq' => $id]);
    }
}
?>
