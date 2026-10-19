<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * API for Audio Kitab Suci (kategori root 128)
 */
class Audio extends CI_Controller
{

	const ROOT_ID = 128;

	/**
	 * index
	 * Daftar audio (semua sub-kategori di bawah root 128)
	 * @return mixed JSON
	 */
	public function index()
	{
		header('Content-Type: application/json');
		if (!api_require_token()) {
			return;
		}

		$page = api_page_params(20, 100);
		$sort = api_sort();

		$this->load->model('category_model', 'category');
		$this->load->model('video_model', 'video');

		$category_ids = $this->collect_category_ids(self::ROOT_ID);
		if (!$category_ids) {
			api_out(404, 'No categories found');
			return;
		}

		$rows = $this->video->get_video_by_categories($category_ids, $page['per_page'], $page['offset'], $sort);
		if (!$rows) {
			api_out(404, 'No audio found');
			return;
		}

		$data = array();
		foreach ($rows as $row) {
			$data[] = api_video_item($row);
		}

		api_out(200, 'Success', $data, array(
			'pagination' => api_pagination(
				$this->video->count_video_by_categories($category_ids),
				$page['page'],
				$page['per_page']
			),
		));
	}

	/**
	 * area
	 * Daftar sub-kategori audio
	 * @return mixed JSON
	 */
	public function area()
	{
		header('Content-Type: application/json');
		if (!api_require_token()) {
			return;
		}

		$this->load->model('category_model', 'category');
		$categories = $this->category->get_category_by_parent(self::ROOT_ID, 'categoryname');
		if (!$categories) {
			api_out(404, 'No categories found');
			return;
		}

		$data = array();
		foreach ($categories as $row) {
			$data[] = array(
				'id' => (int) $row['seq'],
				'name' => $row['categoryname'],
				'slug' => $row['slug'],
			);
		}

		api_out(200, 'Success', $data);
	}

	/**
	 * Kumpulkan ID kategori root beserta seluruh turunannya.
	 */
	private function collect_category_ids($root_id)
	{
		$ids = array((int) $root_id);
		$queue = array((int) $root_id);
		while ($queue) {
			$parent = array_shift($queue);
			foreach ($this->category->get_category_by_parent($parent, 'seq') as $row) {
				$child = (int) $row['seq'];
				if (!in_array($child, $ids, true)) {
					$ids[] = $child;
					$queue[] = $child;
				}
			}
		}
		return $ids;
	}
}
