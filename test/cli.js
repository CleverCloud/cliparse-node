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

