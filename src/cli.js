var _ = require("lodash");
var minimist = require("minimist");
var Promise = require("bluebird").Promise;

var argument = require("./argument");
var autocomplete = require("./autocomplete");
var autocompleteScript = require("./autocompleteScript");
var command = require("./command");
var option = require("./option");
var parsers = require("./parsers");
var utils = require("./utils");

var cli = module.exports = {};

cli.cli = function(options, cb) {
  options.topLevel = true;
  options.version = options.version ?? null;
  options.helpCommand = options.helpCommand ?? true;
  options.options = [ option.helpOption, option.versionOption ].concat(options.options || []);

  if(options.helpCommand) {
    options.commands = [ command.helpCommand ].concat(options.commands || []);
  }

  return command.command(
    options.name || utils.getProcessName(process.argv),
    options,
    cb
  );
};

cli.displayVersion = function(cli) {
  console.log(cli.version !== null ? cli.version : 'N/A');
};

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
    if(error.argument) {
      return error.argument.name + ': ' + error.error;
    } else {
      return error.error;
    }
  });
  var optionsErrors = _.map(errors.options, function(error) {
    if(error.option) {
      return error.option.name + ': ' + error.error;
    } else {
      return error.error;
    }
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

cli.autocomplete = function(cliApp, words, index, flagNames, optionNames) {
  if(typeof words !== 'object') words = [words];
  if(index >= words.length) words.push('');
  var opts = {
     string: optionNames.concat(["_"]),
    boolean: flagNames
  }
  var argv = minimist(words, opts);
  var current = words[index] || '';
  var consumedArgs = autocomplete.currentArg(words, index, argv._).consumedArgs;
  var results;

  if(argv._[1] === 'help' && cliApp.helpCommand) {
    results = Promise.resolve(autocomplete.autocompleteHelpCommand(cliApp, _.drop(consumedArgs, 2)));
  } else {
    results = command.autocomplete(
      cliApp,
      _.drop(consumedArgs, 1),
      argv,
      words,
      index,
      []);
  }

  results.then(function(rs) {
    return autocomplete.compgen(rs, current);
  }).then(console.log);
};

cli.cleanArgv = function(argv) {
  // check the command is launched via the node interpreter (+ ensure windows compat)
  if (argv[0].match(/node/)) {
    return _.drop(argv, 2);
  } else {
    return _.drop(argv, 1);
  }
};

cli.parse = function(cliApp, argv) {
  argv = argv ?? process.argv;

  var flagNames = command.getFlagNames(cliApp);
  var optionNames = command.getOptionNames(cliApp);

  var opts = {
    string: optionNames.concat(["autocomplete-words", "_"]), // All other options should be treated as strings (and not coerced)
    boolean: flagNames // Declare flags as not expecting values
  };

  var cliValues = minimist(argv, opts);
  var optionsWithFlagDefaults = _.omit(cliValues, "_");

  // Minimist adds all the names declared as flags even though they are not
  // present (with value false). These interfere with the parsing later, so we
  // remove them here.
  var options = _.fromPairs(_.filter(_.toPairs(optionsWithFlagDefaults), function(kv) {
    return kv[1] || !_.includes(flagNames, kv[0]);
  }));
  var args = cli.cleanArgv(cliValues._);

  if(option.parse(option.helpOption, options).success === true) {
    cli.displayUsage(cliApp, args);
  } else if(!cliApp.noHelpCommand && args[0] === 'help') {
    cli.displayUsage(cliApp, _.drop(args, 1));
  } else if(option.parse(option.versionOption, options).success === true) {
    cli.displayVersion(cliApp);
  } else if(options["bash-autocomplete-script"]) {
    console.log(autocompleteScript.bashScript(options["bash-autocomplete-script"]));
  } else if(options["zsh-autocomplete-script"]) {
    console.log(autocompleteScript.bashScript(options["zsh-autocomplete-script"], true));
  } else if(options["autocomplete-words"] && options["autocomplete-index"]) {
    cli.autocomplete(cliApp, options["autocomplete-words"], options["autocomplete-index"], flagNames, optionNames);
  } else {
    cli.execute(cliApp, args, options);
  }
};
