const express = require('express');

const viewController = require('../controllers/viewController');

const authController = require('../controllers/authController');

const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/',

  authController.isLoggedIn,
  viewController.getOverview,
);
router.get('/login', authController.isLoggedIn, viewController.getLogin);
router.get('/signup', authController.isLoggedIn, viewController.getSignup);
router.get('/forgotPassword', viewController.getForgotPassword);
router.get('/reset-password/:token', viewController.getResetPassword);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/me', authController.protect, viewController.getUserDetails);
router.post(
  '/update-user-data',
  authController.protect,
  viewController.updateUserData,
);

router.get(
  '/my-bookings',

  authController.protect,
  bookingController.bookingAlert,
  viewController.myBookings,
);

module.exports = router;
