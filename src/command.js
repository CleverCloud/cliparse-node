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
      var argList = _.pluck(args, "helpText").join(' ');
      return "Usage : " + cliName +"  " + name + " " + argList + "\n" +
          description + "\n\n" +
          option.availableOptionsText(flags);
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
            console.log(this.helpText());
          }
        }
      } else {
        return { errors: {} };
      }
    }
  };
};

module.exports = {
    command: command
};
