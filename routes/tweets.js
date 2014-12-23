/**
 * Routes for tweet-related pages, which includes viewing tweets, editing
 * tweets, deleting tweets, and creating new tweets. All routes in this file
 * require the user to be logged in to access them.
 */

var router = require('./index.js');
var Tweet = require('../schemas').Tweet;
var User = require('../schemas').User;
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * If the user is logged in, show all tweets in the database. If an error is
 * encountered retrieving the tweets from the database, show an error message
 * in the browser.
 */
router.get('/tweets', function(req, res) {
    if (req.session.user === undefined) return res.redirect('/');

    var errorMessage = 'Sorry, we were unable to get the tweets for you.';
    Tweet.find({}).populate('creator').exec(function(err, tweets){
        if (err || tweets === null) return renderError(res, errorMessage);

        User.findOne({_id: ObjectId(req.session.user)}, function(err, user) {
            if (err || user === null) return renderError(res, errorMessage);

            followingTweets = [];
            for (var i = 0; i < tweets.length; i++) {
                if (user.following.indexOf(tweets[i].creator._id.toString()) !== -1) {
                    followingTweets.push(tweets[i]);
                }
            }

            res.render('tweets/view_tweets.jade', {
                tweets: tweets,
                currentUser: req.session.user,
                followingTweets: followingTweets,
                favorites: user.favorites
            });
        });
    });
});

/**
 * If the user is logged in, go to the new tweet page.
 */
router.get('/tweets/new', function(req, res) {
    if (req.session.user === undefined) return res.redirect('/');
    
    res.render('tweets/new_tweet.jade');
});

/**
 * Save a new tweet. If the new tweet is invalid, show an error message in the
 * browser. Once the new tweet is saved, redirect to the list of all tweets.
 * Requires the body to contain a content field, and the session to have a user
 * specified.
 */
router.post('/tweets/create', function(req, res, next) {
    var newTweet = new Tweet({
        creator: ObjectId(req.session.user),
        content: req.body.content,
        favoriteCount: 0
    });

    newTweet.save(function(err) {
        if (err) {
            return res.render('tweets/new_tweet.jade', {
                'tweet': req.body.content
            });
        }
         
        res.redirect('/tweets');
    });
});

router.get('/tweets/edit/:id', function(req, res) {
    if (req.session.user === undefined) return res.redirect('/');
    
    var query = {_id: ObjectId(req.param('id'))};
    Tweet.findOne(query).populate('creator').lean().exec(function(err, tweet) {
        if (err || tweet === null) {
            return renderError(res,
                'Sorry, we were unable to fetch that tweet');
        } 

        if (tweet.creator._id.toString() !== req.session.user) {
            return renderError(res,
                'You don\'t have permission to edit that tweet!');
        }
         
        res.render('tweets/edit_tweet.jade', {'tweet': tweet});
    });
});

/**
 * Edits an existing tweet. If the edit is invalid or the tweet cannot be found,
 * displays a message in the browser. Once the tweet is updated, redirects to
 * the list of all tweets. Requires the id parameter of the URL to be the string
 * of the tweet's ObjectId. Requires the body of the request to have content set
 * to the new content of the tweet. This operation is idempotent.
 */
router.post('/tweets/update/:id', function(req, res, next) {
    var id = req.param('id');
    var query = {_id: ObjectId(id)};

    // This uses findOne and then save instead of findOneAndUpdate because
    // findOneAndUpdate does not perform schema validation.
    Tweet.findOne(query).populate('creator').exec(function(err, tweet) {
        var errorObj = {
            'tweet': {
                '_id': id,
                'content': req.body.content
            },
            'error': true
        }

        if (err || tweet === null) {
            return res.render('tweets/edit_tweet', errorObj);
        }

        if (tweet.creator._id.toString() !== req.session.user) {
            return renderError(res,
                'You don\'t have permission to edit that tweet!');
        }
        
        tweet.content = req.body.content;
        tweet.save(function(err) {
            if (err) return res.render('tweets/edit_tweet', errorObj);
         
            res.redirect('/tweets');
        });
    });
});

/**
 * If the user is logged in, delete a tweet. If the tweet cannot be deleted,
 * show an error message in the browser. Redirects to the list of all tweets
 * after the delete is complete. Requires the id parameter of the URL to be the
 * string of the tweet's ObjectId.
 */
router.get('/tweets/delete/:id', function(req, res) {
    if (req.session.user === undefined) return res.redirect('/');
    
    var query = {_id: ObjectId(req.param('id'))};
    Tweet.findOneAndRemove(query, function(err) {
        if (err) {
            return renderError(res,
                'Sorry, we were unable to delete your tweet.');
        }
         
        res.redirect('/tweets');
    });
});

router.post('/tweets/favorite/:id', function(req, res, next) {
    if (req.session.user === undefined) return res.redirect('/');

    var errorMessage = 'Sorry, we were unable to favorite that tweet.';
    User.findOne({_id: ObjectId(req.session.user)}, function(err, user) {
        if (err || user === null) return renderError(res, errorMessage);

        if (user.favorites.indexOf(ObjectId(req.param('id'))) === -1) {
            user.favorites.push(ObjectId(req.param('id')));
            user.save(function(err) {
                if (err) return res.json({error: errorMessage});

                Tweet.findOne({_id: ObjectId(req.param('id'))}, function(err, tweet) {
                    if (err || tweet === null) return res.json({error: errorMessage});

                    tweet.favoriteCount += 1;
                    tweet.save(function(err) {
                        if (err) return res.json({error: errorMessage});

                        return res.json({
                            favoriteCount: tweet.favoriteCount
                        });
                    });
                });
            });
        }
    });
});

router.post('/tweets/unfavorite/:id', function(req, res, next) {
    if (req.session.user === undefined) return res.redirect('/');

    var errorMessage = 'Sorry, we were unable to unfavorite that tweet.';
    User.findOne({_id: ObjectId(req.session.user)}, function(err, user) {
        if (err || user === null) return renderError(res, errorMessage);

        var loc = user.favorites.indexOf(ObjectId(req.param('id')));
        if (loc !== -1) {
            user.favorites.splice(loc, 1);
            user.save(function(err) {
                if (err) return res.json({error: errorMessage});

                Tweet.findOne({_id: ObjectId(req.param('id'))}, function(err, tweet) {
                    if (err || tweet === null) return res.json({error: errorMessage});

                    tweet.favoriteCount -= 1;
                    tweet.save(function(err) {
                        if (err) return res.json({error: errorMessage});

                        return res.json({
                            favoriteCount: tweet.favoriteCount
                        });
                    });
                });
            });
        }
    });
});

/**
 * If the user is logged in, show all tweets for the user specified by id. If an
 * error is encountered retrieving the tweets from the database, show an error
 * message in the browser.
 */
router.get('/tweets/:id', function(req, res) {
    if (req.session.user === undefined) return res.redirect('/');

    Tweet.find({creator: ObjectId(req.param('id'))}).populate('creator').exec(
        function(err, tweets) {
            if (err || tweets === null) {
                return renderError(res, 
                    'Sorry, we were unable to get the tweets for you.');
            }

            res.render('tweets/view_tweets.jade', {
                tweets: tweets,
                currentUser: req.session.user
            });
        }
    );
});

/**
 * Show an error on the view tweets page.
 * @param  {string} err The error message to display.
 */
function renderError(res, err) {
    res.render('tweets/view_tweets.jade', {error: err});
}