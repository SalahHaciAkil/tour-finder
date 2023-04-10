const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
  console.log('id: ', id);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide valid email and password'), 400);

  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new AppError('User not found', 404));

  if (!(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect password', 401));

  const token = signToken(user._id);
  return res.status(200).json({
    status: 'success',
    data: { token }
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else return next(new AppError('Please log in and try again', 401));

  if (!token) {
    return next(new AppError('Please log in and try again', 401)); // 401 unauthorized
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // will throw error if expired

  // check if the user hasn't delete his account
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('Account is deleted', 401));

  // check if the user changed his password
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed his password, please try login again',
        401
      )
    );
  }

  req.user = user;
  next();
});

exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next();
    }

    return next(
      new AppError('You do not have premissions to do this action'),
      403
    );
  };
};
