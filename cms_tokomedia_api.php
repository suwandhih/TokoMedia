<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://suwandhih.github.io');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/cms_tokomedia_data.json';
$default = [
    'label' => 'PUSAT MEDIA NUSANTARA',
    'title' => 'Film, Video &\nAplikasi Kitab Suci\nNusantara.',
    'description' => 'Nikmati ribuan tayangan rohani bermakna, kisah para nabi, serta aplikasi Kitab Suci Android dalam bahasa ibu dari Sabang sampai Merauke.',
    'primaryButton' => 'Tonton Tayangan Sorotan',
    'secondaryButton' => 'Jelajahi Wilayah',
    'sec01Eyebrow' => '01 • KATEGORI UTAMA',
    'sec01Title' => 'Pilih Format Media',
    'sec01Sub' => 'Ketuk kartu untuk melihat daftar bahasa per wilayah',
    'sec02Eyebrow' => '02 • EKSPLORASI BAHASA',
    'sec02Title' => 'Kategori Bahasa & Format',
    'sec03Eyebrow' => '03 • STREAMING TERKINI',
    'sec03Title' => 'Tayangan Pilihan Terbaru',
    'exploreAllButton' => 'Jelajahi Semua Koleksi per Wilayah',
    'languageListButton' => 'Daftar Bahasa'
];

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!is_file($dataFile)) {
        respond($default);
    }
    $content = json_decode(file_get_contents($dataFile), true);
    respond(is_array($content) ? array_merge($default, $content) : $default);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['ok' => false, 'message' => 'Metode tidak diizinkan'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    respond(['ok' => false, 'message' => 'Format permintaan tidak valid'], 422);
}

$content = $input['content'] ?? null;
if (!is_array($content)) {
    respond(['ok' => false, 'message' => 'Format isi tidak valid'], 422);
}

$clean = [];
foreach (array_keys($default) as $key) {
    $value = trim((string)($content[$key] ?? ''));
    if ($value === '') {
        respond(['ok' => false, 'message' => 'Semua kolom wajib diisi'], 422);
    }
    $clean[$key] = mb_substr($value, 0, 1000);
}

if (file_put_contents($dataFile, json_encode($clean, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX) === false) {
    respond(['ok' => false, 'message' => 'Data tidak dapat disimpan'], 500);
}
respond(['ok' => true]);
