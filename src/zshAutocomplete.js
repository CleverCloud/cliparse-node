var _ = require("lodash");

var autocomplete = require("./autocomplete.js");
var option = require("./option.js");

var zshAutocomplete = module.exports = {};

zshAutocomplete.optionLine = function(opt) {
  var names = option.optionNames(opt.names);

  return "    '(" + names.join(' ') + ")'{" + names.join(',') + "}'" + opt.description + "'";
};

zshAutocomplete.optionGroup = function(name, options) {
  return '  ' + name + "_arguments=" + _.flatten([
      '(',
       _.map(options, zshAutocomplete.optionLine),
       '  )']).join('\n');
};

zshAutocomplete.argumentsLists = function(paths) {
  var optionGroups = _.map(paths, function(path) {
    var name = _.pluck(path, 'name').join('_');

    return zshAutocomplete.optionGroup(name, _.flatten(_.pluck(path, 'options')));
  });

  return optionGroups.join('\n\n');
};

zshAutocomplete.argumentsCaseBranch = function(path) {
  var tip = _.last(path);
  var name = _.pluck(path, 'name').join('_');
  var argList = _.map(path, function(cmd) {
  });

  return '    ' +name + ')\n' +
    '      _arguments -s : \\\n' +
    '        ${' + name + '}' + '\n' +
    '      ;;';
};

zshAutocomplete.argumentsCase = function(paths) {
  var branches = _.map(paths, zshAutocomplete.argumentsCaseBranch);
  return '  case "${1}" in\n' +
    branches.join('\n') + '\n' +
    '  esac';
};

zshAutocomplete.completeArgumentsFunction = function(cmd) {
  var name = '_' + cmd.name + '_complete_arguments';
  var paths = autocomplete.commandPaths(cmd);
  var variables = _.map(paths, function(p) {
    return _.pluck(p, 'name').join('_') + '_arguments';
  });
  var argumentsLists = zshAutocomplete.argumentsLists(paths);
  var argumentsCase = zshAutocomplete.argumentsCase(paths);

  return '(( $+function['+name+'] )) ||\n' +
    '  ' + name + '() {\n' +
    '  local -a ' + variables.join(' ') + '\n\n' +
    argumentsLists + '\n\n' +
    argumentsCase + '\n' +
    '}\n';
};

zshAutocomplete.commandLine = function(cmd) {
  return '    ' + cmd.name + ":" + cmd.description;
};

zshAutocomplete.commandGroup = function(name, commands) {
  return '  ' + name + "_commands=" + _.flatten([
      '(',
       _.map(commands, zshAutocomplete.commandLine),
       '  )']).join('\n');
};

zshAutocomplete.commandsLists = function(paths) {
  var commandGroups = _.map(paths, function(path) {
    var name = _.pluck(path, 'name').join('_');

    return zshAutocomplete.commandGroup(name, _.last(path).commands);
  });

  return commandGroups.join('\n\n');
};

zshAutocomplete.commandsCaseBranch = function(path) {
  var tip = _.last(path);
  var name = _.pluck(path, 'name').join('_');
  var argList = _.map(path, function(cmd) {
  });

  return '    ' +name + ')\n' +
    '      _describe -t commands "" ' + name + '_commands\n' +
    '      ;;';
};

zshAutocomplete.commandsCase = function(paths) {
  var branches = _.map(paths, zshAutocomplete.commandsCaseBranch);
  return '  case "${1}" in\n' +
    branches.join('\n') + '\n' +
    '  esac';
};

zshAutocomplete.completeCommandsFunction = function(cmd) {
  var name = '_' + cmd.name + '_complete_commands';
  var paths = autocomplete.commandPaths(cmd);
  var variables = _.map(paths, function(p) {
    return _.pluck(p, 'name').join('_') + '_commands';
  });
  var commandsLists = zshAutocomplete.commandsLists(paths);
  var commandsCase = zshAutocomplete.commandsCase(paths);


  return '(( $+function['+name+'] )) ||\n' +
    '  ' + name + '() {\n' +
    '  local -a ' + variables.join(' ') + '\n\n' +
    commandsLists + '\n\n' +
    commandsCase + '\n' +
    '}\n';
};

zshAutocomplete.mainFunction = function(name) {
  return '_' + name + '() {\n' +
    '  if (( CURRENT > 2 )); then\n' +
    '      local cmd="${words[2]}"\n' +
    '      curcontext="${curcontext%:*:*}:commands-${cmd}"\n' +
    '      (( CURRENT-- ))\n' +
    '      shift words\n' +
    '      _commands_complete_arguments "${cmd}"\n' +
    '  else\n' +
    '      _commands_complete_subcommands\n' +
    '  fi\n' +
    '}';
};

zshAutocomplete.header = function(executableName) {
  return '#compdef ' + executableName;
};

zshAutocomplete.call = function(name) {
  return '_' + name + '"${@}" \n';
};

zshAutocomplete.script = function(cmd) {
  return zshAutocomplete.header(cmd.name) + '\n\n' +
    zshAutocomplete.completeArgumentsFunction(cmd) + '\n\n' +
    zshAutocomplete.completeCommandsFunction(cmd) + '\n\n' +
    zshAutocomplete.mainFunction(cmd.name) + '\n\n' +
    zshAutocomplete.call(cmd.name);
};
