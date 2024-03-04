var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors=require('cors');
const dotenv=require('dotenv');
var indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const bodyparser=require('body-parser');
var app = express();
const registration=require("./routes/registrationRoutes");
const login=require("./routes/loginRoutes");
const profile=require("./routes/profileRoute");
const inventoryRouter=require('./routes/inventoryRoutes');
const customerRouter=require('./routes/customerRoutes');
const cart=require("./routes/cartRoutes");
const transaction = require('./routes/transactionRoute');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

dotenv.config();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use("/registration",registration);
app.use("/login", login);
app.use("/profile",profile);
app.use('/inventory',inventoryRouter);
app.use('/customers',customerRouter);
app.use('/users', usersRouter);
app.use("/transaction",transaction);
app.use("/cart",cart);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
