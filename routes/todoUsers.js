const express = require('express');
const router = express.Router();
const db = require('../database/db');

const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(results);
    });
});

router.post('/', async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).send('Semua field harus diisi');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username.trim(), email.trim(), hashedPassword, role.trim()],
            (err, results) => {
                if (err) return res.status(500).send('Internal Server Error');
                res.status(201).json({ id: results.insertId, username, email, role });
            }
        );
    } catch (error) {
        res.status(500).send('Error saat hashing password');
    }
});



router.delete('/:id', (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).send('User successfully deleted');
    });
});

router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { username, email, password, role } = req.body;

    // Update query
    const updateQuery = 'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?';
    const updateParams = [username, email, role, userId];

    // Jika password diisi, hash password terlebih dahulu
    if (password) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).send('Error hashing password');

            const updateQueryWithPassword = 'UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?';
            const updateParamsWithPassword = [username, email, hashedPassword, role, userId];

            db.query(updateQueryWithPassword, updateParamsWithPassword, (err) => {
                if (err) return res.status(500).send('Error updating user');
                res.status(200).send('User updated successfully');
            });
        });
    } else {
        // Jika password tidak diisi, hanya update data lainnya
        db.query(updateQuery, updateParams, (err) => {
            if (err) return res.status(500).send('Error updating user');
            res.status(200).send('User updated successfully');
        });
    }
});

router.get('/count', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM users', (err, results) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.json({ totalUsers: results[0].total });
    });
});


module.exports = router;
