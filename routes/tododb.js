const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Mengimpor koneksi database

// Endpoint untuk mendapatkan semua pesanan
router.get('/', (req, res) => {
    db.query('SELECT * FROM pesanan', (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(results);
    });
});

// Endpoint untuk mendapatkan pesanan berdasarkan ID
router.get('/:id_pesanan', (req, res) => {
    db.query('SELECT * FROM pesanan WHERE id_pesanan = ?', [req.params.id_pesanan], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.length === 0) return res.status(404).send('Pesanan tidak ditemukan');
        res.json(results[0]);
    });
});

// Endpoint untuk menambahkan pesanan baru
router.post('/', (req, res) => {
    const {
        nama_lengkap,
        jumlah_orang,
        nasi_goreng,
        mie_goreng,
        nasi_ayam_goreng,
        mie_kuah,
        magelangan,
        bubur_kacang_ijo,
        es_teh,
        es_jeruk,
        es_milo,
        kopi,
        pop_ice,
        teh_hangat,
        nomor_meja,
        special_request,
    } = req.body;

    if (!nama_lengkap || !jumlah_orang) {
        return res.status(400).send('Nama lengkap dan jumlah orang wajib diisi');
    }

    const sql = `
        INSERT INTO pesanan (
            nama_lengkap, jumlah_orang, nasi_goreng, mie_goreng,
            nasi_ayam_goreng, mie_kuah, magelangan, bubur_kacang_ijo,
            es_teh, es_jeruk, es_milo, kopi, pop_ice, teh_hangat,
            nomor_meja, special_request
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        nama_lengkap,
        jumlah_orang,
        nasi_goreng || 0,
        mie_goreng || 0,
        nasi_ayam_goreng || 0,
        mie_kuah || 0,
        magelangan || 0,
        bubur_kacang_ijo || 0,
        es_teh || 0,
        es_jeruk || 0,
        es_milo || 0,
        kopi || 0,
        pop_ice || 0,
        teh_hangat || 0,
        nomor_meja,
        special_request || null,
    ];

    db.query(sql, values, (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.status(201).json({ id_pesanan: results.insertId, ...req.body });
    });
});

// Endpoint untuk memperbarui pesanan
router.put('/:id_pesanan', (req, res) => {
    const {
        nama_lengkap,
        jumlah_orang,
        nasi_goreng,
        mie_goreng,
        nasi_ayam_goreng,
        mie_kuah,
        magelangan,
        bubur_kacang_ijo,
        es_teh,
        es_jeruk,
        es_milo,
        kopi,
        pop_ice,
        teh_hangat,
        nomor_meja,
        special_request,
    } = req.body;

    const sql = `
        UPDATE pesanan
        SET nama_lengkap = ?, jumlah_orang = ?, nasi_goreng = ?, mie_goreng = ?,
            nasi_ayam_goreng = ?, mie_kuah = ?, magelangan = ?, bubur_kacang_ijo = ?,
            es_teh = ?, es_jeruk = ?, es_milo = ?, kopi = ?, pop_ice = ?, teh_hangat = ?,
            nomor_meja = ?, special_request = ?
        WHERE id_pesanan = ?
    `;

    const values = [
        nama_lengkap,
        jumlah_orang,
        nasi_goreng || 0,
        mie_goreng || 0,
        nasi_ayam_goreng || 0,
        mie_kuah || 0,
        magelangan || 0,
        bubur_kacang_ijo || 0,
        es_teh || 0,
        es_jeruk || 0,
        es_milo || 0,
        kopi || 0,
        pop_ice || 0,
        teh_hangat || 0,
        nomor_meja,
        special_request || null,
        req.params.id_pesanan,
    ];

    db.query(sql, values, (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Pesanan tidak ditemukan');
        res.json({ id_pesanan: req.params.id_pesanan, ...req.body });
    });
});

// Endpoint untuk menghapus pesanan
router.delete('/:id_pesanan', (req, res) => {
    db.query('DELETE FROM pesanan WHERE id_pesanan = ?', [req.params.id_pesanan], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Pesanan tidak ditemukan');
        res.status(204).send();
    });
});



module.exports = router;
