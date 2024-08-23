const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const Email = require('../utils/email');

function signToken(id) {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
}

function createSendToken(user, statusCode, res) {
  const token = signToken(user._id);
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide username and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid username or password', 401));
  }
  //check if the provided password is correct
  const isValid = await user.correctPassword(password, user.password);
  if (!isValid) {
    return next(new AppError('Invalid username or password', 401));
  }
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //check if the user has a token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('please login first', 401));
  }
  //check if the token is valid
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if the user exists in the database
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user associated with this token does not exist', 401),
    );
  }
  //check if the user changed the password after getting a token
  if (currentUser.passwordChangedAfterToken(decoded.iat)) {
    return next(
      new AppError(
        'User changed the password recently. Please login with the new password',
        401,
      ),
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  //check if the user has a token
  let currentUser;
  try {
    let token;

    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next();
    }
    //check if the token is valid
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //check if the user exists in the database
    currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }
    //check if the user changed the password after getting a token
    if (currentUser.passwordChangedAfterToken(decoded.iat)) {
      return next();
    }
  } catch (err) {
    return next();
  }

  res.locals.user = currentUser;
  next();
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'dummycookie', {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(204).json({
    status: 'success',
  });
};

exports.restricTo = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.roles)) {
      return next(
        new AppError('You are not allowed to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get the user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('The user with this email address does not exist', 404),
    );
  }
  //generate the token
  const resetToken = user.createForgotPasswordToken();
  await user.save({ validateBeforeSave: false });
  //send the email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/users/${resetToken}`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token is valid for 10 mins ',
    //   message,
    // });
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was a problem sending a token via email. Please try again',
        500,
      ),
    );
  }
});

exports.forgotPasswordWeb = catchAsync(async (req, res, next) => {
  //get the user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('The user with this email address does not exist', 404),
    );
  }
  //generate the token
  const resetToken = user.createForgotPasswordToken();
  await user.save({ validateBeforeSave: false });
  //send the email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/reset-password/${resetToken}`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token is valid for 10 mins ',
    //   message,
    // });
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was a problem sending a token via email. Please try again',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new AppError('Invalid token or the token might have expired', 400),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;

  await user.save();
  //log the user
  createSendToken(user, 201, res);
});

exports.changeMyPassword = catchAsync(async (req, res, next) => {
  //1)Get the current user from the database
  const user = await User.findById(req.user._id).select('+password');
  //check if the passwordCurrent is the same as password in the datbase
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Please provide the correct current password', 401),
    );
  }

  //update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //Log the user in and send the token
  createSendToken(user, 201, res);
});
