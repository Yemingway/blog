var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var settings = require('./settings');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var multer = require('multer');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//change ejs to html
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(logger({stream: accessLog}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//change public to app
app.use(express.static(path.join(__dirname, 'app')));
app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});
app.use(cookieParser());
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  }),
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use('/', routes);
app.use('/users', users);

//?why cannot upload files? Need to fix it.
app.use('/post', multer({
  dest: './public/images',
  rename: function (fieldname, filename) {
    console.log('here');
    return filename;
  }
}));
// app.use(multer({
//   storage: multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/images')
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname)
//     }
//   })
// }));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
//start angular js
app.get('/',function(req,res){
  res.sendfile('app/index.html');
});
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// app.use(session({
//   secret: settings.cookieSecret,
//   key: settings.db,
//   cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
//   store: new MongoStore({
//     db: settings.db,
//     host: settings.host,
//     port: settings.port
//   }),
//   resave: false,
//   saveUninitialized: true
// }));
// app.use(flash());
module.exports = app;
