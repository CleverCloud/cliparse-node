var _ = require("lodash");

var utils = {
  getProcessName: function(args) {
    if(args[0] === 'node') {
      return _.take(args, 2).join(" ");
    } else {
      return args[0];
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

module.exports = utils;
