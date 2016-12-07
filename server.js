"use strict";
const express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    verify = require('./lib/services/authentication').verify;
require('dotenv').load();


//####################### - ROUTES - #####################################
// ROUTES: {path: "url path", route: "route file name"}
const routes = [
    {path: '', route: 'index'},
    {path: 'upload', route: 'bit_upload'},
    {path: 'config', route: 'config'},
    {path: 'lab_area', route: 'lab_area'},
    {path: 'download', route: 'download'},
    {path: 'login', route: 'login'}
];


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(verify);


// routes register
for (const route of routes) {
    app.use('/' + route.path, require('./routes/' + route.route));
}


// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
