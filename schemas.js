/**
 * Data Model for fritter.
 *
 * Users have usernames and passwords.
 * Tweets have a creator (a User) and content.
 */

var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    /**
     * The username is the handle the user uses on fritter. Usernames are
     * alpha-numeric strings between 1 and 20 characters long. Duplicate
     * usernames are not allowed. A user may not exist without a username.
     */
    username: {
        type: String,
        unique: true,
        required: true,
        match: /^[a-zA-Z0-9]{1,20}$/
    },

    /**
     * The password is the key the user uses to log in to fritter. Passwords
     * are strings between 1 and 20 characters long, and may not contain
     * whitespace. A user may not exist without a password.
     * @type {Object}
     */
    password: {
        type: String,
        required: true,
        match: /^^\S{1,20}$/
    },

    following: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],

    favorites: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Tweet'
    }]
});

var tweetSchema = mongoose.Schema({
    /**
     * The creator is a reference to the User who created the tweet (used for
     * permissions). A tweet may not exist without a creator.
     */
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    /**
     * The content of a tweet is the text of the tweet. It is a string between
     * 1 and 140 characters long with no leading or trailing whitespace. A
     * tweet may not exist without content.
     * @type {Object}
     */
    content: {
        type: String,
        trim: true,
        match: /^.{1,140}$/,
        required: true
    },

    favoriteCount: {
        type: Number,
        required: true
    }
});

var Tweet = mongoose.model('Tweet', tweetSchema);
var User = mongoose.model('User', userSchema);

module.exports.Tweet = Tweet;
module.exports.User = User;