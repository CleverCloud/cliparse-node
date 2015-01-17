var _ = require("lodash");

module.exports = {
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
  },

  withIndexes: function(vs) {
    return _.reduce(vs, function(r, value) {
        r.vs.push([r.idx, value]);
        return {
          idx: r.idx + 1,
          vs: r.vs
        };
    }, { idx: 0, vs: []}).vs;
  },

  isError: function(x) {
    return _.has(x, "errors");
  },

  isValid: function(x) {
    return _.has(x, "success");
  },

  areValid: function(xs) {
    return _.every(xs, this.isValid);
  },

  isValidOption: function(x) {
    return _.has(x[1], "success");
  },

  areValidOptions: function(xs) {
      return _.every(xs, this.isValidOption);
  }
};
