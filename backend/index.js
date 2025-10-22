const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mahasiswaRoutes = require('./routes/mahasiswa');

const app = express();
const PORT = 3000;

// middleware
app.use(cors({
    // Izinkan frontend untuk mengakses header X-Total-Count
    exposedHeaders: ['X-Total-Count'],
}));
app.use(express.json());

// --- ROUTES API ---

// READ: Mendapatkan semua data mahasiswa dengan fitur PENCARIAN & PAGINATION
app.get('/mahasiswa', (req, res) => {
    // Ambil query parameters
    const { q, _page = 1, _limit = 5 } = req.query;
    
    let data = [...mahasiswa];

    // 1. Logika Pencarian
    if (q) {
        const searchTerm = q.toLowerCase();
        data = data.filter(m => 
            m.nama.toLowerCase().includes(searchTerm) ||
            m.nim.toLowerCase().includes(searchTerm) ||
            m.jurusan.toLowerCase().includes(searchTerm)
        );
    }
    
    // 2. Logika Pagination
    const page = parseInt(_page);
    const limit = parseInt(_limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedData = data.slice(startIndex, endIndex);

    // Set header 'X-Total-Count' untuk memberitahu frontend total data (setelah difilter)
    res.setHeader('X-Total-Count', data.length);
    
    res.json(paginatedData);
});

// CREATE: Menambah data mahasiswa baru
app.post('/mahasiswa', (req, res) => {
    const { nim, nama, jurusan } = req.body;
    if (!nim || !nama || !jurusan) {
        return res.status(400).json({ message: 'NIM, Nama, dan Jurusan harus diisi' });
    }
    
    lastId++;
    const newMahasiswa = {
        id: lastId,
        nim,
        nama,
        jurusan
    };
    mahasiswa.push(newMahasiswa);
    res.status(201).json(newMahasiswa);
});

// UPDATE: Mengubah data mahasiswa berdasarkan ID
app.put('/mahasiswa/:id', (req, res) => {
    const { id } = req.params;
    const { nim, nama, jurusan } = req.body;
    const index = mahasiswa.findIndex(m => m.id == id);

    if (index === -1) {
        return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
    }

    mahasiswa[index] = { ...mahasiswa[index], nim, nama, jurusan };
    res.json(mahasiswa[index]);
});

// DELETE: Menghapus data mahasiswa berdasarkan ID
app.delete('/mahasiswa/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = mahasiswa.length;
    mahasiswa = mahasiswa.filter(m => m.id != id);

    if (mahasiswa.length === initialLength) {
        return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
    }

    res.status(200).json({ message: 'Data mahasiswa berhasil dihapus' });
});

// routes
app.use('/api/mahasiswa', mahasiswaRoutes);

// server start
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
