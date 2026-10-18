<?php
defined('BASEPATH') or exit('No direct script access allowed');
/**
 * API for Contact Form
 * Created by Hunter Nainggolan
 * @date : March 2025
 */
class Contact extends CI_Controller
{

	/**
	 * index
	 * Send Contact Data
	 * @return mixed JSON
	 */
	public function index()
	{
		header('Content-Type: application/json');
		$this->load->model('contact_model', 'contact');

		if (isset($_POST['token'])) {
			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}

			$response = [
				'status' => 200,
				'message' => 'Success',
				'data' => []
			];
			$required_fields = ['contactname', 'emailaddress', 'phonenumber', 'messagecontent', 'linkid', 'linkname'];

			foreach ($required_fields as $field) {
				if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
					echo json_encode([
						'status' => 201,
						'message' => 'Please fill all data required',
						'data' => []
					]);
					return;
				}
			}
			date_default_timezone_set('Asia/Jakarta');
			$data = [
				'contactname' => $_POST['contactname'],
				'emailaddress' => $_POST['emailaddress'],
				'phonenumber' => $_POST['phonenumber'],
				'messagecontent' => $_POST['messagecontent'],
				'sentdate' => date("Y-m-d h:i:s"),
				'linkid' => $_POST['linkid'],
				'linkname' => $_POST['linkname']
			];
			if ($this->send_email_smtp($data['emailaddress'], $data['contactname'], $data['messagecontent'])) {
				if ($this->contact->insert_contact($data)) {
					$response = [
						'status' => 200,
						'message' => 'Terimakasih telah menghubungi kami. Kami akan segera merespon anda',
						'data' => $data
					];
				} else {
					$response = [
						'status' => 201,
						'message' => 'Failed to Send Contact. Please try Again',
						'data' => []
					];
				}
			} else {
				$response = [
					'status' => 201,
					'message' => 'Failed to Send Email. Please try Again',
					'data' => []
				];
			}

		} else {
			echo json_encode([
				'status' => 404,
				'message' => 'Parameter is needed',
				'data' => []
			]);
			return;
		}

		echo json_encode($response, JSON_PRETTY_PRINT);
	}

	public function infoo(){
		echo phpinfo();
	}

	public function send_email_smtp($from_email, $from_name, $message_body)
	{
		// Load the email library
		$this->load->library('email');

		// SMTP configuration
		$config = array(
			'protocol' => 'smtp',
			'smtp_host' => 'sg2plzcpnl506705.prod.sin2.secureserver.net',
			'smtp_port' => 587,
			'smtp_user' => 'info@tokomedia.org',
			'smtp_pass' => 'GANTI_PASSWORD_SMTP_ANDA',
			'smtp_crypto' => 'tls', // this is important for port 465
			'mailtype' => 'html',
			'charset' => 'utf-8',
			'newline' => "\r\n",
			'crlf' => "\r\n",
			'wordwrap' => TRUE
		);

		$data = array('full_name' => $from_name, 'email' => $from_email, 'message' => $message_body);
		$html = $this->load->view('email_contact', $data, TRUE);

		$this->email->initialize($config);

		// Set email parameters
		$this->email->from('info@tokomedia.org', 'Mobile Apps'); // change this
		$this->email->to('info@tokomedia.org');
		$this->email->subject("Contact Us Page");
		$this->email->message($html);

		if (!$this->email->send()) {
			$debug = $this->email->print_debugger(['headers']);
			log_message('error', $debug);

			// Workaround: if the server says "250 OK", treat as success
			if (strpos($debug, '250 OK') !== false) {
				log_message('info', 'SMTP sent successfully despite CI returning false');
				return true;
			}

			// Otherwise return false as usual
			return false;
		} else {
			return true;
		}
	}

}
