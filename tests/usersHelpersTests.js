/* eslint-disable */
const should = require('should');
const sinon = require('sinon');
const usersHelpers = require('../controllers/helpers/usersHelpers');

describe('Users Helpers Tests: ', () => {
  describe('authenticateToken', () => {
    it('should not allow user pass empty auth_header', () => {
      // prepare dummy mocks and test input
      const req = {
        headers: {    // should be invalid
          authorization: ''
        }
      };

      const res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      const controller = usersHelpers();
      controller.authenticateToken(req, res);
      res.status.calledWith(400).should.equal(true);
    });
  });
});
