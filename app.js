const express = require('express');
const app = express();

//Import Routes
const pesananOnline = require('./routes/pesananOnline');
const tododb = require('./routes/tododb.js');
const adminRoutes = require('./routes/adminRoutes');
const todoProduct = require('./routes/todoProduct.js');
const todoUsers = require('./routes/todoUsers.js');
const menuRoutes = require('./routes/menu.js');
const authRoutes = require('./routes/authRoutes');

require('dotenv').config();
const port = process.env.PORT;
const db = require('./database/db');
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session');

// Mengimpor middleware
const { isAuthenticated, isUser, isAdmin } = require('./middlewares/middleware.js');
const cors = require('cors');
app.use(cors());

//View engine dan static files
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

app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    next();
});

app.use((req, res, next) => {
    res.locals.title = 'Warmindo'; 
    next();
});

//Routing
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/product', todoProduct);
app.use("/pesanan", tododb);
app.use("/users", todoUsers);
app.use('/menu', menuRoutes);
app.use('/pesananOnline', pesananOnline);



app.get('/', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    res.render('index', {
        title: 'Home',
        layout: 'layouts/main-layout',
        isLoggedIn: isLoggedIn
    });
});

app.get('/about', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    res.render('about',{
        title: 'About',
        layout: 'layouts/main-layout',
        isLoggedIn: isLoggedIn
    });
});

app.get('/contact', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    res.render('contact',{
        title: 'Contact',
        layout: 'layouts/main-layout',
        isLoggedIn: isLoggedIn
    });
});

app.get('/cart', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;

    // Pastikan cart diambil dari session
    const cart = req.session.cart || [];
    res.render('cart', {
        layout: false,
        isLoggedIn: isLoggedIn,
        cart: cart
    });
});

app.get('/checkout', isUser, (req, res) => {
    const cart = req.session.cart || []; 
    res.render('checkout', {
        cart, 
        layout: false 
    });
});


app.listen(port,() => {
    console.log(`Server running at http://localhost:${port}/`);
});

module.exports = app;