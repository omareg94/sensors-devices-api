/* eslint global-require: "off" */
const express = require('express');
const debug = require('debug')('app:userRouter');

function routes(User, Device) {
  const userRouter = express.Router();
  const usersController = require('../controllers/usersController')(User, Device);
  const controller = usersController;

  userRouter.use((req, res, next) => {
    req.user_MM = User;    // prepare User Mongoose Model for all next middleware     // helpful for being accessed from a function (e.g. authenticateToken)
    req.device_MM = Device;    // helpful for side-statistical info in profile
    next();
  });

  userRouter.route('/signup')
    .post(controller.signup.post);

  userRouter.route('/login')
    .post(controller.login.post);

  userRouter.route('/profile')    // see logged in user profile
    .all(controller.profile.all)
    .get(controller.profile.get);

  userRouter.route(['/logout', '/logout/all'])    // option: all (to logout all accounts)
    .all(controller.profile.all)
    .get(controller.logout.get);

  // userRouter.route('/profile/:username')   // login to see full details
  return userRouter;
}

module.exports = routes;