<?php
defined('BASEPATH') or exit('No direct script access allowed');
/**
 * API for get Video Film Isa Al-Masih
 * Created by Hunter Nainggolan
 * @date : March 2025
 */
class Riwayat extends CI_Controller
{

	/**
	 * index
	 * Retrieve Regional Data
	 * @return mixed JSON
	 */

	public function index()
	{
		header('Content-Type: application/json');
		$this->load->model('category_model', 'category');
		$category = $this->category->get_category_by_parent(1, 'seq');
		if (isset($_POST['token'])) {
			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}

			if (!$category) {
				// Handle case where no categories are found
				echo json_encode([
					'status' => 404,
					'message' => 'No categories found',
					'data' => []
				]);
				return;
			}

			$response = [
				'status' => 200,
				'message' => 'Success',
				'data' => []
			];

			foreach ($category as $row) {
				$response['data'][] = [
					'id' => $row['seq'],
					'name' => $row['categoryname'],
					'haschild' => ($row['seq'] == 2) ? 0 : 1 // Consider making this dynamic
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
			$this->load->model('category_model', 'category');
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
			$this->load->model('category_model', 'category');
			if (!$_POST || $_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'ID Area is needed',
					'data' => []
				]);
				return;
			}
			$category = $this->category->get_category_by_parent($id, 'categoryname');
			if (!$category) {
				// Handle case where no categories are found
				echo json_encode([
					'status' => 201,
					'message' => 'Video tidak tersedia',
					'data' => []
				]);
				return;
			}
			$i = 0;
			foreach ($category as $row) {
				$response['data'][$i]['id'] = $row['seq'];
				$response['data'][$i]['name'] = $row['categoryname'];
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
	 * Retrieve List Video by Bahasa
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
			$limit = isset($_POST['limit']) ? $_POST['limit'] : null;
			$offset = isset($_POST['offset']) ? $_POST['offset'] : 0;
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
			$list_video = $this->video->get_video_by_category($_POST['id'], $limit,$offset);
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
				$response['data'][$i]['id'] = $row['seq'];
				$response['data'][$i]['name'] = $row['displayname'];
				$response['data'][$i]['thumbnail'] = SERVER_URL . $row['thumbnail'];
				$response['data'][$i]['watchcounter'] = $row['watchcounter'];
				$response['data'][$i]['duration'] = $row['duration'];
				$response['data'][$i]['dateschedule'] = format_indo_date($row['dateschedule']);
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
	 * languagepref
	 * Retrieve List Video by Bahasa
	 * @return mixed JSON
	 */
	public function languagepref()
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
			$limit = isset($_POST['limit']) ? $_POST['limit'] : null;

			$response = array('status' => 200, "message" => "Success");
			if ($_POST['token'] != TOKEN) {
				echo json_encode([
					'status' => 404,
					'message' => 'No Permission',
					'data' => []
				]);
				return;
			}
			$this->load->model('video_model', 'video');
			$this->load->model('category_model', 'category');
			$cat_id = $this->category->get_category_name_by_pref(1, $_POST['id']);
			if($_POST['id']=='indonesia'){
				$cat_id = 2;
			}
			if ($cat_id == "") {
				echo json_encode([
					'status' => 201,
					'message' => 'Bahasa ini tidak terdaftar di Film Isa Al-Masih',
					'data' => []
				]);
				return;
			}
			$response = array('status' => 200, "message" => "Success");
			$list_video = $this->video->get_video_by_category($cat_id, $limit);
			if (!$list_video) {
				// Handle case where no categories are found
				echo json_encode([
					'status' => 201,
					'message' => 'Video bahasa ini tidak ditemukan',
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
	 * Retrieve Detail Video by id
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
			$response['data']['dateschedule'] = format_indo_date($video_detail['dateschedule']);
			$response['data']['watchcounter'] = $video_detail['watchcounter'];
			$response['data']['tag'] = $video_detail['tagging'];
			$response['data']['favcounter'] = $video_detail['favoritecounter'];
			$response['data']['thumbnail'] = SERVER_URL . $video_detail['thumbnail'];
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




}
