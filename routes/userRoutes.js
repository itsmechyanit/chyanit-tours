const express = require('express');

const router = express.Router();
const reviewRouter = require('./reviewRoutes');
const userController = require('../controllers/userController');

const authContoller = require('../controllers/authController');

router.use('/:userId/reviews', reviewRouter);
router.post('/signup', authContoller.signup);
router.post('/login', authContoller.login);
router.get('/logout', authContoller.logout);
router.post('/forgotPassword', authContoller.forgotPassword);
router.post('/forgotPasswordWeb', authContoller.forgotPasswordWeb);
router.patch('/resetPassword/:token', authContoller.resetPassword);

router.use(authContoller.protect);

router.get(
  '/me',

  userController.me,
  userController.getAUser,
);

router.patch(
  '/changeMyPassword',

  authContoller.changeMyPassword,
);
router.patch(
  '/updateMe',
  userController.uploadImage,
  userController.resizeImage,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authContoller.restricTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createAUser);

router
  .route('/:id')
  .patch(userController.updateAUser)
  .delete(userController.deleteAUser);

module.exports = router;
