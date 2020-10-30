/* eslint-disable */
const should = require('should');
const sinon = require('sinon');
const debug = require('debug')('app:generalHelpersTests');
const generalHelpers = require('../controllers/helpers/generalHelpers');

// Inputs that are constant throughout all tests
  const pass_vald_ptrn = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;  // password validation pattern          // Brought From: https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
  const email_vald_ptrn = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;   // username validation pattern           // Brought from: https://regexr.com/3e48o

  const params_criteria = {
    "username": { required: true, len: [5, 20], unique: true },
    "password": { required: true, pattern: pass_vald_ptrn },
    "email": { required: true, pattern: email_vald_ptrn, unique: true },
    "name": { required: true }
  };

describe('General Helpers Tests: ', () => {
  describe('validate_params', () => {
    it('should not allow user pass invalid password', async () => {
      // Prepare test input
        user_in = {
          "username": "omaraasdasd",
          "password": "sadasdaA1dasd",     // invalid password here in our test case (Doesn't have special character)
          "email": "omar1243@gmail.com",
          "name": "Omar A"
        };

      // prepare dummy mocks
        const dummy_MM = { findOne: async (dummyQuery) => null };    // dummy/mock MongooseModel that mocks find to tell that username and email are unique

      // run actual test
        const controller = generalHelpers();
        const validation_result = await controller.validate_params(params_criteria, user_in, dummy_MM);

      // Assert
        validation_result.isValid.should.equal(false);
    });

    it('should not allow user pass not-unique username or email', async () => {
      // Prepare test input
        user_in = {
          "username": "omara2112",
          "password": "sadasdaA1dasd",     // invalid password here in our test case (Doesn't have special character)
          "email": "omar1243@gmail.com",
          "name": "Omar A"
        };

      // prepare dummy mocks
        const dummy_MM = { findOne: async (dummyQuery) => "dummyMatch" };

      // run actual test
        const controller = generalHelpers();
        const validation_result = await controller.validate_params(params_criteria, user_in, dummy_MM);

      // assert
        validation_result.isValid.should.equal(false);
    });

    it('should not allow user not pass a required parameter (username/password/email/name)', async () => {
      // Prepare test input
        user_in = {
          "password": "sadasdaA1dasd",     // invalid password here in our test case (Doesn't have special character)
          "name": "Omar A"
        };

      // prepare dummy mocks
      const dummy_MM = { findOne: async (dummyQuery) => null };    // mocks find that tells that username and email are unique

      // run actual test
        const controller = generalHelpers();
        const validation_result = await controller.validate_params(params_criteria, user_in, dummy_MM);

      // assert
        validation_result.isValid.should.equal(false);
    });
  });
});