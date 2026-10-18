<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Contact_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Insert new contact message
     *
     * @param array $data
     *   Required keys:
     *     - contactname
     *     - emailaddress
     *     - phonenumber
     *     - messagecontent
     *     - senddate (YYYY-MM-DD hh:ii:ss format)
     *     - linkname
     * @return bool
     */
    public function insert_contact($data)
    {
        return $this->db->insert('contact', [
            'contactname' => $data['contactname'],
            'emailaddress' => $data['emailaddress'],
            'phonenumber' => $data['phonenumber'],
            'messagecontent' => $data['messagecontent'],
            'sentdate' => $data['sentdate'],
            'linkname' => $data['linkname'],
            'linkid' => $data['linkid']
        ]);
    }

}