<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * API for get Application
 * Created by Hunter Nainggolan
 * @date : March 2025
 */
class Aplikasi extends CI_Controller
{

	/**
	 * index
	 * Retrieve Regional Data
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
			$area[] = ["id" => 'indonesia', 'name' => 'Indonesia'];
			$area[] = ["id" => 'sumatera', 'name' => 'Sumatera'];
			$area[] = ["id" => 'jawa', 'name' => 'Jawa - Bali - Nusa Tenggara'];
			$area[] = ["id" => 'kalimantan', 'name' => 'Kalimantan'];
			$area[] = ["id" => 'sulawesi', 'name' => 'Sulawesi'];
			$area[] = ["id" => 'maluku', 'name' => 'Maluku - Papua'];
			$response = [
				'status' => 200,
				'message' => 'Success',
				'data' => $area
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
	 * area
	 * Retrieve Language Data by Region
	 * @return mixed JSON
	 */
	public function area()
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
			$this->load->model('app_model', 'app');
			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}
			$id = $_POST['id'];
			$response = array('status' => 200, "message" => "Success");
			if (!$_POST || $_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'ID Area is needed',
					'data' => []
				]);
				return;
			}
			$list_app = $this->app->get_app_by_area($id);
			if (!$list_app) {
				// Handle case where no categories are found
				echo json_encode([
					'status' => 404,
					'message' => 'No categories found',
					'data' => []
				]);
				return;
			}
			$i = 0;
			foreach ($list_app as $row) {
				$response['data'][$i]['name'] = $row['appname'];
				$response['data'][$i]['url'] = $row['downloadlink'];
				$response['data'][$i]['thumbnail'] = SERVER_URL . $row['appimage'];
				$response['data'][$i]['clicked'] = $row['clicked'];
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
	 * language
	 * Retrieve List Apps by Bahasa
	 * @return mixed JSON
	 */
	public function language()
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
			$list_video = $this->video->get_video_by_category($_POST['id']);
			if (!$list_video) {
				// Handle case where no categories are found
				echo json_encode([
					'status' => 404,
					'message' => 'No categories found',
					'data' => []
				]);
				return;
			}
			$i = 0;
			foreach ($list_video as $row) {
				$response['data']['video'][$i]['id'] = $row['seq'];
				$response['data']['video'][$i]['name'] = $row['displayname'];
				$response['data']['video'][$i]['thumbnail'] = SERVER_URL . $row['thumbnail'];
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
	 * detail
	 * Retrieve Detail Apps by id
	 * @return mixed JSON
	 */
	public function detail()
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
			$response['data']['watchcounter'] = $video_detail['watchcounter'];
			$response['data']['tag'] = $video_detail['tagging'];
			$response['data']['favcounter'] = $video_detail['favoritecounter'];
			$response['data']['thumbnail'] = SERVER_URL . $video_detail['thumbnail'];

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




}
