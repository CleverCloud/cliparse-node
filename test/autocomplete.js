var minimist = require('minimist');
var test = require("tape");

var cliparse = require("../src/cliparse.js");
var autocomplete = require("../src/autocomplete.js");
var command = require("../src/command.js");

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

  t.equal(autocomplete.compgen(ws, ''), "compgen -W $'test\nyolo' -- ", 'Complete words');
  t.equal(autocomplete.compgen(glob, ''), "compgen -G '*.log' -- ", 'Complete glob');
  t.equal(autocomplete.compgen(directories, ''), "compgen -d -- ", 'Complete directories');
  t.equal(autocomplete.compgen(files, ''), "compgen -f -- ", 'Complete files');

  t.equal(autocomplete.compgen(globAndFile, ''), "compgen -G '*.log' -- ", 'Glob overrides files');
  t.equal(autocomplete.compgen(globAndDirectory, ''), "compgen -G '*.log' -- ", 'Glob overrides directories');

  t.equal(autocomplete.compgen(combined, ''), "compgen -W $'test\nyolo' -G '*.log' -- ", 'Complete all');
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

var simple = cliparse.cli({ name: "testCli"});
var cmds = cliparse.cli({ name: "testCli", commands: [ cliparse.command("inner") ]});
var subcmds = cliparse.cli({
  name: "testCli",
  commands: [ cliparse.command("number", { commands: [ cliparse.command( "add"), cliparse.command( "multiply") ] }) ]
});

test('available command paths', function(t) {
  t.plan(3);


  t.same(autocomplete.subpaths(simple), [], 'Top level');
  t.same(autocomplete.subpaths(cmds), [[ 'inner' ]], 'Commands');
  t.same(autocomplete.subpaths(subcmds), [['number', 'add'], ['number', 'multiply']], 'Subcommands');

});

var myCmd = cliparse.command('cmd', {
  "options": [
    cliparse.option("my-option", {
      "aliases": ["m"],
      "metavar": "VALUE",
      "complete": function() {return cliparse.autocomplete.words(["test"]);}
    })
  ]
});

test('available arguments for a command', function(t) {
  t.plan(3);

  command.autocompleteFinal(myCmd, 1, [], ["cmd", "-"], 1, []).then(function(r) {
    t.same(r.words, ["--my-option", "-m"], "Complete option name");
  });
  command.autocompleteFinal(myCmd, 1, [], ["cmd", "--my-option", ""], 2, []).then(function(r) {
    t.same(r.words, ["test"], "Complete option value (long name)");
  });
  command.autocompleteFinal(myCmd, 1, [], ["cmd", "-m", ""], 2, []).then(function(r) {
    t.same(r.words, ["test"], "Complete option value (short name)");
  });
});

test('help command completion', function(t) {
  t.plan(12);

  t.same(autocomplete.autocompleteHelpCommand(simple, []).words, [], 'Top level');

  t.same(autocomplete.autocompleteHelpCommand(cmds, []).words, [], 'Commands, nothing entered');
  t.same(autocomplete.autocompleteHelpCommand(cmds, ['']).words, ['inner'], 'Commands, empty word');
  t.same(autocomplete.autocompleteHelpCommand(cmds, ['in']).words, ['inner'], 'Commands, incomplete word');
  t.same(autocomplete.autocompleteHelpCommand(cmds, ['inner']).words, ['inner'], 'Commands, complete word');

  t.same(autocomplete.autocompleteHelpCommand(subcmds, []).words, [], 'Subcommands, nothing entered');
  t.same(autocomplete.autocompleteHelpCommand(subcmds, ['']).words, ['number'], 'Subcommands, depth 1, empty word');
  t.same(autocomplete.autocompleteHelpCommand(subcmds, ['nu']).words, ['number'], 'Subcommands, depth 1, incomplete word');
  t.same(autocomplete.autocompleteHelpCommand(subcmds, ['number']).words, ['number'], 'Subcommands, depth 1, complete word');
  t.same(autocomplete.autocompleteHelpCommand(subcmds, ['number', '']).words, ['add', 'multiply' ], 'Subcommands, depth 2, empty word');
  t.same(autocomplete.autocompleteHelpCommand(subcmds, ['number', 'a']).words, ['add'], 'Subcommands, depth 2, incomplete word');
  t.same(autocomplete.autocompleteHelpCommand(subcmds, ['number', 'add']).words, ['add'], 'Subcommands, depth 2, complete word');
});
