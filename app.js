const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// After passport
const cookieSession = require('cookie-session') // can be anything you want

const routes = require('./routes/index');
const users = require('./routes/users');

const app = express();

// this gives me req.session
app.use(cookieSession({ secret: 'keyboardcat' }));

const passport = require('passport')

// A relatively simple data structure that has some urls, and a method or two that are specific to the GitHub API
const GitHubStrategy = require('passport-github').Strategy

// Tells passport to use that github-specific data structure
passport.use(new GitHubStrategy(

  // filling in the blanks on the GitHub strategy
  {
    clientID: 'db5b45831ec4685b52fe',
    clientSecret: '1fb5db0b71e09039dc06efdb6d067c8cd97eaf2c',
    callbackURL: 'http://localhost:3000/auth/github/callback',
    userAgent: 'lunch-demo.example.com'
  },

  // after both API calls were made
  function onSuccessfulLogin(token, refreshToken, profile, done) {
    // I've processed the initial login of the user
    // This happens once
    done(null, {token, profile});
  }

));

app.use(passport.initialize());
app.use(passport.session());

// take in whatever was passed into `done` inside the GitHubStrategy config
passport.serializeUser((object, done) => {
  console.log("Serialize User", {token: object})

  // when I call `done` _here_, I am passing in the data to be saved to the session
  done(null, {token: object.token})
})

passport.deserializeUser((object, done) => {
  console.log("Deserialize User", object)
  done(null, object)
})

// Just redirects to github
//
// https://github.com/login/oauth/authorize?
//   response_type=code
//   &redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fgithub%2Fcallback
//   &client_id=4f161039cf6b984c6148
app.get('/auth/github', passport.authenticate('github'));

// makes 2 api calls to github
app.get('/auth/github/callback',
  passport.authenticate('github', { successRedirect: '/', failureRedirect: '/login' }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
