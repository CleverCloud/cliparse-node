var test = require("tape");

var cli = require("../src/cli.js");

test('clean argument values', function(t) {
    t.plan(5);

    t.same(cli.cleanArgv([ "node test.js" ]), []);
    t.same(cli.cleanArgv([ "node.exe", "test.js", "arg1" ]), [ "arg1"]);
    t.same(cli.cleanArgv([ "C:\\path\\to\\node.exe", "test.js", "arg1" ]), [ "arg1"]);
    t.same(cli.cleanArgv([ '/usr/bin/nodejs','test.js', 'arg1']), ['arg1' ]);

    t.same(cli.cleanArgv([ "my-executable", "arg1" ]), [ "arg1"]);
});


test('normalizeHyphenValues binds option values that start with a hyphen', function(t) {
    t.plan(1);
    var argv = ['node', 'test.js', '--token', '-abc123', '--secret', 'x'];
    var out = cli.normalizeHyphenValues(argv, ['token', 'secret'], []);
    t.same(out, ['node', 'test.js', '--token=-abc123', '--secret', 'x']);
});

test('normalizeHyphenValues keeps known flags after options', function(t) {
    t.plan(1);
    var argv = ['node', 'test.js', '--token', '-v'];
    var out = cli.normalizeHyphenValues(argv, ['token'], ['v']);
    t.same(out, ['node', 'test.js', '--token', '-v']);
});

test('normalizeHyphenValues keeps hyphen positionals via end of options', function(t) {
    t.plan(1);
    var argv = ['node', 'test.js', 'FOO', '-bar'];
    var out = cli.normalizeHyphenValues(argv, [], ['a']);
    t.same(out, ['node', 'test.js', 'FOO', '--', '-bar']);
});

test('parse accepts option values that start with a hyphen', function(t) {
    t.plan(2);
    var cliparse = require('../src/cliparse.js');
    var token = cliparse.option('token');
    var secret = cliparse.option('secret');
    var app = cliparse.cli({
      name: 'test.js',
      helpCommand: false,
      options: [token, secret]
    }, function(params) {
      t.same(params.options.token, '-abcxyz');
      t.same(params.options.secret, 'mysecret');
    });
    cliparse.parse(app, ['node', 'test.js', '--token', '-abcxyz', '--secret', 'mysecret']);
});

test('parse accepts positional values that start with a hyphen', function(t) {
    t.plan(2);
    var cliparse = require('../src/cliparse.js');
    var nameArg = cliparse.argument('variable-name');
    var valueArg = cliparse.argument('variable-value');
    var app = cliparse.cli({
      name: 'test.js',
      helpCommand: false,
      args: [nameArg, valueArg],
      options: [cliparse.option('alias', { aliases: ['a'] })]
    }, function(params) {
      t.same(params.args[0], 'FOO');
      t.same(params.args[1], '-bar');
    });
    cliparse.parse(app, ['node', 'test.js', 'FOO', '-bar']);
});
