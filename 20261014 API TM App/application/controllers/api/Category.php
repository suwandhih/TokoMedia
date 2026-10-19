<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * API for Category tree & language list
 */
class Category extends CI_Controller
{

	/**
	 * index
	 * Pohon kategori lengkap (root -> region -> bahasa)
	 * @return mixed JSON
	 */
	public function index()
	{
		header('Content-Type: application/json');
		if (!api_require_token()) {
			return;
		}

		$this->load->model('category_model', 'category');
		$tree = $this->category->get_tree();
		if (!$tree) {
			api_out(404, 'No categories found');
			return;
		}

		api_out(200, 'Success', $tree);
	}

	/**
	 * tree
	 * Alias dari index()
	 * @return mixed JSON
	 */
	public function tree()
	{
		$this->index();
	}

	/**
	 * languages
	 * Semua bahasa lintas region untuk satu kategori root
	 * @return mixed JSON
	 */
	public function languages()
	{
		header('Content-Type: application/json');
		if (!api_require_token()) {
			return;
		}

		$root_id = isset($_POST['id']) ? (int) $_POST['id'] : 1;
		$this->load->model('category_model', 'category');
		$languages = $this->category->get_languages_by_root($root_id);
		if (!$languages) {
			api_out(404, 'No languages found');
			return;
		}

		api_out(200, 'Success', $languages, array(
			'pagination' => api_pagination(count($languages), 1, count($languages)),
		));
	}
}
