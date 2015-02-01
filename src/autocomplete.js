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

autocomplete.glob = function(glob) {
  return {
    words: [],
    glob: glob,
    files: false,
    directories: false
  };
};

autocomplete.files = {
  words: [],
  glob: false,
  files: true,
  directories: false
}

autocomplete.directories = {
  words: [],
  glob: false,
  files: false,
  directories: true
}

autocomplete.mappend = function(result1, result2) {
  return {
    words: result1.words.concat(result2.words),
    glob: result2.glob || result1.glob,
    files: result1.files || result2.files,
    directories: result1.directories || result2.directories
  };
};

autocomplete.mconcat = function(results) {
  return _.reduce(results, autocomplete.mappend, _.clone(autocomplete.empty));
};

autocomplete.compgen = function(results, current) {
  var wordlist = !_.isEmpty(results.words) ? "-W $'" + results.words.join('\n') + "'" : '';
  var globpat = results.glob ? "-G '" + results.glob + "'" : "";
  var files = results.files && !results.glob ? '-f' : '';
  var directories = results.directories && !results.files && !results.glob ? '-d' : '';

  return 'compgen ' + [wordlist, globpat, files, directories].join(' ').trim() + ' -- ' + current;
};

autocomplete.currentArg = function(words, wordIndex, args) {
  var initialState = {
    argsIndex: -1,
    argsLeft: _.clone(args),
    isOption: false,
    wasOption: false
  };

  var finalState = _.reduce(_.take(words, wordIndex + 1), function(state, word) {
    state.wasOption = false;
    if(_.isEmpty(state.argsLeft)) {
      return state;
    }

    if(state.isOption) {
      if(word.slice(0,1) !== '-') {
        state.isOption = false;
        state.wasOption = true;
        return state;
      } else {
        state.isOption = true;
        state.wasOption = true;
        return state;
      }
    }

    if(word === '--') {
      state.isOption = false;
      return state;
    } else if(word.slice(0,1) === '-') {
      state.isOption = true;
      return state;
    } else if(word === state.argsLeft[0]) {
      state.argsIndex ++;
      state.argsLeft.shift();
      return state;
    } else {
      console.error('unhandled state');
      return state;
    }
  }, initialState);

  return {
    argIndex: !finalState.isOption && !finalState.wasOption ? finalState.argsIndex : false,
    consumedArgs: _.take(args, finalState.argsIndex + 1)
  };
};

autocomplete.commandPaths = function(cmd) {
  var childPaths = _.flatten(_.map(cmd.commands, function(c) {
    return autocomplete.commandPaths(c);
  }));

  var res =  _.map(childPaths, function(p) {
    return [ cmd ].concat(p);
  });

  return [[cmd]].concat(res);
};

autocomplete.helpCommandSubpaths = function(cmd) {
  var cmdPaths = autocomplete.commandPaths(cmd);
  var completableCommands = _.filter(cmdPaths, function(p) {
    return p.length > 1 && !p[1].helpCommand;
  });

  return _.map(completableCommands, function(path) {
    return _.pluck(_.drop(path, 1), 'name');
  });
};

autocomplete.autocompleteHelpCommand = function(cmd, argsLeft) {
  var givenPrefix = _.initial(argsLeft);
  var currentWord = _.last(argsLeft) || '';
  var subpaths = autocomplete.helpCommandSubpaths(cmd);
  var matchingSubpaths = _.filter(subpaths, function(path) {
    var pathPrefix = _.take(path, argsLeft.length - 1);
    var currentPathElem = path[argsLeft.length - 1] || '';
    return _.isEqual(pathPrefix, givenPrefix) &&
           _.startsWith(currentPathElem, currentWord);
  });

  var results = _.flatten(_.map(matchingSubpaths, function(x) {
    return x[argsLeft.length - 1] || [];
  }));

  return autocomplete.words(_.uniq(results));
};
