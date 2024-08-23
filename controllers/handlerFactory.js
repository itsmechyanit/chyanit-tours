const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.delteOne = function (Model) {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('Document not exist with this id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.updateOne = function (Model) {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('Document does not exist with this id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

exports.createOne = function (Model) {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',

      data: {
        data: doc,
      },
    });
  });
};

exports.getOne = function (Model, popOptions = undefined) {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('Document does not exist with this id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

exports.getAll = function (Model) {
  return catchAsync(async (req, res, next) => {
    //To allow for nested end points
    const filtered = {};
    if (req.params.tourId) {
      filtered.tour = req.params.tourId;
    }
    if (req.params.userId) {
      filtered.user = req.params.userId;
    }
    const features = new ApiFeatures(Model.find(filtered), req.query);
    const allDocs = await features.filter().sort().projection().pagination()
      .query;
    //1(A) Basic Filtering
    // const queryObject = { ...req.query };

    // const excludeList = ['page', 'sort', 'limit', 'fields'];
    // excludeList.forEach((el) => delete queryObject[el]);
    // //1 (B)Advanced Filtering
    // let queryString = JSON.stringify(queryObject);

    // queryString = queryString.replace(
    //   /\b(lt|lte|gt|gte)\b/g,
    //   (matched) => `$${matched}`,
    // );

    // let query = Tour.find(JSON.parse(queryString));
    // //2
    // if (req.query.sort) {
    //   query = query.sort(req.query.sort.split(',').join(' '));
    // }
    // //3
    // if (req.query.fields) {
    //   query = query.select(req.query.fields.split(',').join(' '));
    // } else {
    //   query = query.select('-__v');
    // }

    // //
    // const page = +req.query.page || 1;
    // const limit = +req.query.limit || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(page).limit(limit);

    // if (req.query.page) {
    //   const numDocuments = await Tour.countDocuments();
    //   if (skip >= numDocuments) {
    //     throw new Error('The requested Page does not exist');
    //   }
    // }

    //build a query

    // const allTours = await Tour.find();
    res.status(200).json({
      status: 'success',
      results: allDocs.length,
      data: {
        data: allDocs,
      },
    });
  });
};
