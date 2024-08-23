const express = require('express');

const tourController = require('../controllers/tourController');

const authController = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top-5-cheap-best-tours')
  .get(tourController.getCheapBest, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restricTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.createATour,
  );

router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateATour,
  )
  .delete(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.deleteATour,
  )
  .get(tourController.getATour);

module.exports = router;
