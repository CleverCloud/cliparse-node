var _ = require("lodash");
var fs = require("fs");

var parsers = module.exports = {};

parsers.success = function(value) {
  return { success: value };
};

parsers.error = function(error) {
  return { error: error };
};

parsers.intParser = function(value) {
  var parsed = parseInt(value, 10);
  if(isNaN(value)) {
    return parsers.error("invalid int: " + value);
  } else {
    return parsers.success(parsed);
  }
};

parsers.stringParser = function(value) {
  return parsers.success(value.toString());
};

parsers.booleanParser = function(value) {
  // minimist autoparses stuff anyway…
  if(typeof value === 'boolean') {
    return parsers.success(value);
  } else {
    return parsers.error("invalid boolean: " + value);
  }
};

parsers.existingPathParser = function(value) {
  // Check that the given string is a legit path of a file that exists
  if (fs.existsSync(value)) {
    return parsers.success(value);
  } else {
    return parsers.error('File ' + value + ' does not exist');
  }
};

parsers.fold = function(result, errorCb, successCb) {
  if(_.has(result, "success")) {
    return successCb(result.success);
  } else {
    return errorCb(result.error);
  }
};

parsers.isError = function(result) {
  return parsers.fold(result, function(__) { return true; }, function(__) { return false });
};

parsers.isSuccess = function(result) {
  return !parsers.isError(result);
};
