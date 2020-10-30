const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },    // Always stored as HASH    [ Security Note: (plain text password is passed to server via encrypted channel "HTTPs". When server decides to store this password, it converts it to hashed version. Also this is done in case of comparison )]
    email: { type: String, required: true },
    name: { type: String, required: true },
    added: { type: Number, default: Date.now() },     // time user signed up
    last_login: { type: Number, default: Date.now() },     // last time user logged in
    loginSessions: { type: Array },     // login sessions ids (helpful if user needed to sign out specific sessions, just remove its id from here (also to limit maximum logged-in devices/sessions))
    max_loginSessions: { type: Number },
    revokeBefore: { type: Number },    // revoke access tokens that are issued before. (helpful if user want to sign out from all sessions)
    special_roles: { type: Array }    // (e.g. admin, suspended)   // if not defined, then user is a user without any advanced privileges
  }
);

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;