document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('mahasiswa-form');
    const tableBody = document.getElementById('mahasiswa-list');
    const mahasiswaIdInput = document.getElementById('mahasiswa-id');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-button');
    const cancelButton = document.getElementById('cancel-button');
    const searchInput = document.getElementById('search-input');
    const paginationContainer = document.getElementById('pagination-container');

    const API_URL = 'http://localhost:3000/api/mahasiswa';

    // State global
    let state = {
        searchTerm: '',
        currentPage: 1,
        limit: 5
    };

    // 🔹 READ: Ambil data dari backend (dengan pagination + search)
    async function getMahasiswa(page = 1) {
        try {
            const response = await fetch(
                `${API_URL}?page=${page}&limit=${state.limit}&search=${encodeURIComponent(state.searchTerm)}`
            );
            const result = await response.json();
            const mahasiswa = result.data;

            renderTable(mahasiswa);
            renderPagination(result.currentPage, result.totalPages);
        } catch (error) {
            console.error('Gagal mengambil data:', error);
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Gagal memuat data.</td></tr>';
        }
    }

    // 🔹 Render tabel
    function renderTable(mahasiswa) {
        tableBody.innerHTML = '';
        if (!mahasiswa || mahasiswa.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Data tidak ditemukan.</td></tr>';
            return;
        }

        mahasiswa.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${m.nim}</td>
                <td>${m.nama}</td>
                <td>${m.jurusan}</td>
                <td>
                    <button class="edit" data-id="${m.id}">Edit</button>
                    <button class="delete" data-id="${m.id}">Hapus</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // 🔹 Render tombol pagination
    function renderPagination(currentPage, totalPages) {
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = i === currentPage ? 'active' : '';
            button.addEventListener('click', () => {
                state.currentPage = i;
                getMahasiswa(i);
            });
            paginationContainer.appendChild(button);
        }
    }

    // 🔹 CREATE / UPDATE
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = mahasiswaIdInput.value;
        const nim = document.getElementById('nim').value.trim();
        const nama = document.getElementById('nama').value.trim();
        const jurusan = document.getElementById('jurusan').value.trim();

        if (!nim || !nama || !jurusan) {
            alert('Harap isi semua field.');
            return;
        }

        const data = { nim, nama, jurusan };
        let url = API_URL;
        let method = 'POST';

        if (id) {
            url = `${API_URL}/${id}`;
            method = 'PUT';
        }

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            resetForm();
            getMahasiswa(state.currentPage);
        } catch (error) {
            console.error('Gagal menyimpan data:', error);
        }
    });

    // 🔹 DELETE & EDIT
    tableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('delete')) {
            if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                try {
                    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    getMahasiswa(state.currentPage);
                } catch (error) {
                    console.error('Gagal menghapus data:', error);
                }
            }
        }

        if (target.classList.contains('edit')) {
            try {
                const res = await fetch(`${API_URL}/${id}`);
                const data = await res.json();
                const m = Array.isArray(data.data) ? data.data[0] : data;

                mahasiswaIdInput.value = m.id;
                document.getElementById('nim').value = m.nim;
                document.getElementById('nama').value = m.nama;
                document.getElementById('jurusan').value = m.jurusan;

                formTitle.textContent = 'Ubah Data Mahasiswa';
                submitButton.textContent = 'Simpan Perubahan';
                cancelButton.classList.remove('hidden');
                window.scrollTo(0, 0);
            } catch (error) {
                console.error('Gagal mengambil data untuk edit:', error);
            }
        }
    });

    // 🔹 SEARCH (langsung ke backend)
    searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        getMahasiswa(1);
    });

    // 🔹 RESET FORM
    function resetForm() {
        form.reset();
        mahasiswaIdInput.value = '';
        formTitle.textContent = 'Tambah Mahasiswa Baru';
        submitButton.textContent = 'Tambah';
        cancelButton.classList.add('hidden');
    }

    cancelButton.addEventListener('click', resetForm);

    // 🔹 Load awal
    getMahasiswa();
});
