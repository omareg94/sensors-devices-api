/* eslint global-require: "off" */
const express = require('express');

function routes(Device, ReadingsBucket, User) {
  const devicesController = require('../controllers/devicesController')(Device, ReadingsBucket, User);
  const deviceRouter = express.Router();
  const controller = devicesController;

  deviceRouter.use(controller.devices.use);
  deviceRouter.route(['/devices', '/devices/:deviceId'])       // get device(s)
    .get(controller.devices.get)
    .post(controller.devices.post)
    .delete(controller.devices.del);           // delete feature to add later
  deviceRouter.route(['/readings', '/readings/:deviceId'])     // get readings
    .get(controller.readings.get)
    .post(controller.readings.post)
    .delete(controller.readings.del);       // delete feature to add later (delete readings by range of time)
  return deviceRouter;
}

module.exports = routes;