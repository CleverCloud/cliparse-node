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
    t.same(result.success, { options: {}, args: [], namedArgs: {}, unnamedArgs: [] });
});

test('command with one flag', function(t) {
    t.plan(2);
    var option = cliparse.flag('test');
    var cmd = cliparse.command( 'name', { options: [option] });

    var r1 = command.parse(cmd, [], [], { test: true });
    var r2 = command.parse(cmd, [], [], {});

    t.same(r1.success, { options: { test: true }, args: [], namedArgs: {}, unnamedArgs: [] }, 'option present');
    t.same(r2.success, { options: { test: false }, args: [], namedArgs: {}, unnamedArgs: [] }, 'option not there');
});

test('command with a required option without default', function(t) {
    t.plan(2);
    var option = cliparse.flag('test', { required: true });
    var cmd = cliparse.command( 'name', { options: [option] });

    var r1 = command.parse(cmd, [], [], { test: true });
    var r2 = command.parse(cmd, [], [], {});

    t.same(r1.success, { options: { test: true }, args: [], namedArgs: {}, unnamedArgs: [] }, 'option present');
    t.same(r2.success, undefined, 'option not there');
});

test('command with arguments', function(t) {
    t.plan(3);
    var argument = cliparse.argument('test');
    var cmd = cliparse.command('name', { args: [argument]});

    var r1 = command.parse(cmd, [], ['value'], {});
    var r2 = command.parse(cmd, [], [], {});
    var r3 = command.parse(cmd, [], ['value', 'extra value'], {});

    t.same(r1.success, { options: {}, args: ['value'], namedArgs: { test: 'value' }, unnamedArgs: [] }, 'argument present');
    t.same(r2.success, undefined, 'must fail if argument not there');
    t.same(r3.success, { options: {}, args: ['value', 'extra value'], namedArgs: { test: 'value' }, unnamedArgs: ['extra value'] }, 'must recognize named argument and split unnamed argument');
});

test('command with no named arguments', function(t) {
    t.plan(3);
    var cmd = cliparse.command('name', {});

    var r1 = command.parse(cmd, [], ['value'], {});
    var r2 = command.parse(cmd, [], [], {});
    var r3 = command.parse(cmd, [], ['value', 'extra value'], {});

    t.same(r1.success, { options: {}, args: ['value'], namedArgs: {}, unnamedArgs: ['value'] }, 'argument present');
    t.same(r2.success, { options: {}, args: [], namedArgs: {}, unnamedArgs: [] }, 'no arguments means no failure');
    t.same(r3.success, { options: {}, args: ['value', 'extra value'], namedArgs: {}, unnamedArgs: ['value', 'extra value'] }, 'must put all arguments as unnamed');
});

test('retrieve flags', function(t) {
  t.plan(3);
  var flag1 = cliparse.flag('flag-one');
  var flag2 = cliparse.flag('flag-two', { aliases: ["f"] });
  var flag3 = cliparse.flag('flag-three', { aliases: ["x"]});
  var option1 = cliparse.option('opt-one');
  var option2 = cliparse.option('opt-two', { aliases: ["o"] });
  var option3 = cliparse.option('opt-three', { aliases: ["t"]});
  var cmd1 = cliparse.command('name', { options: [flag1, option2]});
  var cmd2 = cliparse.command('name', { options: [flag1, option1], commands: [ cliparse.command('inner', { options: [flag2, option2] })]});
  var cmd3 = cliparse.command('name', { options: [flag1, option1], commands: [
    cliparse.command('inner', { options: [flag2, option2], commands: [
        cliparse.command('second-inner', { options: [flag3, option3] }),
    ]})
  ]});

  var r1 = command.getFlagNames(cmd1);
  var r2 = command.getFlagNames(cmd2);
  var r3 = command.getFlagNames(cmd3);

  t.same(r1, ['flag-one'], 'simple command');
  t.same(r2, ['flag-one', 'flag-two', 'f'], 'nested commands');
  t.same(r3, ['flag-one', 'flag-two', 'f', 'flag-three', 'x'], 'nested commands two levels');
});

test('retrieve option names', function(t) {
    t.plan(3);
    var flag1 = cliparse.flag('flag-one');
    var flag2 = cliparse.flag('flag-two', { aliases: ["f"] });
    var flag3 = cliparse.flag('flag-three', { aliases: ["x"]});
    var option1 = cliparse.option('opt-one');
    var option2 = cliparse.option('opt-two', { aliases: ["o"] });
    var option3 = cliparse.option('opt-three', { aliases: ["t"]});
    var cmd1 = cliparse.command('name', { options: [flag1, option2]});
    var cmd2 = cliparse.command('name', { options: [flag1, option1], commands: [ cliparse.command('inner', { options: [flag2, option2] })]});
    var cmd3 = cliparse.command('name', { options: [flag1, option1], commands: [
        cliparse.command('inner', { options: [flag2, option2], commands: [
            cliparse.command('second-inner', { options: [flag3, option3] }),
        ]})
    ]});

    var r1 = command.getOptionNames(cmd1);
    var r2 = command.getOptionNames(cmd2);
    var r3 = command.getOptionNames(cmd3);

    t.same(r1, ['opt-two', 'o'], 'simple command');
    t.same(r2, ['opt-one', 'opt-two', 'o'], 'nested commands');
    t.same(r3, ['opt-one', 'opt-two', 'o', 'opt-three', 't'], 'nested commands two levels');
});

test('command with unknown options', function(t) {
  t.plan(1);
  var flag = cliparse.flag('test');
  var cmd = cliparse.command('name', { options: [flag]});
  var r = command.parse(cmd, [], [], {test: true, unknown: "value"});
  t.same(r.success, undefined, 'must fail on unknown options')
});
