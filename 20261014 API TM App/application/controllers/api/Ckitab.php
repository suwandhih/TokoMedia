<?php
defined('BASEPATH') or exit('No direct script access allowed');
/**
 * API for get Clip Kitab Content
 * Created by Hunter Nainggolan
 * @date : March 2025
 */

class Ckitab extends CI_Controller
{

	/**
	 * index
	 * Retrieve Regional Data
	 * @return mixed JSON
	 */
	public function index()
	{
		header('Content-Type: application/json');
		if (isset($_POST['token'])) {
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
			$limit = isset($_POST['limit']) ? $_POST['limit'] : null;
			$offset = isset($_POST['offset']) ? $_POST['offset'] : null;
			$list_video = $this->video->get_video_by_category(131, $limit,$offset);
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
				$response['data'][$i]['watchcounter'] = $row['watchcounter'];
				$response['data'][$i]['dateschedule'] = $row['dateschedule'];
				$response['data'][$i]['duration'] = $row['duration'];
				$response['data'][$i]['thumbnail'] = SERVER_URL . $row['thumbnail'];
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
				$response['data']['recomended'][$i]['dateschedule'] = $row['dateschedule'];
				$response['data']['recomended'][$i]['duration'] = $row['duration'];
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
