/* eslint new-cap: "off" */
require('dotenv').config();
const crypto = require('crypto');
const debug = require('debug')('app:userController');
const jwt = require('jsonwebtoken');

const usersHelpers = require('./helpers/usersHelpers')();
const miscHelpers = require('./helpers/generalHelpers')();

const { authenticateToken } = usersHelpers;
const { validate_params } = miscHelpers;

function devicesController(Device, ReadingsBucket, User) {
  return {
    devices: (function () {
      function use(req, res, next) {
        req.device_MM = Device;     // prepare Mongoose Models for all next middleware
        req.readingsbucket_MM = ReadingsBucket;
        req.user_MM = User;     // helpful for being accessed from a helper function that has separate scope (e.g. authenticateToken)
        authenticateToken(req, res, next);
      }

      function get(req, res) {
        (async function handleGetDevice() {
          try {
            // Authorization: if execution reached here, then user is authorized to read profile content.    // there's a middleware that interrupts execution before here if user isn't authorised)
            const { user_match } = req;
            const query = { "owner": user_match._id };
            if (req.params.deviceId) query._id = req.params.deviceId;
            const devices_match = await req.device_MM.find(query);

            const json_toSend = {
              "status": "success",
              "message": `${(!query._id ? "Devices" : "Device")} of user: ${user_match.username}`,
              "devices": devices_match
            };
            return res.json(json_toSend);
          } catch (err) {
            res.status(500);    // return HTTP 500 status code (server error)
            return res.send(err);
          }
        }());
      }

      function post(req, res) {
        (async function handleAddDevice() {
          try {
            // Authorization: if execution reached here, then user is authorized to read profile content.    // there's a middleware that interrupts execution before here if user isn't authorised)
            const { user_match } = req;
            const device_in = req.body;    // passed in device data
            device_in.owner = user_match._id;
            const device_in_MMI = new req.device_MM(device_in);    // MMI: Mongoose Model Instance
            await device_in_MMI.save();

            return res.json({ status: "success", message: `Device added successfuly (for ${user_match.username}).`, dev_sneakPeek: { device_data: device_in_MMI } });
          } catch (err) {
            res.status(500);    // return HTTP 500 status code (server error)
            return res.send(err);
          }
        }());
      }

      function del(req, res) {     // Delete feature to add later
      }

      return {
 use, get, post, del
};
    }()),
    readings: (function () {
      function get(req, res) {      //
        (async function handleGetReadings() {
          try {
            // Authorization: if execution reached here, then user is authorized to read profile content.    // there's a middleware that interrupts execution before here if user isn't authorised)
            const { user_match } = req;
            const query = { "owner": user_match._id };
            if (req.params.deviceId) query._id = req.params.deviceId;

            let start; let
end;
            if (req.query.start) {
              start = req.query.start;
            } else {
              start = 0;     // Jan 1, 1970 00:00:00 UTC
            }

            if (req.query.end) {
              end = req.query.end;
            } else {
              end = 7983871199000;     // Dec 31, 2222 23:59:59 UTC
            }

            const devices_match = await req.device_MM.find(query);
            const readings_toShow = [];
            devices_match.forEach((device_match) => {
              // readings_toShow.push( {device_id: device_match._id, readings: device_match.readings } );
              readings_toShow.push({ device_id: device_match._id, readings: device_match.readings.filter((reading) => (reading.added >= start) && (reading.added <= end)) });
                // TODO: a better approach to filter by date using mongoose query to be done later
            });

            const json_toSend = {
              "status": "success",
              "message": `Readings of user: ${user_match.username}`,
              "readings": readings_toShow
            };
            return res.json(json_toSend);
          } catch (err) {
            res.status(500);    // return HTTP 500 status code (server error)
            return res.send(err);
          }
        }());
      }

      function post(req, res) {
        (async function handleAddReading() {
          try {
            // Authorization: if execution reached here, then user is authorized to read profile content.    // there's a middleware that interrupts execution before here if user isn't authorised)
            // const user_match = req.user_match;

            // const bucket_maxSize = 200;
            const reading_in = req.body;    // passed in readings data
            const { device_id, value } = reading_in;

            // add direct
            // check if there are any buckets of device id     // To implement reading buckets algorithm later
            const query = { "_id": device_id };
            const device_match = await req.device_MM.findOne(query);
            device_match.readings.push({ val: value, added: Date.now() });   // push reading
            await device_match.save();
            return res.json({ status: "success", message: "Reading added successfuly.", dev_sneakPeek: { device_data: device_match } });
          } catch (err) {
            res.status(500);    // return HTTP 500 status code (server error)
            return res.send(err);
          }
        }());
      }

      function del(req, res) {      // Delete feature to add later
      }

      return { get, post, del };
    }()),
  };
}

module.exports = devicesController;