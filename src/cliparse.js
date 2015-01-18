var minimist = require("minimist");
var _ = require("lodash");

var argument = require("./argument").argument;
var cli = require("./cli").cli;
var command = require("./command").command;
var flag = require("./option").flag;
var option = require("./option").option;
var parsers = require("./parsers");
var utils = require("./utils");



var parseValues = function(cliApp, argv) {
  var aargv = (typeof argv === "undefined") ? process.argv : argv;

  var opts = {
      "boolean": true
  };

  var cliValues = minimist(aargv, opts);
  var options = _.omit(cliValues, "_");
  var args = cliValues._;

  if(args[0] === "node") {
    cliApp.getValue(_.drop(args, 2), options);
  } else {
    cliApp.getValue(_.drop(args, 1), options);
  }
};


module.exports = {
  argument: argument,
  cli: cli,
  command: command,
  flag: flag,
  option: option,
  parsers: parsers,
  parseValues: parseValues
};

