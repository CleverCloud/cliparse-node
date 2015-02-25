var test = require("tape");

var cliparse = require("../src/cliparse.js");
var command = require("../src/command.js");
var parsers = require("../src/parsers.js");

/*
 * option
 */

test('default command use case', function(t) {
    t.plan(1);
    var cmd = cliparse.command('name');
    var result = command.parse(cmd, [], [], {});
    t.same(result.success, { options: {}, args: [] });
});

test('command with one flag', function(t) {
    t.plan(2);
    var option = cliparse.flag('test');
    var cmd = cliparse.command( 'name', { options: [option] });

    var r1 = command.parse(cmd, [], [], { test: true });
    var r2 = command.parse(cmd, [], [], {});

    t.same(r1.success, { options: { test: true }, args: [] }, 'option present');
    t.same(r2.success, { options: { test: false }, args: [] }, 'option not there');
});

test('command with a required option without default', function(t) {
    t.plan(2);
    var option = cliparse.flag('test', { required: true });
    var cmd = cliparse.command( 'name', { options: [option] });

    var r1 = command.parse(cmd, [], [], { test: true });
    var r2 = command.parse(cmd, [], [], {});

    t.same(r1.success, { options: { test: true }, args: [] }, 'option present');
    t.same(r2.success, undefined, 'option not there');
});

test('command with arguments', function(t) {
    t.plan(2);
    var argument = cliparse.argument('test');
    var cmd = cliparse.command('name', { args: [argument]});

    var r1 = command.parse(cmd, [], ['value'], {});
    var r2 = command.parse(cmd, [], [], {});

    t.same(r1.success, { options: {}, args: ['value'] }, 'argument present');
    t.same(r2.success, undefined, 'must fail if argument not there');
});

test('retrieve flags', function(t) {
    t.plan(2);
    var flag1 = cliparse.flag('test');
    var flag2 = cliparse.flag('other-test');
    var cmd1 = cliparse.command('name', { options: [flag1]});
    var cmd2 = cliparse.command('name', { options: [flag1], commands: [ cliparse.command('inner', { options: [flag2] })]});

    var r1 = command.getFlags(cmd1);
    var r2 = command.getFlags(cmd2);

    t.same(r1, [flag1], 'simple command');
    t.same(r2, [flag1, flag2], 'nested commands');
});
