<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| Hooks
| -------------------------------------------------------------------------
| This file lets you define "hooks" to extend CI without hacking the core
| files.  Please see the user guide for info:
|
|	https://codeigniter.com/userguide3/general/hooks.html
|
*/

/*
| Header CORS untuk seluruh endpoint API (dipakai UI di GitHub Pages).
| Daftar origin yang diizinkan: $config['cors_origins'] di config.php
*/
$hook['post_controller_constructor'][] = array(
	'class'    => 'Api_cors',
	'function' => 'handle',
	'filename' => 'Api_cors.php',
	'filepath' => 'hooks',
	'params'   => array(),
);
