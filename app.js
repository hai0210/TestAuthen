require('dotenv').config({path: '.env'})
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session')
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//Configure mongoose
mongoose.connect(process.env.MONGODB_URI);
// mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PWD}@127.0.0.1:${process.env.DB_PORT}/${process.env.DB_NAME}`);
mongoose.set('debug', true);
//Model & routes
require('./model/User');
require('./model/VerificationEmail');

require('./common/passport');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var oauthRouter = require('./routes/oauth');
var superAdminRouter = require('./routes/superAdmin');
var applicationRouter = require('./routes/application');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: 'oauth2server',
  secret: 'authorization using authentication for other application in the domain',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 600000
  }
}));
app.use(require('connect-flash')());

app.use(passport.initialize());
app.use(passport.session());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/v1', oauthRouter);
app.use('/admin', superAdminRouter);
app.use('/application', applicationRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;