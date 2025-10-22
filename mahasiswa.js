const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get semua mahasiswa + pagination
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1; // halaman aktif
  const limit = parseInt(req.query.limit) || 5; // jumlah data per halaman
  const search = req.query.search ? `%${req.query.search}%` : '%%';
  const offset = (page - 1) * limit;

  // Hitung total data hasil pencarian
  db.query(
    'SELECT COUNT(*) AS total FROM mahasiswa WHERE nama LIKE ? OR nim LIKE ? OR jurusan LIKE ?',
    [search, search, search],
    (err, countResult) => {
      if (err) return res.status(500).json({ message: err });

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Ambil data hasil pencarian sesuai halaman
      db.query(
        'SELECT * FROM mahasiswa WHERE nama LIKE ? OR nim LIKE ? OR jurusan LIKE ? LIMIT ? OFFSET ?',
        [search, search, search, limit, offset],
        (err, results) => {
          if (err) return res.status(500).json({ message: err });

          res.json({
            data: results,
            currentPage: page,
            totalPages,
            totalData: total,
          });
        }
      );
    }
  );
});

// Tambah mahasiswa
router.post('/', (req, res) => {
  const { nim, nama, jurusan } = req.body;
  console.log('Data diterima:', req.body);
  
  db.query(
    'INSERT INTO mahasiswa (nim, nama, jurusan) VALUES (?, ?, ?)',
    [nim, nama, jurusan],
    (err, result) => {
      if (err) return res.status(500).json({ message: err });
      res.json({ message: 'Mahasiswa berhasil ditambahkan', id: result.insertId });
    }
  );
});

// Update mahasiswa
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nim, nama, jurusan } = req.body;
  db.query(
    'UPDATE mahasiswa SET nim=?, nama=?, jurusan=? WHERE id=?',
    [nim, nama, jurusan, id],
    (err) => {
      if (err) return res.status(500).json({ message: err });
      res.json({ message: 'Mahasiswa berhasil diperbarui' });
    }
  );
});

// Hapus mahasiswa
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM mahasiswa WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: err });
    res.json({ message: 'Mahasiswa berhasil dihapus' });
  });
});

module.exports = router;
