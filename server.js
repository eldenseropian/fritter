var express = require('express');
var path = require('path');
var routes = require('./routes/index');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'asdf', resave: true, saveUninitialized: true}));
app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', 'public/views');
app.set('view engine', 'jade');

if (process.env.OPENSHIFT_NODEJS_PORT) {
    mongoose.connect('mongodb://admin:hNUcJFfSS7cq@' +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/fritter');
} else {
    mongoose.connect('mongodb://localhost/fritterDb');
}

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback () {
    app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080,
     process.env.OPENSHIFT_NODEJS_IP);
});