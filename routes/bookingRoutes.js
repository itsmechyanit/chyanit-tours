const express = require('express');

const router = express.Router();
const bookingController = require('../controllers/bookingController');

const authContoller = require('../controllers/authController');

router.use(authContoller.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authContoller.restricTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
