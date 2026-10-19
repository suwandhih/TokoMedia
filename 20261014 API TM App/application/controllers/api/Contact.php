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

			$validation_error = $this->validate_contact_input();
			if ($validation_error !== null) {
				echo json_encode([
					'status' => 201,
					'message' => $validation_error,
					'data' => []
				]);
				return;
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

	/**
	 * Validasi format email, telepon, dan panjang pesan.
	 *
	 * @return string|null Pesan error, atau NULL bila valid
	 */
	private function validate_contact_input()
	{
		if (!api_validate_email($_POST['emailaddress'])) {
			return 'Format email tidak valid';
		}
		if (!api_validate_phone($_POST['phonenumber'])) {
			return 'Format nomor telepon tidak valid';
		}
		if (!api_validate_length($_POST['contactname'], 2, 100)) {
			return 'Nama harus 2-100 karakter';
		}
		if (!api_validate_length($_POST['messagecontent'], 5, 5000)) {
			return 'Pesan harus 5-5000 karakter';
		}
		return null;
	}

	public function send_email_smtp($from_email, $from_name, $message_body)
	{
		// Load the email library
		$this->load->library('email');

		// SMTP configuration (kredensial dari environment variable / secrets.local.php)
		$config = array(
			'protocol' => 'smtp',
			'smtp_host' => SMTP_HOST,
			'smtp_port' => SMTP_PORT,
			'smtp_user' => SMTP_USER,
			'smtp_pass' => SMTP_PASS,
			'smtp_crypto' => SMTP_CRYPTO,
			'mailtype' => 'html',
			'charset' => 'utf-8',
			'newline' => "\r\n",
			'crlf' => "\r\n",
			'wordwrap' => TRUE
		);

		if (SMTP_HOST === '' || SMTP_USER === '' || SMTP_PASS === '') {
			log_message('error', 'SMTP credentials are not configured');
			return false;
		}

		$data = array('full_name' => $from_name, 'email' => $from_email, 'message' => $message_body);
		$html = $this->load->view('email_contact', $data, TRUE);

		$this->email->initialize($config);

		// Set email parameters
		$this->email->from(SMTP_FROM, SMTP_FROM_NAME);
		$this->email->to(SMTP_TO);
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
