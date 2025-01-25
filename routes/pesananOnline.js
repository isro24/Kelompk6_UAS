const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
    db.query('SELECT * FROM pesanan_online', (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(results);
    });
});

// Update status pesanan
// Update status pesanan
router.put('/:id', (req, res) => {
    const { status } = req.body;

    // Validasi status
    const validStatuses = ['Tertunda', 'Selesai', 'Dibatalkan', 'Dikirim'];
    if (!validStatuses.includes(status)) {
        return res.status(400).send('Status tidak valid');
    }

    // Query untuk memperbarui status pesanan
    db.query('UPDATE pesanan_online SET status = ? WHERE id = ?', [status, req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Pesanan tidak ditemukan');
        res.status(200).send();  // Mengirimkan respons sukses
    });
});

// Menghapus pesanan berdasarkan ID
router.delete('/:id', (req, res) => {
    const pesananId = req.params.id;


    // Hapus data dari tabel detail_pesanan terlebih dahulu
    db.query('DELETE FROM detail_pesanan WHERE pesanan_id = ?', [pesananId], (err) => {
        if (err) return res.status(500).send('Gagal menghapus detail pesanan');

        // Setelah data terkait dihapus, hapus data dari tabel pesanan_online
        db.query('DELETE FROM pesanan_online WHERE id = ?', [pesananId], (err) => {
            if (err) return res.status(500).send('Gagal menghapus pesanan');
            res.status(204).send(); // Pesanan berhasil dihapus
        });
    });
});


router.get('/cart-data', (req, res) => {
    const cart = req.session.cart || [];
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0); // Hitung total item
    res.json({ cart, totalItems });
});


// Inisialisasi cart di session
router.post('/add-to-cart', (req, res) => {
    const { id, nama_product, harga, stok } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    const cart = req.session.cart;
    const existingProduct = cart.find(item => item.id == id);

    if (existingProduct) {
        existingProduct.qty++;
    } else {
        cart.push({ id, nama_product, harga: parseFloat(harga), stok, qty: 1 });
    }

    res.status(200).json({ message: `${nama_product} berhasil ditambahkan ke keranjang!` });
});

router.post('/checkout', (req, res) => {
    const { metode_pembayaran, alamat } = req.body;

    if (!alamat) {
        return res.status(400).send('Alamat pengiriman harus diisi!');
    }

    const cart = req.session.cart || [];
    if (cart.length === 0) {
        return res.status(400).send('Keranjang kosong!');
    }

    const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

    // Simpan ke tabel pesanan_online
    db.query(
        'INSERT INTO pesanan_online (stok, total_pembayaran, metode_pembayaran, alamat, status) VALUES (?, ?, ?, ?, ?)',
        [cart.length, total, metode_pembayaran, alamat, 'Tertunda'],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Terjadi kesalahan saat memproses pesanan!');
            }

            const pesananId = result.insertId;

            // Simpan setiap item ke tabel detail_pesanan secara berurutan
            let queryCount = 0;
            cart.forEach((item) => {
                const subtotal = item.harga * item.qty;
                db.query(
                    'INSERT INTO detail_pesanan (pesanan_id, product_id, kuantitas, subtotal) VALUES (?, ?, ?, ?)',
                    [pesananId, item.id, item.qty, subtotal],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Terjadi kesalahan saat menyimpan detail pesanan!');
                        }

                        queryCount++;
                        // Jika semua detail pesanan sudah disimpan
                        if (queryCount === cart.length) {
                            // Update stok produk
                            let updateCount = 0;
                            cart.forEach((item) => {
                                db.query(
                                    'UPDATE product SET stok = stok - ? WHERE id = ?',
                                    [item.qty, item.id],
                                    (err) => {
                                        if (err) {
                                            console.error(err);
                                            return res.status(500).send('Terjadi kesalahan saat mengupdate stok!');
                                        }

                                        updateCount++;
                                        // Jika semua stok sudah diperbarui
                                        if (updateCount === cart.length) {
                                            req.session.cart = [];
                                            res.redirect('/');
                                        }
                                    }
                                );
                            });
                        }
                    }
                );
            });
        }
    );
});

// Mengurangi produk dari keranjang
router.post('/remove-from-cart', (req, res) => {
    const { id } = req.body;

    if (!req.session.cart) {
        return res.status(400).json({ message: 'Keranjang kosong!' });
    }

    const cart = req.session.cart;
    const productIndex = cart.findIndex(item => item.id == id);

    if (productIndex !== -1) {
        cart[productIndex].qty--;
        if (cart[productIndex].qty === 0) {
            cart.splice(productIndex, 1);
        }
        return res.status(200).json({ message: 'Produk berhasil dikurangi!' });
    }

    res.status(404).json({ message: 'Produk tidak ditemukan di keranjang!' });
});

router.get('/count', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM pesanan_online', (err, results) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.json({ totalUsers: results[0].total });
    });
});

router.get('/:id/details', (req, res) => {
    const pesananId = req.params.id;

    if (!pesananId) {
        return res.status(400).send('ID pesanan tidak valid');
    }
    
    db.query(
        `SELECT dp.kuantitas, dp.subtotal, p.nama_product, p.harga
         FROM detail_pesanan dp
         JOIN product p ON dp.product_id = p.id
         WHERE dp.pesanan_id = ?`,
        [pesananId],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            if (results.length === 0) {
                return res.status(404).send('Detail pesanan tidak ditemukan');
            }

            res.json(results);
        }
    );
});


module.exports = router;
