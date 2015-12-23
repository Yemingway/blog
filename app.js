var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./models/db');
//var log = require('./models/log');
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

// http response data
var successResponse = {
    "result": "success",
    "data": {}
};

var failResponse = {
    "result": "fail",
    "error": ""
};
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

// API: get_article_list
// create application/json parser, this will parse the json form data from the req
var jsonParser = bodyParser.json();
app.post('/get_article_list', jsonParser, function(req, res) {
    res.writeHeader(200, {"Content-Type": "text/html"});
    
    // get the form data
    var currentPage = req.body.current_page;
    var articleNumPerPage = req.body.article_num_per_page;
    
    //log.info("currentPage: " + currentPage + ", articleNumPerPage: " + articleNumPerPage);

    //return the mock mock

        /*  query data from mongodb
         *  here we will use mongoose to get data from mongodb.
         *  and sort api can let us sort the data in mongodb before search. We sort as the date.
         *  and skip, limit api can let us achieve the range query when user query different page's data.
         */
        
        db.find({}, function(err, data) {
            if (err) {
                //log.info("Database Error: get data from collection. Error: " + err);
                failResponse.error = err;
                res.write(JSON.stringify(failResponse));
                res.end();
            }
            else {
                //log.info("Database: get data success. data.length: " + data.length);

                // get the number of the all articles
                db.count(function(err, count) {
                    if (err) {
                        //log.info("Database Error: count articles number. Error: " + err);
                        failResponse.error = err;
                        res.write(JSON.stringify(failResponse));
                    }
                    else {
                        //log.info("articles total number: " + count);
                    
                        successResponse.data = {};
                        successResponse.data.total_aritcle_num = count;
                        successResponse.data.article_list = data;
                        
                        // return response
                        res.write(JSON.stringify(successResponse));
                    }
                    res.end();
                });
            }
        }).select(db.show_fields).sort({'article_time':'desc'}).skip((currentPage-1) * articleNumPerPage).limit(articleNumPerPage);
});
module.exports = app;
