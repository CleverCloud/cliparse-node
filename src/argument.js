var _ = require("lodash");

var parsers = require("./parsers");
var utils = require("./utils");

var parseArgs = function(args, cliArgs) {
  var parsedArgs = _.map(utils.withIndexes(args), function(arg) {
    return arg[1].getValue(arg[0], cliArgs);
  });

  if(utils.areValid(parsedArgs)) {
    return { success: _.pluck(parsedArgs, "success") };
  } else {
    return { errors: ""};
  }
};

var argument = function(name, opts) {
  var options = opts || {};
  var parser = options.parser || parsers.stringParser;
  var help = options.help || "";
  var defaultValue = typeof options.defaultValue !== "undefined" ? options.defaultValue : null;

  return {
    getValue: function(position, args) {
      var value = args[position];
      if(value) {
        return parser(value);
      } else if(defaultValue !== null) {
        return { success: defaultValue };
      } else {
        return { error: "missing value" };
      }
    },
    helpText: function() {
      if(defaultValue !== null) {
        return "[" + name.toUpperCase() + "]";
      } else {
        return name.toUpperCase();
      }
    }()
  };
};

module.exports = {
  parseArgs: parseArgs,
  argument: argument
};
