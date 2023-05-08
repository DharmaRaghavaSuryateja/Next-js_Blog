const appError = require("../utils/appError");
function sendDevData(res, err) {
  err.statusCode = err.statusCode || 500;
  err.status = "failed";
  res.status(err.statusCode).json({
    message: err.status,
    error: err,
  });
}
function sendProdData(res, err) {
  if (err.isOperational) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "failed";
    res.status(err.statusCode).json({
      message: 'failed',
     error: err.message,
    });
  } else {
    err.statusCode = err.statusCode || 500;
    err.status = "failed";
    res.status(err.statusCode).json({
      message: "failed",
      error: "Something Went Very Wrong...",
    });
  }
}

function handleCastErrorDB(error) {
  let message = `Invalid value ${error.value} for ${error.path}`;
  return new appError(message, 400);
}

function handleDuplicateErrorDB(error) {
  const duplicatedField = Object.keys(error.keyValue)[0];
  let message = `${duplicatedField} already exists for value ${error.keyValue[duplicatedField]}`;
  return new appError(message, 400);
}

function handleValidationErrorDB(error) {
  let message = Object.values(error.errors);
  message = message.map((item) => {
    return item.message;
  });
  return new appError(message, 400);
}

function handleJsonWebTokenError(error) {
  let message = "Data Token Manipulated";
  return new appError(message, 401);
}

function handleJwtTokenExpiredError(error) {
  let message = "Timer Expired,Please Login again";
  return new appError(message, 401);
}

module.exports = (err, req, res, next) => {
    console.log(err)
  if (process.env.NODE_ENV === "development") {
    sendDevData(res, err);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.assign(err);
    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    else if (error.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }
    else if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    } else if (error.name === "JsonWebTokenError") {
      error = handleJsonWebTokenError(error);
    } else if (error.name === "TokenExpiredError") {
      error = handleJwtTokenExpiredError(error);
    }
    sendProdData(res, error);
  }
};
