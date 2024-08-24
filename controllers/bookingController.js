const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../model/bookingModel');
const handler = require('./handlerFactory');
const User = require('../model/userModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  //create the session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-bookings/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      // {
      //   name: `${tour.name} Tour`,
      //   description: tour.summary,
      //   images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
      //   amount: tour.price * 100,
      //   currency: 'usd',
      //   quantity: 1,
      // },
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
        },
      },
    ],
  });
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   const { user, tour, price } = req.query;
//   if (!user || !tour || !price) {
//     return next();
//   }

//   await Booking.create({
//     user,
//     tour,
//     price,
//   });
//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = await User.findOne({ email: session.customer_email }).id;
  // const price = session.display_items[0].unit_amount / 100;
  const price = session.amount_total / 100;
  console.log(`price is ${price}`);
  console.log(`user is ${user}`);
  console.log(`tour is ${tour}`);
  console.log('inside createBooking checkout');
  console.log(`email is ${session.customer_email}`);
  await Booking.create({
    user,
    tour,
    price,
  });
};

exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({
    received: 'true',
  });
};

exports.getBookings = handler.getAll(Booking);
exports.getBooking = handler.getOne(Booking);
exports.createBooking = handler.createOne(Booking);
exports.updateBooking = handler.updateOne(Booking);
exports.deleteBooking = handler.delteOne(Booking);
