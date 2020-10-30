/* eslint no-continue: "off", no-restricted-syntax: "off", eqeqeq: "off", no-useless-escape: "off", no-await-in-loop: "off" */

const debug = require('debug')('app:generalHelpers');

function generalHelpers() {
  // validate_params    // for parameters validation
  async function validate_params(params_criteria, dataObj, MongooseModel = {}) {
    const errors = { missing_params: [], invalid_params: [], not_unique: [] };
    for (const item of Object.entries(params_criteria)) {
      const [param, options] = item;

      // check if param's value is required and missing
      if (options.required && (!(param in dataObj) || param == "")) {
        errors.missing_params.push(param);
        continue;   // skip to next iteration. No need to check for param validity further if it's missing.
      }

      // check if param's value patten is not valid
      if (options.pattern && !options.pattern.test(dataObj[param])) {
        errors.invalid_params.push(param);
        continue;
      }

      // check if param's value length isn't valid
      if (options.len) {  // len: length (should always be an array of min and max)
        const [min, max] = options.len;
        const str_len = dataObj[param].length;  // param's value's string length
        if (!(str_len > min && str_len < max)) {
          errors.invalid_params.push(param);
          continue;
        }
      }
      if (options.min) {  // min: minimum param's value length
        const { min } = options;
        const str_len = dataObj[param].length;  // param's value's string length
        if (!(str_len > min)) {
          errors.invalid_params.push(param);
          continue;
        }
      }
      if (options.min) {  // min: minimum param's value length
        const { min } = options;
        const str_len = dataObj[param].length;
        if (!(str_len > min)) {
          errors.invalid_params.push(param);
          continue;
        }
      }
      if (options.max) {  // max: maximum param's value length
        const { max } = options;
        const str_len = dataObj[param].length;
        if (!(str_len > max)) {
          errors.invalid_params.push(param);
          continue;
        }
      }

      // check if param's value unique
      if (options.unique) {
        try {
          const query = {};
          query[param] = dataObj[param];
          const matched = await MongooseModel.findOne(query);
          if (matched) {
            errors.not_unique.push(param);
            continue;
          }
        } catch (err) {
          return err;
        }
      }
    }

    if (!(errors.missing_params.length || errors.invalid_params.length || errors.not_unique.length)) {
      return { isValid: true, errors: "" };    // all params are valid
    }     // else: has invalid params

      // clean errors object
      Object.entries(errors).forEach((item) => {
        const [key, arr] = item;    // arr: array
        if (arr.length == 0) {
          delete errors[key];
        }
      });
      return { isValid: false, errors };
  }

  return { validate_params };
}

module.exports = generalHelpers;