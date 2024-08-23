const Booking = require('../model/bookingModel');
const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1 Get All the tours
  const tours = await Tour.find();
  //build the template
  //render the template using tour data

  res.status(200).render('overview', {
    tours,
    title: 'Exciting tours for adventorous people',
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('The tour does not exist'));
  }
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getSignup = catchAsync(async (req, res, next) => {
  if (res.locals.user) {
    return res.redirect('/login');
  }
  res.status(200).render('signup', {
    title: 'Create your account',
  });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  if (res.locals.user) {
    return res.redirect('/');
  }
  res.status(200).render('login', {
    title: 'Log in to your account',
  });
});

exports.getUserDetails = (req, res) => {
  res.status(200).render('myAccount', {
    title: 'My details',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('myAccount', {
    user: updatedUser,
  });
});

exports.myBookings = catchAsync(async (req, res, next) => {
  //Get all the booking for a logged in user

  const bookings = await Booking.find({ user: req.user.id });

  //get all the tourIds
  const tourIds = bookings.map((booking) => booking.tour._id);
  //find all the tours corresponding to these tour ids

  const allTours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Purchased Tour',
    tours: allTours,
  });
});

exports.getForgotPassword = catchAsync(async (req, res, next) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot your password',
  });
});

exports.getResetPassword = catchAsync(async (req, res, next) => {
  res.status(200).render('resetPassword', {
    title: 'Reset your password',
  });
});
