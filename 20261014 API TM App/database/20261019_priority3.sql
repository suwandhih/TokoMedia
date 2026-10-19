-- ---------------------------------------------------------------------------
-- TokoMedia API — Migrasi Prioritas 3
-- Tanggal: 19 Oktober 2026
--
-- Jalankan sekali pada database `tokomedia` sebelum men-deploy API versi ini.
--   mysql -u <user> -p tokomedia < 20261019_priority3.sql
-- ---------------------------------------------------------------------------

-- 1. Tabel pencatat like per client (proteksi duplikat `other/likevideo`)
CREATE TABLE IF NOT EXISTS `videolike` (
  `seq` int(11) NOT NULL AUTO_INCREMENT,
  `videoid` int(11) NOT NULL,
  `clientid` varchar(64) NOT NULL,
  `likedate` datetime DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `uniq_video_client` (`videoid`, `clientid`),
  KEY `idx_clientid` (`clientid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Kolom hash password modern (bcrypt/argon2 butuh >= 60 karakter).
--    Kolom lama `password` bertipe varchar(40) sehingga tidak cukup.
ALTER TABLE `user_login`
  MODIFY COLUMN `password` varchar(255) NOT NULL;

-- 3. Tandai algoritma hash yang dipakai.
--    NULL = masih SHA-1 lama, perlu di-upgrade saat login berikutnya.
ALTER TABLE `user_login`
  ADD COLUMN `password_algo` varchar(20) DEFAULT NULL AFTER `password`;

-- Catatan:
--   * Hash SHA-1 lama TIDAK bisa dikonversi langsung ke bcrypt.
--   * Gunakan `application/libraries/Password_hash.php`:
--       - verify_and_upgrade($input, $hashLama, $algoLama) saat login
--       - hash($input) saat membuat/mengganti password
--   * Setelah semua user login minimal sekali, kolom `password_algo`
--     akan terisi 'bcrypt'/'argon2id' dan hash lama tidak dipakai lagi.
