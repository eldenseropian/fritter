/**
 * Routes for the home page, which provides login and signup options.
 */
var express = require('express');
var router = express.Router();
var User = require('../schemas.js').User;

/**
 * The home page gives login and signup options.
 */
router.get('/', function(req, res) {
    req.session.user = undefined;
    res.render('index.jade');
});

/**
 * Posting from home triggers either a login or a signup, depending on the
 * body of the request. The request must specifiy existingUser for a login
 * or newUser for a signup. The request must also contain a password. If
 * any of these fields are missing, an error message is shown in the browser.
 */
router.post('/', function(req, res) {
    if (req.body.existingUser !== undefined) {
        login(req, res);
    } else if (req.body.newUser !== undefined) {
        signup(req, res);
    } else {
        renderError(res, 'The server has encountered an unexpected state.' +
            ' Please refresh and try again.');
    }
});

/**
 * If the username and password in the body of the request are found in the
 * database, the user is logged in. The user's id is recorded on the session
 * and the user is redirected to the view all tweets page. If the user is
 * not successfully logged in, an error message is shown in the browser. The
 * body of the request must contain the fields existingUser and password.
 */
function login(req, res) {
    var query = {
        username: req.body.existingUser,
        password: req.body.password
    };

    User.findOne(query, function(err, user) {
        if (err || user === null) {
            renderError(res, 
                'Sorry, we were unable to find your username and password. ' +
                'Please try again or click "Sign Up" to create a new account.'
            );
        } else {
            req.session.user = user._id;
            res.redirect('/tweets');
        }
    });
};

/**
 * If the username and password in the body of the request are valid, the user
 * is signed up and logged in. The new user is stored in the databse. The user's
 * id is recorded on the session and the user is redirected to the view all
 * tweets page. If the requested username or password are invalid, an error
 * message is shown in the browser. The body of the request must contain the
 * fields newUser and password.
 */
function signup(req, res) {
    var newUser = new User({
        username: req.body.newUser,
        password: req.body.password
    });

    newUser.save(function(err, savedUser) {
        if (err) {
            renderError(res, 'Sorry, we were unable to create your account.');
        } else {
            req.session.user = savedUser._id;
            res.redirect('/tweets');
        }
    });
};

/**
 * Displays an error on the home page.
 * @param  {string} err The error message to display.
 */
function renderError(res, err) {
    res.render('index.jade', {'error': err});
};

module.exports = router;

require('./tweets.js');
require('./users.js');