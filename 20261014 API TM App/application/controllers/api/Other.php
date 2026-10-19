<?php
defined('BASEPATH') or exit('No direct script access allowed');
/**
 * API for Miscellaneous function
 * Created by Hunter Nainggolan
 * @date : March 2025
 */
class Other extends CI_Controller
{

	/**
	 * index
	 * -
	 * @return mixed JSON
	 */

	public function index()
	{
		header('Content-Type: application/json');
		$this->load->model('app_model', 'app');

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
	 * latestvideo
	 * Get Latest Video by bahasa indonesia
	 * @return mixed JSON
	 */
	public function latestvideo()
	{
		header('Content-Type: application/json');
		if (isset($_POST['token'])) {
			$response = array('status' => 200, "message" => "Success");
			$this->load->model('video_model', 'video');
			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}
			$response = array('status' => 200, "message" => "Success");
			$page = api_page_params(20, 100);
			$sort = api_sort();
			$list_video = $this->video->get_latest_video($page['per_page'], $page['offset'], $sort);
			if (!$list_video) {
				// Handle case where no categories are found
				echo json_encode([
					'status' => 404,
					'message' => 'No Video found',
					'data' => []
				]);
				return;
			}
			$i = 0;
			foreach ($list_video as $row) {
				$response['data'][$i]['id'] = $row['seq'];
				$response['data'][$i]['name'] = $row['displayname'];
				$response['data'][$i]['thumbnail'] = SERVER_URL . $row['thumbnail'];
				$response['data'][$i]['watchcounter'] = $row['watchcounter'];
				$response['data'][$i]['duration'] = $row['duration'];
				$response['data'][$i]['dateschedule'] = format_indo_date($row['dateschedule']);
				$i++;
			}
			$response['pagination'] = api_pagination(
				$this->video->count_latest_video(),
				$page['page'],
				$page['per_page']
			);
		} else {
			echo json_encode([
				'status' => 404,
				'message' => 'Parameter is needed',
				'data' => []
			]);
			return;
		}

		echo json_encode($response);
	}

	public function commentvideo()
	{
		header('Content-Type: application/json');
		$this->load->model('videocomment_model', 'videocomment');

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
			$required_fields = ['contactname', 'emailaddress', 'phonenumber', 'messagecontent', 'videoid', 'videotitle'];

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
				'videoid' => $_POST['videoid'],
				'videotitle' => $_POST['videotitle']
			];
			if ($this->send_email_smtp($data['emailaddress'], $data['contactname'], $_POST['videotitle'], $data['messagecontent'])) {
				if ($this->videocomment->insert_comment($data)) {
					$response = [
						'status' => 200,
						'message' => 'Terimakasih telah meninggalkan Komentar',
						'data' => $data
					];
				} else {
					$response = [
						'status' => 201,
						'message' => 'Failed to Send Comment. Please try Again',
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
	 * detail
	 * Retrieve Detail Video by id
	 * @return mixed JSON
	 */
	public function detailvideo()
	{
		header('Content-Type: application/json');
		if (isset($_POST['token']) && isset($_POST['id'])) {
			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}

			$response = array('status' => 200, "message" => "Success");
			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}
			$response = array('status' => 200, "message" => "Success");
			$this->load->model('video_model', 'video');
			$video_detail = $this->video->get_video_by_id($_POST['id']);
			if (!$video_detail) {
				// Handle case where no categories are found
				echo json_encode([
					'status' => 404,
					'message' => 'No categories found',
					'data' => []
				]);
				return;
			}
			$response['data']['id'] = $video_detail['seq'];
			$response['data']['title'] = $video_detail['displayname'];
			$response['data']['content'] = $video_detail['messagecontent'];
			$response['data']['source'] = VIDEO_LINK_S . $video_detail['sourcelink'] . VIDEO_LINK_E;
			$response['data']['duration'] = $video_detail['duration'];
			$totalview = $video_detail['watchcounter'] + 1;
			$response['data']['watchcounter'] = $totalview;
			$response['data']['dateschedule'] = format_indo_date($video_detail['dateschedule']);
			$response['data']['tag'] = $video_detail['tagging'];
			$response['data']['favcounter'] = $video_detail['favoritecounter'];
			$response['data']['thumbnail'] = SERVER_URL . $video_detail['thumbnail'];
			$this->video->update_video($response['data']['id'], ['watchcounter' => $response['data']['watchcounter']]);
			$recomended_video = $this->video->get_video_recomendation($_POST['id'], $video_detail['categoryarray'], 10);
			$i = 0;
			foreach ($recomended_video as $row) {
				$response['data']['recomended'][$i]['id'] = $row['seq'];
				$response['data']['recomended'][$i]['title'] = $row['displayname'];
				$response['data']['recomended'][$i]['duration'] = $row['duration'];
				$response['data']['recomended'][$i]['thumbnail'] = SERVER_URL . $row['thumbnail'];
				$response['data']['recomended'][$i]['watchcounter'] = $row['watchcounter'];
				$response['data']['recomended'][$i]['duration'] = $row['duration'];
				$response['data']['recomended'][$i]['dateschedule'] = format_indo_date($row['dateschedule']);
				$i++;
			}


		} else {
			echo json_encode([
				'status' => 404,
				'message' => 'Parameter is needed',
				'data' => []
			]);
			return;
		}

		echo json_encode($response);
	}

	/**
	 * gettag
	 * Retrieve List Video by tag
	 * @return mixed JSON
	 */
	public function gettag()
	{
		header('Content-Type: application/json');
		if (isset($_POST['token']) && isset($_POST['tag'])) {
			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}
			$page = api_page_params(20, 100);
			$sort = api_sort();

			$response = array('status' => 200, "message" => "Success");
			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}
			$response = array('status' => 200, "message" => "Success");
			$this->load->model('video_model', 'video');
			$list_video = $this->video->get_by_tag($_POST['tag'], $page['per_page'], $page['offset'], $sort);
			if (!$list_video) {
				// Handle case where no categories are found
				echo json_encode([
					'status' => 404,
					'message' => 'No video found',
					'data' => []
				]);
				return;
			}
			$i = 0;
			foreach ($list_video as $row) {
				$response['data'][$i]['id'] = $row['seq'];
				$response['data'][$i]['name'] = $row['displayname'];
				$response['data'][$i]['thumbnail'] = SERVER_URL . $row['thumbnail'];
				$response['data'][$i]['watchcounter'] = $row['watchcounter'];
				$response['data'][$i]['duration'] = $row['duration'];
				$response['data'][$i]['dateschedule'] = format_indo_date($row['dateschedule']);
				$i++;
			}
			$response['pagination'] = api_pagination(
				$this->video->count_by_tag($_POST['tag']),
				$page['page'],
				$page['per_page']
			);
		} else {
			echo json_encode([
				'status' => 404,
				'message' => 'Parameter is needed',
				'data' => []
			]);
			return;
		}

		echo json_encode($response);
	}

	public function likevideo()
	{
		header('Content-Type: application/json');
		if (isset($_POST['token']) && isset($_POST['id'])) {
			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}


			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}
			$this->load->model('video_model', 'video');
			$video_detail = $this->video->get_video_by_id($_POST['id']);
			if (!$video_detail) {
				// Handle case where no categories are found
				echo json_encode([
					'status' => 404,
					'message' => 'No categories found',
					'data' => []
				]);
				return;
			}
			// debug($video_detail);
			$totallike = $video_detail['favoritecounter'] + 1;
			$this->video->update_video($video_detail['seq'], ['favoritecounter' => $totallike]);
			$response['status'] = 200;
			$response['data']['totallike'] = $totallike;
			$response['message'] = "Terimakasih telah menyukai video ini";


		} else {
			echo json_encode([
				'status' => 404,
				'message' => 'Parameter is needed',
				'data' => []
			]);
			return;
		}

		echo json_encode($response);
	}

	public function send_email_smtp($from_email, $from_name, $video, $message_body)
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

		$data = array('video_name' => $video, 'full_name' => $from_name, 'email' => $from_email, 'message' => $message_body);
		$html = $this->load->view('email_video', $data, TRUE);

		$this->email->initialize($config);

		// Set email parameters
		$this->email->from(SMTP_FROM, SMTP_FROM_NAME);
		$this->email->to(SMTP_TO);
		$this->email->subject("Comment : " . $video);
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
