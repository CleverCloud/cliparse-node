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
  let result;
  if(typeof value !== 'undefined' && value !== null) {
    result = argument?.parser(value) ?? parsers.stringParser(value);
  } else if((argument?.default ?? null) !== null) {
    result = parsers.success(argument.default);
  } else {
    result = parsers.error("missing value");
  }

  result.argument = argument;
  return result;
};

argument.parseList = function(args, providedArguments) {
  const combined = _.zip(args, providedArguments);

  const results = _.map(combined, function(kv) {
    return argument.parse(kv[0], kv[1]);
  });

  if(_.every(results, parsers.isSuccess)) {
    const namedArgs = _(results)
    .takeWhile(r => typeof r.argument?.name !== 'undefined')
    .map(r => [r.argument.name, r.success])
    .fromPairs()
    .value();
    return parsers.success({
      args: _.map(results, "success"),
      namedArgs,
      unnamedArgs: _(results).drop(_.size(namedArgs)).map("success").value(),
    });
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
