<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Helper hashing password dengan `password_hash()` (bcrypt/argon2) plus
 * jalur upgrade otomatis dari hash SHA-1 lama.
 *
 * Pemakaian saat login:
 *
 *   $this->load->library('password_hash');
 *   $result = $this->password_hash->verify_and_upgrade(
 *       $input_password,
 *       $row['password'],
 *       $row['password_algo']
 *   );
 *   if ($result['valid']) {
 *       if ($result['upgraded']) {
 *           // simpan $result['hash'] ke kolom password,
 *           // set password_algo = $result['algo']
 *       }
 *   }
 */
class Password_hash
{

    /** Algoritma default untuk hash baru. */
    private $algo = PASSWORD_BCRYPT;

    /** Algoritma yang dikenali pada kolom `password_algo`. */
    private $known = array('bcrypt', 'argon2i', 'argon2id', 'sha1');

    public function __construct()
    {
        if (defined('PASSWORD_ARGON2ID')) {
            $this->algo = PASSWORD_ARGON2ID;
        }
    }

    /**
     * Buat hash baru dari password Kredensial dihapus dari riwayat Git; gunakan environment variable atau secrets.local.php.
     */
    public function hash($password)
    {
        return password_hash($password, $this->algo);
    }

    /**
     * Nama algoritma yang dipakai `hash()`.
     */
    public function algo_name()
    {
        if ($this->algo === PASSWORD_BCRYPT) {
            return 'bcrypt';
        }
        if (defined('PASSWORD_ARGON2ID') && $this->algo === PASSWORD_ARGON2ID) {
            return 'argon2id';
        }
        if (defined('PASSWORD_ARGON2I') && $this->algo === PASSWORD_ARGON2I) {
            return 'argon2i';
        }
        return 'bcrypt';
    }

    /**
     * Verifikasi password terhadap hash tersimpan.
     *
     * Mendukung hash modern (`$2y$`, `$argon2...`) dan hash SHA-1 lama
     * (40 karakter heksadesimal).
     *
     * @param string      $password Password Kredensial dihapus dari riwayat Git; gunakan environment variable atau secrets.local.php dari user
     * @param string      $stored   Nilai kolom `password`
     * @param string|null $algo     Nilai kolom `password_algo` (boleh NULL)
     *
     * @return array{valid:bool, upgraded:bool, hash:string|null, algo:string|null}
     */
    public function verify_and_upgrade($password, $stored, $algo = null)
    {
        $result = array('valid' => false, 'upgraded' => false, 'hash' => null, 'algo' => null);

        if (!is_string($stored) || $stored === '') {
            return $result;
        }

        $isModern = (strpos($stored, '$2y$') === 0
            || strpos($stored, '$2a$') === 0
            || strpos($stored, '$argon2') === 0);

        if ($isModern) {
            $result['valid'] = password_verify($password, $stored);
            $result['algo'] = $algo !== null ? $algo : $this->algo_name();
            if ($result['valid'] && password_needs_rehash($stored, $this->algo)) {
                $result['hash'] = $this->hash($password);
                $result['algo'] = $this->algo_name();
                $result['upgraded'] = true;
            }
            return $result;
        }

        // Hash lama: SHA-1 tanpa salt (40 karakter hex)
        if (preg_match('/^[0-9a-f]{40}$/i', $stored)) {
            if (hash_equals(strtolower($stored), sha1($password))) {
                $result['valid'] = true;
                $result['hash'] = $this->hash($password);
                $result['algo'] = $this->algo_name();
                $result['upgraded'] = true;
            }
            return $result;
        }

        return $result;
    }

    /**
     * Daftar algoritma yang dikenali (untuk validasi input).
     */
    public function known_algos()
    {
        return $this->known;
    }
}
