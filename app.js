const express = require('express');
const app = express();

const tododb = require('./routes/tododb.js');
const adminRoutes = require('./routes/adminRoutes');
const todoProduct = require('./routes/todoProduct.js');
const todoUsers = require('./routes/todoUsers.js');
const menuRoutes = require('./routes/menu.js');

require('dotenv').config();
const port = process.env.PORT;

const db = require('./database/db');
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session');
// Mengimpor middleware
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated, isUser, isAdmin } = require('./middlewares/middleware.js');
const cors = require('cors');
app.use(cors());

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


app.use(expressLayouts);
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Gunakan secret key yang aman
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set ke true jika menggunakan HTTPS
}));

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/product', todoProduct);
app.use("/pesanan", tododb);
app.use("/users", todoUsers);
app.use('/menu', menuRoutes);



app.get('/', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    res.render('index', {
        layout: 'layouts/main-layout',
        isLoggedIn: isLoggedIn
    });
});

app.get('/about', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    res.render('about',{
        layout: 'layouts/main-layout',
        isLoggedIn: isLoggedIn
    });
});

app.get('/contact', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    res.render('contact',{
        layout: 'layouts/main-layout',
        isLoggedIn: isLoggedIn
    });
});

app.get('/menu', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    res.render('menu',{
        layout: 'layouts/main-layout',
        isLoggedIn: isLoggedIn
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});