app.get('/', ensureAuthenticated, function(req,res) {

});

app.get('/users', ensureAuthenticated, ensureIsAdmin, function(req,res) {

});

app.get('/users/:id', ensureAuthenticated, ensureIsAdmin, function(req,res) {

});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.flash('error', 'You need to be logged in!');
    res.redirect('/login')
}

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureIsAdmin(req, res, next) {
    if (req.user.group == "admin") { return next();}
    req.flash('error', 'Access denied!');
    res.redirect('/')
}