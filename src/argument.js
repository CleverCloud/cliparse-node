var _ = require("lodash");

var autocomplete = require("./autocomplete");
var parsers = require("./parsers");
var utils = require("./utils");

var argument = module.exports = {};

argument.argument = function(name, options) {
  options = options || {};
  options.name = name || "argument";
  options.parser = options.parser || parsers.stringParser;
  options.description = options.description || "";
  options.complete = options.complete || autocomplete.defaultCompleter;
  options.default = typeof options.default !== "undefined" ? options.default : null;

  return options;
};

argument.parse = function(argument, value) {
  var result;
  if(typeof value !== 'undefined' && value !== null) {
    result = argument.parser(value);
  } else if(argument.default !== null) {
    result = parsers.success(argument.default);
  } else {
    result = parsers.error("missing value");
  }

  result.argument = argument;
  return result;
};

argument.parseList = function(args, providedArguments) {
  var combined = _.zip(args, _.take(providedArguments, args.length));

  var results = _.map(combined, function(kv) {
    return argument.parse(kv[0], kv[1]);
  });

  if(_.every(results, parsers.isSuccess)) {
    return parsers.success(_.pluck(results, "success"));
  } else {
    return parsers.error(results);
  }
};

argument.usage = function(argument) {
  if(argument.default !== null) {
    return "[" + argument.name.toUpperCase() + "]";
  } else {
    return argument.name.toUpperCase();
  }
};

argument.help = function(arg) {
  var description = arg.description;
  if(arg.default !== null) description += " (default: " + arg.default + ")";
  return [argument.usage(arg), description];
};

argument.complete = function(arg, word) {
  return arg.complete(word);
};
