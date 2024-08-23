const AppError = require('../utils/appError');

function handleCastErrorDb(err) {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
}

function handleDuplicateValueErrorDb(err) {
  // const message = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  // console.log(message);
  const value = err.keyValue.name;
  const message = `Duplicate value found ${value}. Please provide another value`;
  return new AppError(message, 400);
}

function handleValidationErrorDb(err) {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}

function handleJWTWebTokenError() {
  return new AppError('Invalid Token. Please login again', 401);
}
function handleJWTTokenExpiry() {
  return new AppError('The token has expired, Please login again', 401);
}
function sendDevError(err, req, res) {
  if (req.originalUrl.startsWith('/api'))
    res.status(err.statusCode).json({
      status: err.status,

      error: err,
      message: err.message,
      stack: err.stack,
    });
  else {
    //for rendered Website
    res.status(err.statusCode).render('error', {
      msg: err.message,
    });
  }
}

function sendProdError(err, req, res) {
  //The errors that we are aware of
  if (err.isOperational && req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  if (err.isOperational && !req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).render('error', {
      msg: err.message,
    });
  }
  //The errors that we don't want others to see
  if (!err.isOperational && req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }

  if (!err.isOperational && !req.originalUrl.startsWith('/api')) {
    return res.status(500).render('error', {
      msg: 'Please try again',
    });
  }
}

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name, message: err.message };

    if (error.name === 'CastError') error = handleCastErrorDb(error);
    if (error.code === 11000) error = handleDuplicateValueErrorDb(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDb(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleJWTTokenExpiry();

    sendProdError(error, req, res);
  }
};
