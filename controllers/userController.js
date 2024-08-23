const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');

const sharp = require('sharp');

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
//   // res.status(500).json({
//   //   status: 'error',
//   //   message: 'This endpoint is not yet implemented',
//   // });
// });

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // cb(null, '/public/img/users');
//     cb(null, './public/img/users');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     const name = `user-${req.user.id}-${Date.now()}.${ext}`;
//     cb(null, name);
//   },
// });

const storage = multer.memoryStorage();

const filter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    cb(new AppError('Not an image. Please upload the image again', 400));
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: filter,
});

exports.uploadImage = upload.single('photo');

const filteredObj = (obj, ...allowedFileds) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFileds.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This end point is not for updating the password. Please use /changeMyPassword to update it',
        400,
      ),
    );
  }

  const allowedFields = filteredObj(req.body, 'name', 'email');
  if (req.file) {
    allowedFields.photo = req.file.filename;
  }

  const user = await User.findByIdAndUpdate(req.user._id, allowedFields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// exports.getAUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This endpoint is not yet implemented',
//   });
// };

exports.createAUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This endpoint is not mplemented please use /signup',
  });
};

exports.me = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateAUser = factory.updateOne(User);

exports.deleteAUser = factory.delteOne(User);

exports.getAllUsers = factory.getAll(User);

exports.getAUser = factory.getOne(User);
