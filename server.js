const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
  console.log('uncaughtException! 💥 Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
  // We are closing the terminating the server, and in production, it will automatically run the app again,
  // most of tje hosting services aleardy do so
});
// const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// mongoose.connect(DB).then(() => {
//   console.info('connected to DB successfully...');
// });
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on por ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
    // We are closing the terminating the server, and in production, it will automatically run the app again,
    // most of tje hosting services aleardy do so
  });
});
