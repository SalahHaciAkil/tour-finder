const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB)
  .then(() => {
    console.info('connected to DB successfully...');
  })
  .catch(err => {
    console.log(err);
  });

const tours = JSON.parse(fs.readFileSync('dev-data/data/tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('dev-data/data/users.json', 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync('dev-data/data/reviews.json', 'utf-8')
);
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data uploaded successfully');
  } catch (error) {
    console.log(error);
  } finally {
    process.exit();
  }
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted successfully');
  } catch (error) {
    console.log(error);
  } finally {
    process.exit();
  }
};

if (process.argv[2] === '---import') importData();
if (process.argv[2] === '---delete') deleteData();
