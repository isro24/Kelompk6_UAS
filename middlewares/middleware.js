// Middleware untuk memeriksa autentikasi
function isAuthenticated(req, res, next) {
    if (req.user && req.user.role === 'user') {
        return next();
    } else {
        res.redirect('/login');
    }
}

function isAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    console.log('Session not found or user is not admin:', req.session);
    res.redirect('/login');
}


// Middleware untuk memeriksa apakah user adalah user biasa
function isUser(req, res, next) {
  if (req.session.user && req.session.user.role === 'user') {
      return next();
  }
  res.redirect('/login');
}

module.exports = { isAuthenticated, isAdmin, isUser };