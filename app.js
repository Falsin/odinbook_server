var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var mongoose = require('mongoose');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const helmet = require("helmet");
const passport = require("passport");
const cookieSession = require('cookie-session')
//const passportForFacebook = require("./authentication_with_Facebook");
const router  = require('./routes/catalog');

const compression = require("compression");

var app = express();

const inProd = process.env.NODE_ENV === "production";

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var mongoDB = 'mongodb+srv://m001-student:m001-mongodb-basics@sandbox.jnrzi.mongodb.net/odinbook?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const whitelist = ["https://localhost:8080", "https://falsin.github.io"]
app.use(cors({
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // allow session cookie from browser to pass through
  origin: (origin, callback) => {
    //console.log(origin)
    //console.log('hello123')
    if (whitelist.includes(origin) || !origin || origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}));

app.use(cookieSession({ 
  secret: "cats", 
  resave: true, 
  saveUninitialized: false,
  cookie: {
    maxAge: 1000000000,
    sameSite: `${inProd ? "None" : "Lax"}`,
    secure: `${inProd ? "true" : "auto"}`,
  }
}));

/* app.use(cookieSession({ 
  secret: "cats", 
  resave: true, 
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoDB,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000000000,
  }
  cookie: {
    maxAge: 3000000,
  }
})); */

app.use(compression());

app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
/*   console.log('fuck')
  console.log(err) */
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  //console.log(req)
  res.status(err.status || 500);
  res.json(err.message);
  //res.render('error');
})

module.exports = app;
