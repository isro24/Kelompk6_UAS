const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { isAdmin } = require('../middlewares/middleware');
const { printAllProducts } = require('../controllers/productController');

// Rute untuk dashboard admin
router.get('/dashboard', isAdmin, (req, res) => {
    const totalUsersQuery = 'SELECT COUNT(*) AS totalUsers FROM users';
    const totalProductsQuery = 'SELECT COUNT(*) AS totalProducts FROM product';
    const totalOrdersQuery = 'SELECT COUNT(*) AS totalOrders FROM pesanan_online';
    const totalRevenueQuery = `
        SELECT COALESCE(SUM(total_pembayaran), 0) AS totalRevenue
        FROM pesanan_online
        WHERE status = 'Selesai'
    `;
    const lowStockQuery = 'SELECT nama_product, stok FROM product WHERE stok < 90';

    db.query(totalUsersQuery, (err, totalUsersResult) => {
        if (err) {
            console.error('Error fetching total users:', err);
            return res.status(500).send('Error mengambil data pengguna');
        }

        const totalUsers = totalUsersResult[0].totalUsers;

        db.query(totalProductsQuery, (err, totalProductsResult) => {
            if (err) {
                console.error('Error fetching total products:', err);
                return res.status(500).send('Error mengambil data produk');
            }

            const totalProducts = totalProductsResult[0].totalProducts;

            db.query(totalOrdersQuery, (err, totalOrdersResult) => {
                if (err) {
                    console.error('Error fetching total orders:', err);
                    return res.status(500).send('Error mengambil data pesanan');
                }

                const totalOrders = totalOrdersResult[0].totalOrders;

                db.query(totalRevenueQuery, (err, totalRevenueResult) => {
                    if (err) {
                        console.error('Error fetching total revenue:', err);
                        return res.status(500).send('Error mengambil data pendapatan');
                    }

                    const totalRevenue = totalRevenueResult[0].totalRevenue;

                    // Query untuk stok rendah
                    db.query(lowStockQuery, (err, lowStockResult) => {
                        if (err) {
                            console.error('Error fetching low stock products:', err);
                            return res.status(500).send('Error mengambil data stok rendah');
                        }

                        // Menyusun data produk dengan stok rendah
                        const lowStockProducts = lowStockResult.map(product => ({
                            name: product.nama_product,
                            stock: product.stok
                        }));

                        // Render dashboard dengan data
                        res.render('admin/dashboard', {
                            layout: 'layouts/admin-layout',
                            title: 'Dashboard',
                            totalUsers,
                            totalProducts,
                            totalOrders,
                            totalRevenue,
                            lowStockProducts
                        });
                    });
                });
            });
        });
    });
});

// Rute untuk pesanan admin
router.get('/pesanan',  isAdmin,(req, res) => {
    res.render('admin/pesanan', {
        layout: 'layouts/admin-layout',
        title: 'Pesanan Offline'
    });
});

// Rute untuk users admin
router.get('/users',  isAdmin,(req, res) => {
    res.render('admin/users', { 
        layout: 'layouts/admin-layout',
        title: 'Users' });
});


// Rute untuk produk admin
router.get('/product',  isAdmin,(req, res) => {
    db.query('SELECT * FROM product', (err, results) => {
        if (err) return res.status(500).send('Error mengambil data produk');
        res.render('admin/product', {
            layout: 'layouts/admin-layout',
            title: 'Product',
            product: results 
        });
    });
});

// Rute untuk pesanan online admin
router.get('/pesananOnline', (req, res) => {
    db.query('SELECT * FROM pesanan_online', (err, results) => {
        if (err) return res.status(500).send('Error mengambil data pesanan');
        res.render('admin/pesananOnline', {
            layout: 'layouts/admin-layout',
            title: 'Pesanan Online',
            pesananOnline: results 
        });
    });
});

router.post('/products/print', isAdmin, printAllProducts);

module.exports = router;
