var _ = require("lodash");

var argument = require("./argument");
var option = require("./option");
var utils = require("./utils");

var command = function(name, opts, cb) {
  var options = opts || {};
  var description = options.description || "";
  var args = options.args || [];
  var flags = options.options || [];
  var commands = options.commands || [];
  var action = typeof cb !== 'undefined' ? cb : null;
  return {
    name: name,
    args: args,
    options: flags,
    helpText: function(cliName) {
      var optionsText = option.availableOptionsText(flags);
      var commandsText = availableCommandsText(commands);
      var requiredOptions = _.filter(flags, function(option) { return option.required; });

      var argsHelp = _.pluck(args, "helpText");
      var optionsHelp = _.map(requiredOptions, function(opt) {
        return opt.helpUsage;
      });
      var yolo = argsHelp.concat(optionsHelp);

      var output = "Usage : " + cliName + " " + name;
      if(yolo.length > 0) output += ' ' + yolo.join(' ');
      if(description) output += "\n " + description;
      output += '\n';
      if(optionsText) output += '\n' + optionsText;
      if(optionsText && commandsText) output += '\n';
      if(commandsText) output += '\n' + commandsText;

      return output;
    },
    singleLineHelp: "  " + name + " " + _.pluck(args, "helpText").join(' ') + "\t\t\t\t" + description,
    getValue: function(cliArgs, cliOpts, globalOpts) {
      var globalOptions = globalOpts || {};
      var parsedOptions = option.parseOptions(flags, cliOpts);

      if(utils.isValid(parsedOptions)) {
        var matchedCommand = _.find(commands, function(command) {
          return command.name === cliArgs[0];
        });

        if(matchedCommand) {
          var commandResult = matchedCommand.getValue(_.drop(cliArgs, 1), cliOpts, parsedOptions.success);
          if(utils.isError(commandResult)) {
            console.log(matchedCommand.helpText(name));
          }
        } else {
          var parsedArgs = argument.parseArgs(args, cliArgs);

          if(action !== null && utils.isValid(parsedArgs)) {
              action({
                args: parsedArgs.success,
                options: _.extend(parsedOptions.success, globalOpts)
              });
          } else {
            return { errors: {} };
          }
        }
      } else {
        return { errors: {} };
      }
    }
  };
};

var availableCommandsText = function(commands) {
  if(_.isEmpty(commands)) {
    return '';
  } else {
    return "Available commands: \n" + _.pluck(commands, "singleLineHelp").join('\n');
  }
};

module.exports = {
    availableCommandsText: availableCommandsText,
    command: command
};
