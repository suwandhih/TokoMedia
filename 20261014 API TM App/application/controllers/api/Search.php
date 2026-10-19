<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * API for full-text search
 */
class Search extends CI_Controller
{

	/**
	 * index
	 * Cari video pada judul, deskripsi, dan tag
	 * @return mixed JSON
	 */
	public function index()
	{
		header('Content-Type: application/json');
		if (!api_require_token()) {
			return;
		}

		$keyword = '';
		if (isset($_POST['q'])) {
			$keyword = trim((string) $_POST['q']);
		} elseif (isset($_POST['keyword'])) {
			$keyword = trim((string) $_POST['keyword']);
		}
		if ($keyword === '') {
			api_out(404, 'Parameter is needed');
			return;
		}

		$page = api_page_params(20, 100);
		$sort = api_sort();

		$this->load->model('video_model', 'video');
		$rows = $this->video->search($keyword, $page['per_page'], $page['offset'], $sort);
		$total = $this->video->count_search($keyword);

		$data = array();
		foreach ($rows as $row) {
			$data[] = api_video_item($row);
		}

		api_out(200, 'Success', $data, array(
			'keyword' => $keyword,
			'pagination' => api_pagination($total, $page['page'], $page['per_page']),
		));
	}

	/**
	 * video
	 * Alias dari index()
	 * @return mixed JSON
	 */
	public function video()
	{
		$this->index();
	}
}
