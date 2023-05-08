const asyncWrapper = require("../utils/asyncWrapper");
const User = require("../models/userModel");
const appError = require("../utils/appError");
const sendEmail = require("../utils/email");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
function generateToken(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}
function sendCreatedToken(user, res, statusCode) {
  const token = generateToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN  * 60 * 60 * 1000
      //1 hour
    ),
    httpOnly: true
  };
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    token,
    message:"success",
    data:{
        data:user
    }
  });
}
exports.signUp = asyncWrapper(async (req, res, next) => {
  const user = await User.create(req.body);
  sendCreatedToken(user, res, 201);
});

exports.login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new appError("Please provide Email and Password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new appError("Invalid Email or Password", 400));
  }
  const isCorrectPassword = await user.correctPassword(password);
  if (!isCorrectPassword) {
    return next(new appError("Invalid Email or Password", 400));
  }
  sendCreatedToken(user, res, 201);
});

exports.protect = asyncWrapper(async (req, res, next) => {
  let token;
  //1)if not authorization is sent
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //2)if token is not there
  if (!token) {
    return next(new appError("You are not logged in", 401));
  }
  //so here we use promisify to convert call back based function to promise based functiom.promisify takes function as an argument.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3)If user is deleted,but his token is still not expired and stealed by hacker.so we check in database if the user exists.
  let user = await User.findById(decoded.id);
  if (!user) {
    return next(new appError("User already Deleted", 401));
  }
  //4)If user changed his password in july but the token is created on april,and token is set to expire in one year,but if we try to use the token
  //that is created in april in the month>july then we have to handle that the token is not valid since the password has changed after that
  //token was created.
  const isPasswordChanged = user.passwordChanged(decoded.iat);
  if (isPasswordChanged) {
    return next(new appError("User Password Changed", 401));
  }
  //passing data to next middleware that is restrictTo
  req.user = user;
  next();
});

//roles is an array which we pass in router.this is different from other exports...so we instead return a function that has req,res,next
exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError("You are not allowed to do this operation", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = asyncWrapper(async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError("Entered email doesnot exists.", 404));
  }
  const passwordResetToken = user.createPasswordResetToken();
  //here in createPasswordResetToken function we are adding two more properties to user that is passwordResetToken and  passwordResetTokenIn.
  //so we are saving those methods using .save.But the user method does not have confirmPassword  field.It has only password field.so it validates
  //and throws an error.so we use validateBeforeSave:false to stop that behaviour.
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.hostname}/api/users/resetPassword/${passwordResetToken}`;
  const subject =
    "Here is your Password reset Token from Blog App.It is valid for 10 mins only";
  const message = `Your URL to reset password ${resetUrl}`;
  const email = user.email;
  try {
    await sendEmail({ message, subject, email });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new appError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});
exports.resetPassword = asyncWrapper(async function (req, res, next) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.normalCryptoToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new appError("Invalid Token or Token Expired", 404));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;
  await user.save();
  sendCreatedToken(user, res, 201);
});

exports.updatePassword = asyncWrapper(async function (req, res, next) {
  //current password is the previous password.
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.correctPassword(req.body.currentPassword))) {
    return next(new appError("Password is Wrong", 401));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  sendCreatedToken(user, res, 201);
});

exports.myProfile=asyncWrapper(async function(req,res,next)
{
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new appError("You are not logged in", 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  let user = await User.findById(decoded.id);
  if (!user) {
    return next(new appError("User already Deleted", 401));
  }
  const isPasswordChanged = user.passwordChanged(decoded.iat);
  if (isPasswordChanged) {
    return next(new appError("User Password Changed", 401));
  }
  return res.status(201).json({
    message:"success",
    data:{
      data:user
    }
  })
})