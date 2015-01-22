var _ = require("lodash");

var parsers = require("./parsers");
var utils = require("./utils");

var option = function(name, opts) {
  var options = opts || {};
  var names = [name].concat(options.aliases || []);
  var metavar = options.metavar || null;
  var parser = options.parser || parsers.stringParser;
  var helpT = options.helpT || "";
  var defaultValue = (typeof options.defaultValue !== 'undefined') ? options.defaultValue : null;
  var required = options.required && !defaultValue ? true : false;

  var helpUsage = function() {
      var output = displayOptionNames(names, required, false);
      if(metavar) output += ' ' + metavar.toUpperCase();
      return output;
  }();

  var helpText = function() {
      var output = displayOptionNames(names, required, true);
      if(metavar) output += ' ' + metavar.toUpperCase();
      return output + "\t\t\t\t" + helpT;
  }();

  return {
    names: names,
    required: required,
    getValue: function(cliOpts) {
        var value = _(names)
            .map(function(name) { return cliOpts[name]; })
            .find(function(v) { return typeof v !== 'undefined'; });
      if(value) {
        return parser(value);
      } else if(defaultValue !== null || !required) {
        return { success: defaultValue };
      } else {
        return { error: "missing value" };
      }
    },
    helpText: helpText,
    helpUsage: helpUsage
  };
};

var flag = function(name, opts) {
    var options = opts || {};
    options.parser = parsers.booleanParser;
    if(typeof options.defaultValue === 'undefined' && !options.required) options.defaultValue = false;
    return option(name, options);
};


var parseOptions = function(options, cliOpts) {
  var parsedOptions = _.map(options, function(option) {
    return [option.names[0], option.getValue(cliOpts)];
  });

  if(utils.areValidOptions(parsedOptions)) {
    return {
      success: _.object(_.map(parsedOptions, function(option) {
        return [option[0], option[1].success];
      }))
    };
  } else {
    return { errors: ""};
  }
};

var availableOptionsText = function(options) {
  if(_.isEmpty(options)) {
    return '';
  } else {
    return "Available options: \n" + _.pluck(options, "helpText").join('\n');
  }
};

var displayOptionNames = function(names, required, allNames) {
  var output;
  if(!allNames) {
    names = _.take(names, 1);
  };

  output =  _.map(names, function(name) {
    if(name.length > 1) return '--' + name;
    else return '-' + name;
  }).join(", ");

  if(!required) output = '[' + output + ']';

  return output;
};

module.exports = {
  option: option,
  flag: flag,
  parseOptions: parseOptions,
  availableOptionsText: availableOptionsText,
  displayOptionNames: displayOptionNames
};
