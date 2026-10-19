<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Pencatat like per client agar satu client hanya bisa like sekali per video.
 * Tabel: videolike (videoid, clientid, likedate) — lihat migration di
 * application/migrations/ untuk DDL-nya.
 */
class Videolike_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    /**
     * TRUE bila client sudah pernah like video ini.
     */
    public function has_liked($videoid, $clientid)
    {
        $row = $this->db
            ->select('seq')
            ->get_where('videolike', array('videoid' => $videoid, 'clientid' => $clientid))
            ->row_array();
        return !empty($row);
    }

    /**
     * Catat like. Mengembalikan FALSE bila sudah ada (race-safe via unique key).
     */
    public function record_like($videoid, $clientid)
    {
        if ($this->has_liked($videoid, $clientid)) {
            return false;
        }
        return $this->db->insert('videolike', array(
            'videoid' => $videoid,
            'clientid' => $clientid,
            'likedate' => date('Y-m-d H:i:s'),
        ));
    }
}
