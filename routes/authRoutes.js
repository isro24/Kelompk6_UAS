const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const router = express.Router();

// Route Signup
router.post('/signup', (req, res) => {
    const { username, email, password, confirm_password} = req.body;

    // Cek apakah password dan confirm password sama
    if (password !== confirm_password) {
        return res.status(400).send('Password dan konfirmasi password harus sama');
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) =>{
        if (err) return res.status(500).send('Error fetching user');
        if (result.length > 0) return res.status(400).send('Email sudah terdaftar');
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).send('Error hashing password');
    
            db.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
                [username, email, hash, 'user'], (err, result) => {
                    if (err) return res.status(500).send('Error registering user');
                    res.redirect('/login'); // Redirect ke halaman login setelah registrasi berhasil
                });
        });
    } )
});

// Route untuk menampilkan form signup
router.get('/signup', (req, res) => {
    res.render('signup', {
        layout: false
    });
});

// Route Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send('Error fetching user');
        if (results.length === 0) return res.status(400).send('User not found');

        bcrypt.compare(password, results[0].password, (err, isMatch) => {
            if (err) return res.status(500).send('Error checking password');
            if (!isMatch) return res.status(401).send('Incorrect password');

            // Simpan userId dan role dalam sesi setelah login berhasil
            req.session.user = {
                id: results[0].id,
                username: results[0].username,
                role: results[0].role
            };

            // Redirect berdasarkan role
            if (results[0].role === 'admin') {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/'); // Jika role 'user'
            }
        });
    });
});



// Route untuk menampilkan form login
router.get('/login', (req, res) => {
    res.render('login', {
        layout: false
    });
});

// Route Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error logging out');
        res.redirect('/'); // Arahkan ke halaman login setelah logout
    });
});

module.exports = router;