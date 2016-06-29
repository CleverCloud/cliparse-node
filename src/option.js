var _ = require("lodash");

var autocomplete = require("./autocomplete");
var parsers = require("./parsers");
var utils = require("./utils");

var option = module.exports = {};

option.option = function(name, options) {
  options = options || {};
  options.name = name;
  options.names = [options.name].concat(options.aliases || []);
  options.expects_value = (typeof options.expects_value !== 'undefined') ? false : true;
  options.metavar = options.metavar || null;
  options.parser = options.parser || parsers.stringParser;
  options.description = options.description || "";
  options.complete = options.complete || autocomplete.defaultCompleter;
  options.default = (typeof options.default !== 'undefined') ? options.default : null;
  options.required = options.required && !options.defaultValue ? true : false;

  return options;
};

option.parse = function(opt, providedOptions) {
  var result;
  var value = _(opt.names)
    .map(function(name) { return providedOptions[name]; })
    .find(function(v) { return typeof v !== 'undefined'; });

  if(typeof value !== 'undefined' && value !== null) {
    result = opt.parser(value);
  } else if(opt.default !== null || !opt.required) {
    result = parsers.success(opt.default);
  } else {
    result = parsers.error("missing value");
  }
  result.option = opt;

  return result;
};

option.parseObject = function(options, providedOptions) {
  var results = _.map(options, function(opt) {
    return option.parse(opt, providedOptions);
  });

  if(_.every(results, parsers.isSuccess)) {
    return parsers.success(_.object(_.map(results, function(r) {
      return [r.option.name, r.success];
    })));
  } else {
    return parsers.error(_.filter(results, parsers.isError));
  }
};


option.help = function(opt) {
  var output = option.displayOptionNames(opt.names, opt.required, true);
  var description = opt.description;
  if(opt.metavar) output += ' ' + opt.metavar.toUpperCase();
  if(opt.default !== null) description += " (default: " + opt.default + ")";

  return [output, description.trim()];
};

option.usage = function(opt) {
  var output = option.displayOptionNames(opt.names, opt.required, false);
  if(opt.metavar) output += ' ' + opt.metavar.toUpperCase();
  return output;
};

option.flag = function(name, options) {
    options = options || {};
    options.expects_value = false;
    options.parser = parsers.booleanParser;
    if(typeof options.default === 'undefined' && !options.required) options.default = false;
    return option.option(name, options);
};


option.availableOptionsText = function(options) {
  if(_.isEmpty(options)) {
    return '';
  } else {
    return "Available options: \n" + _.map(options, function(opt) {
      var h = option.help(opt);
      // ToDo
      return h[0] + '\t' + h[1];
    }).join('\n');
  }
};

option.displayOptionNames = function(names, required, allNames) {
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

option.helpOption = option.flag('help', { aliases: ['?'], description: 'Display help about this program' });
option.versionOption = option.flag('version', { aliases: ['V'], description: 'Display the version of this program' });

option.complete = function(opt, word) {
  return opt.complete(word);
};

option.completeName = function(opt) {
  var names = _.map(opt.names, function(name) {
    if(name.length > 1) return '--' + name;
    else return '-' + name;
  });
  return autocomplete.words(names);
};
