const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

const PORT = process.env.PORT || 3000;

const conString = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(conString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connection Successful'));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`server started listening on ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.log('❌ UNCAUGHT EXCEPTION: SHUTTING DOWN');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (err) => {
  console.log('❌ UNHANDLED REJECTION: SHUTTING DOWN');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('⚡️ SIGTERM RECEIVED: SHUTTING DOWN GRACEFULLY');

  server.close(() => {
    console.log('Process Terminated');
  });
});

// testTour
//   .save((doc) => console.log(doc))
//   .catch((err) => console.log('Error:⚡️', err));
// const dotenv = require('dotenv');
// const app = require('./app');

// dotenv.config({ path: './config.env' });⚡️

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });
