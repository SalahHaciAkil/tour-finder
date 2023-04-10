const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userScheme = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us what is your name']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    validate: [validator.isEmail, 'Please provide a valid email'],
    lowercase: true,
    unique: true
  },

  password: {
    type: String,
    minlength: 8,
    required: [true, 'Please provide your password'],
    select: false
  },
  passwordChangedAt: {
    type: Date
  },
  role: {
    type: String,
    default: 'user'
  },
  passwordConfirm: {
    type: String,
    minlength: 8,
    required: [true, 'Please confrim your password'],
    validate: {
      //THIS ONLY WORKS ON .create() AND .save() ____ .save() we can use it for updating user
      validator: function(val) {
        return val === this.password;
      },
      message: 'Passwords are not the same'
    }
  },

  photo: String
});

userScheme.methods.correctPassword = async function(
  candidatePassword,
  userPassowrd
) {
  return await bcrypt.compare(candidatePassword, userPassowrd);
};

userScheme.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  return false; // not changed
};

userScheme.pre('save', async function(next) {
  //check if the password is modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // it won't be stored in the database in this case
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userScheme);

module.exports = User;
