const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const review = require('../model/reviewModel');
const Review = require('../model/reviewModel');

dotenv.config({ path: '../config.env' });

const conString = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(conString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connection Successful'));

const tourData = fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8');
const userData = fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8');
const reviewData = fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8');

const loadData = async () => {
  try {
    await Tour.create(JSON.parse(tourData));
    await User.create(JSON.parse(userData), { validateBeforeSave: false });
    await Review.create(JSON.parse(reviewData));
    console.log('Data has been loaded');
  } catch (err) {
    console.log(`There is some error ${err}`);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data has been deleted');
  } catch (err) {
    console.log(`There is some error ${err}`);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  loadData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
