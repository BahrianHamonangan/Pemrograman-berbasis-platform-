const mysql = require('mysql2');

// konfigurasi koneksi
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',         // ubah sesuai user MySQL kamu
  password: '',         // ubah jika kamu pakai password
  database: 'crud_mahasiswa'
});

// cek koneksi
db.connect((err) => {
  if (err) {
    console.error('Koneksi ke database gagal:', err);
  } else {
    console.log('Terhubung ke database MySQL');
  }
});

module.exports = db;
