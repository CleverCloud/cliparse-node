var minimist = require('minimist');
var test = require("tape");

var autocomplete = require("../src/autocomplete.js");

/*
 * Autocomplete results monoid
 */

test('mconcat returns empty for an empty array', function(t) {
    var input = [];
    var result = autocomplete.mconcat([]);

    t.plan(1);
    t.same(result, autocomplete.empty, 'No results');
});

test('mappend identity', function(t) {
    var e = autocomplete.empty;
    var x = {
      words: ['test', 'yolo'],
      glob: '*.log',
      directories: true,
      files: false
    };
    var resultL = autocomplete.mappend(e, x);
    var resultR = autocomplete.mappend(x, e);

    t.plan(2);
    t.same(resultL, x, 'Left identity');
    t.same(resultR, x, 'Right identity');
});

/*
 * Compgen
 */
test('compgen output', function(t) {
  t.plan(7);

  var ws = autocomplete.words(['test', 'yolo']);
  var glob = autocomplete.glob('*.log');
  var directories = autocomplete.directories;
  var files = autocomplete.files;
  var combined = autocomplete.mconcat([ws, glob, directories, files]);
  var globAndFile = autocomplete.mappend(glob, files);
  var globAndDirectory = autocomplete.mappend(glob, directories);

  t.equal(autocomplete.compgen(ws), "compgen -W $'test\nyolo'", 'Complete words');
  t.equal(autocomplete.compgen(glob), "compgen -G '*.log'", 'Complete glob');
  t.equal(autocomplete.compgen(directories), "compgen -d", 'Complete directories');
  t.equal(autocomplete.compgen(files), "compgen -f", 'Complete files');

  t.equal(autocomplete.compgen(globAndFile), "compgen -G '*.log'", 'Glob overrides files');
  t.equal(autocomplete.compgen(globAndDirectory), "compgen -G '*.log'", 'Glob overrides directories');

  t.equal(autocomplete.compgen(combined), "compgen -W $'test\nyolo' -G '*.log'", 'Complete all');
});

test('current argument from COMPCWORD', function(t) {
  t.plan(12);

  var wordsSimple = ['name', 'a', 'b', 'c'];
  var wordsComplex = ['name', '-ab', '--test', 'value', '--', 'a', 'b', 'c'];
  var argsSimple = minimist(wordsSimple)._;
  var argsComplex = minimist(wordsComplex)._;

  t.equal(autocomplete.currentArg(wordsSimple, 3, argsSimple).argIndex, 3, 'Simple argument - position');
  t.same(autocomplete.currentArg(wordsSimple, 3, argsSimple).consumedArgs, ['name', 'a', 'b', 'c'], 'Simple argument - consumed args');
  t.equal(autocomplete.currentArg(wordsSimple, 1, argsSimple).argIndex, 1, 'Simple argument, early return - position');
  t.same(autocomplete.currentArg(wordsSimple, 1, argsSimple).consumedArgs, ['name', 'a'], 'Simple argument, early return - consumed args');

  t.equal(autocomplete.currentArg(wordsComplex, 7, argsComplex).argIndex, 3, 'Complex argument - position');
  t.same(autocomplete.currentArg(wordsComplex, 7, argsComplex).consumedArgs, ['name', 'a', 'b', 'c'], 'Complex argument - consumed args');
  t.equal(autocomplete.currentArg(wordsComplex, 6, argsComplex).argIndex, 2, 'Complex argument, early return - position');
  t.same(autocomplete.currentArg(wordsComplex, 6, argsComplex).consumedArgs, ['name', 'a', 'b'], 'Complex argument, early return - consumed args');

  t.equal(autocomplete.currentArg(wordsComplex, 5, argsComplex).argIndex, 1, 'Complex argument, after separator - position');
  t.same(autocomplete.currentArg(wordsComplex, 5, argsComplex).consumedArgs, ['name', 'a'], 'Complex argument, after separator - consumed args');

  t.equal(autocomplete.currentArg(wordsComplex, 3, argsComplex).argIndex, false, 'Complex argument, after option - position');
  t.same(autocomplete.currentArg(wordsComplex, 3, argsComplex).consumedArgs, ['name'], 'Complex argument, after option - consumed args');
});
