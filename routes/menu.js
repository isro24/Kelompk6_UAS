const express = require('express');
const router = express.Router();
const connection = require('../database/db'); 

router.get('/', (req, res) => {
    connection.query('SELECT * FROM product WHERE kategori = "Makanan"', (err, makanan) => {
        if (err) {
            console.error('Error fetching makanan:', err);
            return res.status(500).send('Server error');
        }

        connection.query('SELECT * FROM product WHERE kategori = "Minuman"', (err, minuman) => {
            if (err) {
                console.error('Error fetching minuman:', err);
                return res.status(500).send('Server error');
            }

            res.render('menu', {
                title: 'Menu',
                makanan,
                minuman,
                layout: 'layouts/main-layout',
                isLoggedIn: req.session.user ? true : false
            });
        });
    });
});

module.exports = router;
