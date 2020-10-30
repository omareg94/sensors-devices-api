const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const chalk = require('chalk');     // to colorise or debug/console.log messages
const debug = require('debug')('app');     // for debugging and filtering debug messages
const morgan = require('morgan');   // to monitor web traffic

const app = express();

// Helper code for dependencies to make them work as middleware
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mongoose.connect('mongodb://localhost/devicesAPI', { useUnifiedTopology: true, useNewUrlParser: true });
const port = process.env.PORT || 3000;

// mongoose models and routers code
const User = require('./models/userModel');
const Device = require('./models/deviceModel');
const ReadingsBucket = require('./models/readingsBucketModel');

const userRouter = require('./routes/userRouter')(User, Device);
const deviceRouter = require('./routes/deviceRouter')(Device, ReadingsBucket, User);

app.use('/api', userRouter);
app.use('/api', deviceRouter);

app.get('/', (req, res) => {
  res.send('Welcome to Sensing Devices Service.');
});

app.listen(port, () => {
  debug(`Running on port ${chalk.blueBright(port)}`);
});