/* eslint consistent-return: "off" */
const jwt = require('jsonwebtoken');
const debug = require('debug')('app:usersHelpers');

function usersHelpers() {
  // authenticateToken      // for authorization
  async function authenticateToken(req, res, next) {
    try {
      // Check login
        const auth_header = req.headers.authorization;     // should be in the form "Bearer TOKEN"
        const token = auth_header && auth_header.split(' ')[1];

        if (!token) {
          res.status(400);    // Bad request
          return res.json({ auth_status: "failed", message: "Authorization failed. accessToken isn't included in authorization header." });
        }

        const privateKey = process.env.ATOKENGEN_PRIVATEKEY;
        const decrypted_payload = jwt.verify(token, privateKey);

        const user_match = await req.user_MM.findOne({ username: decrypted_payload.u });
        if (!user_match) {    // if user doesn't exist
          res.status(403);    // Forbidden status code
          return res.json({ auth_status: "failed", message: "Authorization failed. accessToken doesn't refer to any of users.", secret_sneekPeek: decrypted_payload });
        }

        if (decrypted_payload.iat <= user_match.revokeBefore) {     // if user revoked old accessTokens
          res.status(403);
          return res.json({ auth_status: "failed", message: "Authorization failed. User has revoked access to this token. Please login again." });
        }

        if (!user_match.loginSessions.find((session) => (session.sid == decrypted_payload.sid))) {     // usid: user session id
          res.status(403);
          return res.json({ auth_status: "failed", message: "Authorization failed. User logged out this session/device. Please login again." });
          // return res.json({auth_status: "failed", message: "Authorization failed. User logged out this session/device. Please login again.", secret_sneekPeek: decrypted_payload});
        }

      // if execution reached here, then user is authorized to read profile content.
        req.user_match = user_match;
        req.sid = decrypted_payload.sid;   // session id is important to be passed to req in case needed for logeout only from this session
        next();
    } catch (err) {
      return res.json({ auth_status: "failed", message: "Authorization failed due to some error.", error: err });
    }
  }

  return { authenticateToken };
}

module.exports = usersHelpers;