const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const mongooseSanitize = require('express-mongo-sanitize');
const path = require('path');
const compression = require('compression');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');

const tourRouter = require('./routes/tourRoutes');

const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');

const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const globalErrorController = require('./controllers/errorController');

const app = express();

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from the same IP. Please try again in an hour',
});

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://js.stripe.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const frameSrc = ['https://js.stripe.com/'];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", ...frameSrc],
    },
  }),
);

app.use(cors());

app.options('*', cors());

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// app.use(express.urlencoded({ extends: true, limit: '10kb' }));
app.use(mongooseSanitize());
app.use(xss());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(compression());
app.use((req, res, next) => {
  next();
});
app.use('/', viewRouter);

app.use('/api', limiter);

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`The resource ${req.originalUrl} does not exist`, 404));
});

app.use(globalErrorController);

// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getATour);

// app.post('/api/v1/tours', createATour);

// app.patch('/api/v1/tours/:id', updateATour);

// app.delete('/api/v1/tours/:id', deleteATour);

module.exports = app;
