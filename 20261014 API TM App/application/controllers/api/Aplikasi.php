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
	 * list
	 * Semua aplikasi dengan pagination, pencarian, dan sorting
	 *
	 * Catatan: `list` adalah kata kunci PHP sehingga tidak boleh dipakai
	 * sebagai nama method pada PHP 5.6. Endpoint /aplikasi/list ditangani
	 * oleh _remap() di bawah.
	 *
	 * @return mixed JSON
	 */
	public function list_data()
	{
		$this->render_list();
	}

	/**
	 * _remap
	 * Meneruskan nama method yang tidak sah di PHP 5.6 (mis. `list`).
	 */
	public function _remap($method, $params = array())
	{
		if ($method === 'list') {
			$this->render_list();
			return;
		}
		if (method_exists($this, $method)) {
			return call_user_func_array(array($this, $method), $params);
		}
		show_404();
	}

	/**
	 * Isi respons daftar aplikasi.
	 */
	private function render_list()
	{
		header('Content-Type: application/json');
		if (!api_require_token()) {
			return;
		}

		$page = api_page_params(20, 100);
		$sort = api_sort(array('default', 'popular', 'newest', 'oldest'), 'default');
		$keyword = isset($_POST['q']) ? trim((string) $_POST['q']) : '';

		$this->load->model('app_model', 'app');
		$rows = $this->app->get_apps($page['per_page'], $page['offset'], $keyword, $sort);
		$total = $this->app->count_apps($keyword);

		$data = array();
		foreach ($rows as $row) {
			$data[] = api_app_item($row);
		}

		api_out(200, 'Success', $data, array(
			'pagination' => api_pagination($total, $page['page'], $page['per_page']),
		));
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
		$id = $_POST['id'];
		$app_detail = ctype_digit((string) $id)
			? $this->app->get_app_by_id($id)
			: $this->app->get_app_by_slug($id);
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
