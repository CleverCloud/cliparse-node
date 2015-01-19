var _ = require("lodash");

var parsers = {
  intParser: function(value) {
    var parsed = parseInt(value, 10);
    if(isNaN(value)) {
      return { error: "invalid int: " + value };
    } else {
      return { success: parsed };
    }
  },

  stringParser: function(value) {
    return { success: value.toString() };
  },

  booleanParser: function(value) {
    // minimist autoparses stuff anyway…
    if(typeof value === 'boolean') {
      return { success: value };
    } else {
      return { error: "invalid boolean: " + value };
    }
  }
};

module.exports = parsers;
