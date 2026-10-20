// Contoh konfigurasi runtime TokoMedia UI.
//
// Cara pakai:
//   1. Salin berkas ini menjadi `config.local.js`
//   2. Isi nilai token yang diberikan oleh pengelola API
//   3. `config.local.js` tidak akan ikut ter-commit (lihat .gitignore)
//
// PENTING: JANGAN menulis token langsung di index.html — berkas itu ikut Git
// dan dapat dibaca siapa pun.
window.TM_CONFIG = {
  token: 'ISI_TOKEN_API_DI_SINI'
  // apiBase: 'https://www.tokomedia.org/api/index.php/api'
};
