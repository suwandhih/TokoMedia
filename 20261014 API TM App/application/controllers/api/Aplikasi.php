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

		if (!isset($_POST['token'])) {
			echo json_encode([
				'status' => 404,
				'message' => 'Parameter is needed',
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

		$area = [];
		$area[] = ["id" => 'indonesia', 'name' => 'Indonesia'];
		$area[] = ["id" => 'sumatera', 'name' => 'Sumatera'];
		$area[] = ["id" => 'jawa', 'name' => 'Jawa - Bali - Nusa Tenggara'];
		$area[] = ["id" => 'kalimantan', 'name' => 'Kalimantan'];
		$area[] = ["id" => 'sulawesi', 'name' => 'Sulawesi'];
		$area[] = ["id" => 'maluku', 'name' => 'Maluku - Papua'];

		echo json_encode([
			'status' => 200,
			'message' => 'Success',
			'data' => $area
		], JSON_PRETTY_PRINT);
	}

	/**
	 * area
	 * Retrieve Language Data by Region
	 * @return mixed JSON
	 */
	public function area()
	{
		header('Content-Type: application/json');

		if (!isset($_POST['token']) || !isset($_POST['id'])) {
			echo json_encode([
				'status' => 404,
				'message' => 'Parameter is needed',
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

		$this->load->model('app_model', 'app');
		$list_app = $this->app->get_app_by_area($_POST['id']);
		if (!$list_app) {
			echo json_encode([
				'status' => 404,
				'message' => 'No apps found',
				'data' => []
			]);
			return;
		}

		$response = array('status' => 200, "message" => "Success");
		$i = 0;
		foreach ($list_app as $row) {
			$response['data'][$i]['name'] = $row['appname'];
			$response['data'][$i]['url'] = $row['downloadlink'];
			$response['data'][$i]['thumbnail'] = SERVER_URL . $row['appimage'];
			$response['data'][$i]['clicked'] = $row['clicked'];
			$i++;
		}

		echo json_encode($response);
	}


	/**
	 * language
	 * Alias dari area() — daftar aplikasi per region
	 * @return mixed JSON
	 */
	public function language()
	{
		$this->area();
	}

	/**
	 * detail
	 * Retrieve Detail Apps by id
	 * @return mixed JSON
	 */
	public function detail()
	{
		header('Content-Type: application/json');

		if (!isset($_POST['token']) || !isset($_POST['id'])) {
			echo json_encode([
				'status' => 404,
				'message' => 'Parameter is needed',
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

		$this->load->model('app_model', 'app');
		$app_detail = $this->app->get_app_by_id($_POST['id']);
		if (!$app_detail) {
			echo json_encode([
				'status' => 404,
				'message' => 'App not found',
				'data' => []
			]);
			return;
		}

		$response = array('status' => 200, "message" => "Success");
		$response['data']['id'] = $app_detail['counter'];
		$response['data']['name'] = $app_detail['appname'];
		$response['data']['slug'] = $app_detail['slug'];
		$response['data']['description'] = $app_detail['description'];
		$response['data']['url'] = $app_detail['downloadlink'];
		$response['data']['playstorename'] = $app_detail['playstorename'];
		$response['data']['clicked'] = $app_detail['clicked'];
		$response['data']['tag'] = $app_detail['tagging'];
		$response['data']['thumbnail'] = SERVER_URL . $app_detail['appimage'];

		echo json_encode($response);
	}




}
