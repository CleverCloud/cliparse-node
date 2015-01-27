var _ = require("lodash");
var minimist = require("minimist");

var argument = require("./argument");
var command = require("./command");
var option = require("./option");
var parsers = require("./parsers");
var utils = require("./utils");

var cli = module.exports = {};

cli.cli = function(options, cb) {
  options.noHelpCommand = options.noHelpCommand || false;
  options.options = [ option.helpOption ].concat(options.options || []);

  if(!options.noHelpCommand) {
    options.commands = [ command.helpCommand ].concat(options.commands || []);
  }

  return command.command(
    options.name || utils.getProcessName(process.argv),
    options,
    cb
  );
}

cli.displayUsage = function(cliApp, givenArgs) {
  var context = _.reduce(givenArgs, function(acc, arg) {
    var isDone = acc[0];
    var cmd = _.last(acc[1]);

    var matchingSubcommand = _.find(cmd.commands, function(cmd) {
      return cmd.name === arg;
    });

    if(!isDone && matchingSubcommand) {
      return [false, acc[1].concat(matchingSubcommand)];
    } else {
      return [true, acc[1]];
    }
  }, [false, [cliApp]])[1];

  console.log(command.help(context).trim());
};

cli.displayErrors = function(errors, cliApp, givenArgs) {
  var argsErrors = _.map(errors.args, function(error) {
    return error.argument.name + ': ' + error.error;
  });
  var optionsErrors = _.map(errors.options, function(error) {
    return error.option.name + ': ' + error.error;
  });

  if(!_.isEmpty(argsErrors)) console.log(argsErrors.join('\n'));
  if(!_.isEmpty(optionsErrors)) console.log(optionsErrors.join('\n'));

  if(!_.isEmpty(argsErrors) || !_.isEmpty(optionsErrors)) console.log();

  cli.displayUsage(cliApp, givenArgs);
};

cli.execute = function(cliApp, args, options) {
  var result = command.parse(cliApp, [], args, options);

  if(parsers.isError(result)) {
    cli.displayErrors(result.error, cliApp, args);
  } else {
    if(!_.last(result.context).action) {
      cli.displayUsage(cliApp, args);
    } else {
      _.last(result.context).action(result.success);
    }
  }
};

cli.autocomplete = function(cliApp, argv) {
  // ToDo
};

cli.parse = function(cliApp, argv) {
  argv = (typeof argv === "undefined") ? process.argv : argv;

  var opts = {};

  var cliValues = minimist(argv, opts);
  var options = _.omit(cliValues, "_");
  var args = cliValues._;

  if(args[0] === "node") {
    args = _.drop(args, 2);
  } else {
    args = _.drop(args, 1);
  }

  if(option.parse(option.helpOption, options).success === true) {
    cli.displayUsage(cliApp, args);
  } else if(!cliApp.noHelpCommand && args[0] === 'help') {
    cli.displayUsage(cliApp, _.drop(args, 1));
  } else {
    cli.execute(cliApp, args, options);
  }
};

