var minimist = require("minimist");
var _ = require("lodash");

var argument = require("./argument").argument;
var autocomplete = require("./autocomplete.js");
var cli = require("./cli").cli;
var command = require("./command").command;
var flag = require("./option").flag;
var option = require("./option").option;
var parse = require("./cli").parse;
var parsers = require("./parsers");
var utils = require("./utils");

var cliparse = module.exports = {};

cliparse.argument = argument;
cliparse.autocomplete = autocomplete;
cliparse.cli = cli;
cliparse.command = command;
cliparse.flag = flag;
cliparse.option = option;
cliparse.parse = parse;
cliparse.parsers = parsers;
