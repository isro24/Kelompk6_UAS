const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { isAdmin } = require('../middlewares/middleware');

// Rute untuk dashboard admin
router.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/dashboard', {
        layout: 'layouts/admin-layout',
        title: 'Admin Dashboard'
    });
});


// Rute untuk pesanan admin
router.get('/pesanan',  isAdmin,(req, res) => {
    res.render('admin/pesanan', {
        layout: 'layouts/admin-layout',
        title: 'Admin Pesanan Offline'
    });
});

router.get('/pesananOnline',  isAdmin,(req, res) => {
    res.render('admin/pesananOnline', {
        layout: 'layouts/admin-layout',
        title: 'Admin Pesanan Online'
    });
});

router.get('/users',  isAdmin,(req, res) => {
    res.render('admin/users', { 
        layout: 'layouts/admin-layout',
        title: 'Admin Users' });
});


// Rute untuk produk admin
router.get('/product',  isAdmin,(req, res) => {
    db.query('SELECT * FROM product', (err, results) => {
        if (err) return res.status(500).send('Error mengambil data produk');
        res.render('admin/product', {
            layout: 'layouts/admin-layout',
            title: 'Admin Product',
            product: results 
        });
    });
});

module.exports = router;
