const AppError = require('../utils/appError');

const handleDuplicate = error => {
  const message = `Tour with ${Object.keys(error.keyPattern)[0]} '${
    error.keyValue[Object.keys(error.keyPattern)[0]]
  }' is already exisit `;

  return new AppError(message, 400);
};

const handleCastError = error => {
  const message = `error while casting ${error.value} to ${error.path}`;
  return new AppError(message, 400); //bad request
};

const handleWenTokenError = () => {
  const message = 'Invalid token, please log in again';
  return new AppError(message, 401);
};

const handleJwtExpired = () => {
  const message = 'Your token has expired, please log in again';
  return new AppError(message, 401);
};

const handleValidationDBError = error => {
  const messages = Object.values(error.errors).map(el => el.message);
  const message = `invalid data input. ${messages.join('. ')}`;

  return new AppError(message, 400);
};

const sendDevError = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

const sendProdError = (res, err) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  console.log('Error: ', err);
  res.status(err.statusCode).json({
    status: 500,
    message: 'Something unexpected happened'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = JSON.parse(JSON.stringify(err));
    if (error.name === 'CastError') error = handleCastError(error);
    else if (error.code === 11000) error = handleDuplicate(error);
    else if (error.name === 'ValidationError')
      error = handleValidationDBError(error);
    else if (error.name === 'jsonWebTokenError')
      error = handleWenTokenError(error);
    else if (error.name === 'tokenExpiredError')
      error = handleJwtExpired(error);

    sendProdError(res, error);
  }
};
