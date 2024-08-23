const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

//router.use(authContoller.protect);

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restricTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview,
  );

router
  .route('/:id')
  .delete(
    authController.restricTo('user', 'admin'),
    reviewController.deleteReview,
  )
  .patch(
    authController.restricTo('user', 'admin'),
    reviewController.updateReview,
  )
  .get(reviewController.getReview);

module.exports = router;
