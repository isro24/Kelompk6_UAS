const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../database/db'); // Mengimpor koneksi database

// Konfigurasi penyimpanan file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Tempat penyimpanan gambar
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
    }
});

const upload = multer({ storage: storage });

// Endpoint untuk menambahkan produk baru
router.post('/', upload.single('image'), (req, res) => {
    const { nama_product, deskripsi, harga, stok, kategori } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Menyimpan path gambar jika ada

    if (!nama_product || !deskripsi || !harga || !stok || !kategori) {
        return res.status(400).send('Semua field harus diisi');
    }

    // Menyimpan produk ke database
    db.query('INSERT INTO product (nama_product, deskripsi, harga, stok, image, kategori) VALUES (?, ?, ?, ?, ?, ?)', 
    [nama_product.trim(), deskripsi.trim(), harga, stok, imageUrl, kategori.trim()], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        const newProduct = { 
            id: results.insertId, 
            nama_product: nama_product.trim(), 
            deskripsi: deskripsi.trim(), 
            harga, 
            stok, 
            image: imageUrl, 
            kategori: kategori.trim() 
        };
        res.status(201).json(newProduct); // Mengembalikan produk yang baru ditambahkan
    });
});

// Endpoint untuk mendapatkan semua produk
router.get('/', (req, res) => {
    db.query('SELECT * FROM product', (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(results); // Mengembalikan semua produk
    });
});

// Endpoint untuk mendapatkan produk berdasarkan ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM product WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.length === 0) return res.status(404).send('Produk tidak ditemukan');
        res.json(results[0]); // Mengembalikan produk berdasarkan ID
    });
});

// Endpoint untuk memperbarui produk
router.put('/:id', upload.single('image'), (req, res) => {
    const { nama_product, deskripsi, harga, stok, kategori } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Mengambil gambar lama dari database
    db.query('SELECT image FROM product WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.length === 0) return res.status(404).send('Produk tidak ditemukan');

        // Memperbarui data produk
        const updateQuery = imageUrl 
            ? 'UPDATE product SET nama_product = ?, deskripsi = ?, harga = ?, stok = ?, image = ?, kategori = ? WHERE id = ?' 
            : 'UPDATE product SET nama_product = ?, deskripsi = ?, harga = ?, stok = ?, kategori = ? WHERE id = ?';
        
        const updateParams = imageUrl 
            ? [nama_product, deskripsi, harga, stok, imageUrl, kategori, req.params.id] 
            : [nama_product, deskripsi, harga, stok, kategori, req.params.id];

        // Menjalankan query update
        db.query(updateQuery, updateParams, (updateErr, updateResults) => {
            if (updateErr) return res.status(500).send('Internal Server Error');
            if (updateResults.affectedRows === 0) return res.status(404).send('Produk tidak ditemukan');

            // Hapus gambar lama jika ada
            if (imageUrl && results[0].image) {
                const oldImagePath = path.join(__dirname, '..', results[0].image);
                fs.unlink(oldImagePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting old image:', unlinkErr);
                });
            }

            res.json({ id: req.params.id, nama_product, deskripsi, harga, stok, image: imageUrl, kategori });
        });
    });
});

// Endpoint untuk menghapus produk
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM product WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Produk tidak ditemukan');
        res.status(204).send(); // Menghapus produk dan mengembalikan status 204 (No Content)
    });
});

module.exports = router;