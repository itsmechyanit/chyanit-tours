const multer = require('multer');

const sharp = require('sharp');
const Tour = require('../model/tourModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );
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
exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  //Tackle Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  //Tackle Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (img, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      req.body.images.push(fileName);
      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
    }),
  );
  next();
});
exports.getCheapBest = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
};

exports.getAllTours = factory.getAll(Tour);

// exports.checkID = (req, res, next, value) => {
//   const tour = tours.find((el) => el.id === +value);
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

exports.checkBody = (req, res, next) => {
  const data = req.body;

  if (data.name && data.price) {
    next();
  }

  return res.status(400).json({
    status: 'fail',
    message: 'Missing name or price',
  });
};

// const tour = tours.find((el) => el.id === +req.params.id);
// res.status(200).json({
//   status: 'success',
//   data: {
//     tour,
//   },
// });
exports.getAllTours = factory.getAll(Tour);
exports.getATour = factory.getOne(Tour, { path: 'reviews' });

exports.createATour = factory.createOne(Tour);

exports.updateATour = factory.updateOne(Tour);

exports.deleteATour = factory.delteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// exports.getMonthlyPlan = async (req, res) => {
//   try {
//     const year = +req.params.year;
//     console.log(year);
//     const plan = await Tour.aggregate([
//       {
//         $unwind: '$startDates',
//       },

//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },

//       {
//         $group: {
//           _id: { $month: '$startDates' },
//           numTourStarts: { $sum: 1 },
//           tours: { $push: '$name' },
//         },
//       },
//       {
//         addFields: { month: '$_id' },
//       },
//     ]);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         plan,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',

//       message: err,
//     });
//   }
// };

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const radius = unit === 'miles' ? distance / 3963.19 : distance / 6378.13;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide the latitude and longitude in the format lat, lng',
      ),
      400,
    );
  }
  const allTours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: allTours.length,
    data: {
      data: allTours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const multiplier = unit === 'miles' ? 0.000621371 : 0.0001;
  const [lat, lng] = latlng.split(',');
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [+lng, +lat] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',

    data: {
      data: distances,
    },
  });
});
