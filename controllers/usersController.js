/* eslint no-continue: "off", no-restricted-syntax: "off", eqeqeq: "off", no-useless-escape: "off" */
require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const debug = require('debug')('app:userController');
const jwt = require('jsonwebtoken');

const usersHelpers = require('./helpers/usersHelpers')();
const generalHelpers = require('./helpers/generalHelpers')();

const { authenticateToken } = usersHelpers;
const { validate_params } = generalHelpers;

function usersController(User, Device) {
  return {
    signup: (function () {
      function post(req, res) {
        (async function handleSignup() {
          try {
            const user_in = req.body;    // read passed in user data based on User mongoose model

            // validate signup parameters
              const pass_vald_ptrn = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;  // password validation pattern          // Brought From: https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
              const email_vald_ptrn = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;   // username validation pattern           // Brought from: https://regexr.com/3e48o

              const params_criteria = {
                "username": { required: true, len: [5, 20], unique: true },
                "password": { required: true, pattern: pass_vald_ptrn },
                "email": { required: true, pattern: email_vald_ptrn, unique: true },
                "name": { required: true }
              };

              // const trimmed_params = ["username", "password", "email", "name"]; // all other params will be removed (for security)
                // Feature to add later
              const params_validate = await validate_params(params_criteria, user_in, req.user_MM);
              // const params_validate = await validate_params(params_criteria, user_in, {MM: User, trim: trimmed_params});
              if (!params_validate.isValid) {   // if any of the parameters isn't valid
                res.status(422);   // send response status code 422 (Unprocessable Entity)
                return res.json({ signup_status: "failed", errors: params_validate.errors });
              }
            // If execution continued to here, then everything is valid, and we can sign up user
              user_in.password = await bcrypt.hash(user_in.password, 10);     // Hash user's password first (salted with 10 rounds)
              const user_in_MMI = new User(user_in);    // MMI: Mongoose Model Instance
              await user_in_MMI.save();
              res.status(201);    // return HTTP 201 status code (fulfilled)
              return res.json({ signup_status: "success", message: "User signed up successfuly.", secret_sneakPeek: { user_data: user_in_MMI } });    // secret sneak peek (to remove on production version)

            // login user     // pass him an authorized token (accessToken) to his profile
          } catch (err) {
            res.status(500);    // return HTTP 500 status code (server error)
            return res.send(err);
          }
        }());
      }
      return { post };
    }()),
    login: (function () {
      function post(req, res) {
        (async function handleLogin() {
          try {
            const user_in = new User(req.body);    // read passed in user data based on User mongoose model

            // check user's password
              /* eslint no-nested-ternary: "off" */
              const userentryname = (user_in.username ? user_in.username : (user_in.email ? user_in.email : ""));
              if (!userentryname) {
                res.status(422);
                return res.json({ login_status: "failed", message: "You didn't send username or email!" });
              }

              if (!user_in.password) {
                res.status(422);
                return res.json({ login_status: "failed", message: "You didn't send password!" });
              }

              const query = {};
              query[`${(user_in.username ? "username" : "email")}`] = userentryname;
              const user_match = await User.findOne(query, 'username password loginSessions max_loginSessions');

              if (!user_match) {
                res.status(401);    // Unauthorised status code
                return res.json({ login_status: "failed", message: "Username or email not found." });
              }

              const is_match = await bcrypt.compare(user_in.password, user_match.password);

              if (!is_match) {
                res.status(401);    // passwords don't match, user can login.
                return res.json({ login_status: "failed", message: "Wrong password." });
              }

              const access_payload = {    // data to encrypt and store within accessToken (This is the access heart)
                "u": user_match.username,
                "iat": Date.now(),     // issued at
                "sid": crypto.randomBytes(8).toString('hex')      // session id
              };

              const default_max_loginSessions = 5;
              const max_loginSessions = (!user_match.max_loginSessions ? default_max_loginSessions : user_match.max_loginSessions);

              if (!(user_match.loginSessions.length < max_loginSessions)) {
                user_match.loginSessions.pop();
              }

              user_match.loginSessions.push({ sid: access_payload.sid, added: Date.now() });   // push session id
              await user_match.save();

              const privateKey = process.env.ATOKENGEN_PRIVATEKEY;

              // Maximum login sessions reached, we'll logout you out of last device in order to provide one free slot for you to login
              const accessToken = jwt.sign(access_payload, privateKey);
              res.status(201);
              return res.json({ login_status: "success", token: accessToken, message: "Logged in successfuly." });
          } catch (err) {
            res.status(500);    // return HTTP 500 status code (server error)
            return res.send(err);
          }
        }());
      }
      return { post };
    }()),
    logout: (function () {
      function get(req, res) {
        (async function handleLogout() {
          try {
              // Authorization: if execution reached here, then user is authorized to read profile content.    // there's a middleware that interrupts execution before here if user isn't authorised)
              const { user_match } = req;

              if (/\/logout\/all\/?/.test(req.url)) {    // check if "/logout/all" was called
                user_match.loginSessions = [];
              } else {    // then "/logout" single session
                const index = user_match.loginSessions.findIndex((item) => item.sid == req.sid);
                if (index > -1) {
                  user_match.loginSessions.splice(index, 1);
                }
              }
              await user_match.save();
              return res.json({ auth_status: "success", message: `${user_match.username} logged out successfuly.` });
          } catch (err) {
            res.status(500);    // return HTTP 500 status code (server error)
            return res.send(err);
          }
        }());
      }
      return { get };
    }()),
    profile: (function () {
      function get(req, res) {
        (async function handleLogout() {
          try {
            // Authorization: if execution reached here, then user is authorized to read profile content.    // there's a middleware that interrupts execution before here if user isn't authorised)
            const { user_match } = req;
            const userInfo_toSend = {};
            const params_to_show = ["username", "email", "added", "last_login"];

            params_to_show.forEach((param) => {
              userInfo_toSend[param] = user_match[param];
            });

            userInfo_toSend.loginSessions_count = user_match.loginSessions.length;
            /* eslint no-underscore-dangle: "off", func-names: "off" */
            const devices_match = await req.device_MM.find({ "owner": user_match._id });
            userInfo_toSend.owned_SensorDevices = devices_match.length;
            // add extra parameters
              // userInfo_toSend.owned_devices = // count devices
                // TODO: and number of readings in each device and operation date and date info and so on
              // get devices and quick info about them

            return res.json({ auth_status: "success", message: `Welcome to ${user_match.username}'s profile page`, user_info: userInfo_toSend });
          } catch (err) {
            res.status(500);    // return HTTP 500 status code (server error)
            return res.send(err);
          }
        }());
      }

      function all(req, res, next) {
        authenticateToken(req, res, next);
      }
      return { all, get };
    }()),

  };
}

module.exports = usersController;