var _ = require("lodash");

var autocomplete = module.exports = {};

autocomplete.empty = {
  words: [],
  glob: false,
  files: false,
  directories: false
};

autocomplete.defaultCompleter = function() {
  return autocomplete.empty;
};

autocomplete.words = function(words) {
  var result = _.clone(autocomplete.empty);
  result.words = words;
  return result;
}

autocomplete.mappend = function(result1, result2) {
  return {
    words: result1.words.concat(result2.words),
    glob: result2.glob, // ToDo document
    files: result1.files || result2.files,
    directories: result1.directories || result2.directories
  };
};

autocomplete.mconcat = function(results) {
  return _.reduce(results, autocomplete.mappend, _.clone(autocomplete.empty));
};

autocomplete.compgen = function(results) {
  var wordlist = "-W $'" + results.words.join('\n') + "'";
  var globpat = results.glob ? 'compgen -G "' + results.glob + '"' : '';
  var files = results.files && !results.glob ? 'compgen -f' : '';
  var directories = results.directories && !results.files && !results.glob ? 'compgen -d' : '';

  return 'compgen ' + wordlist;
};
