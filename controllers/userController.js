const User = require('../models/userModel');
const factory = require('./handlerFactory');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.deleteMe = (req, res, next) => {
  return res.status(200).json({
    message: 'Endpoint will be implemented later'
  });
};

exports.updateMe = (req, res, next) => {
  return res.status(200).json({
    message: 'Endpoint will be implemented later'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
