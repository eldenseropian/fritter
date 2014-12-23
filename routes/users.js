/**
 * Routes for user-related pages, which includes viewing users and following
 * users. All routes in this file require the user to be logged in to access
 * them.
 */

var router = require('./index.js');
var User = require('../schemas').User;
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * If the user is logged in, show all users in the database. If an error is
 * encountered retrieving the users from the database, show an error message
 * in the browser.
 */
router.get('/users', function(req, res) {
    if (req.session.user === undefined) return res.redirect('/');

    User.find({}).populate('following').exec(function(err, users){
        if (err || users === null) {
            return renderError(res,
                'Sorry, we were unable to get the list of users for you.');
        }

        var following = [];
        for (var i = 0; i < users.length; i++) {
            if (users[i]._id == req.session.user) {
                following = users[i].following;
            }
        }
        var following = following.map(function(user) {
            return {
                username: user.username,
                id: user._id
            };
        });


        res.render('view_users.jade', {
            users: users,
            currentUser: req.session.user,
            following: following
        });
    });
});

/**
 * Follow a user, specified by id in the URL. If an error is encountered, show
 * an error message in the browser.
 */
router.post('/users/follow/:id', function(req, res, next) {
    var errorMessage = 'Sorry, could not save following';

    User.findOne({_id: ObjectId(req.session.user)}, function(err, user) {
        if (err || user === null) return res.json({error: errorMessage});

        if (user.following.indexOf(ObjectId(req.param('id'))) === -1) {
            user.following.push(ObjectId(req.param('id')));
            user.save(function(err) {
                if (err) return res.json({error: errorMessage});

                user.populate('following', function(err, user) {
                    if (err) return res.json({error: errorMessage});

                    var following = user.following.map(function(user) {
                        return {
                            username: user.username,
                            id: user._id
                        };
                    });

                    res.json({following: following});
                });
                
            });
        }
    });
});

/**
 * Unfollow a user, specified by id in the URL. If an error is encountered, show
 * an error message in the browser.
 */
router.post('/users/unfollow/:id', function(req, res, next) {
    User.findOne({_id: ObjectId(req.session.user)}, function(err, user) {
        if (err || user === null) {
            return res.json({error: 'Could not find current user.'});
        } 
        
        user.following.splice(user.following.indexOf(req.param('id')), 1);
        user.save(function(err) {
            if (err) {
                return res.json({error: 'Sorry, we were unable to update your preferences.'});
            }

            user.populate('following', function(err, user) {
                if (err) {
                    return res.json({error: 'Could not save un-following.'});
                }
            
                var following = user.following.map(function(user) {
                    return {
                        username: user.username,
                        id: user._id
                    };
                });
                res.json({'following': following});
            });
        });
    });
});

/**
 * Show an error on the view users page.
 * @param  {string} err The error message to display.
 */
function renderError(res, err) {
    res.render('view_users.jade', {error: err});
}