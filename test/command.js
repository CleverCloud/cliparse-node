var test = require("tape");

var cliparse = require("../src/cliparse.js");
var parsers = require("../src/parsers.js");

/*
 * option
 */

test('default command use case', function(t) {
    t.plan(1);
    var command = cliparse.command('name', {}, function(vs) { t.pass("no args, no options"); });
    command.getValue([], {});
});

test('command with one flag', function(t) {
    t.plan(2);
    var option = cliparse.flag('test');
    var mkCommand = function(cb) {
        return cliparse.command( 'name', { options: [option] }, cb);
    };

    mkCommand(function(vs) { t.isEqual(vs.options.test, true, 'option present'); }).getValue([], { test: true });
    mkCommand(function(vs) { t.isNotEqual(vs.options.test, true, 'option not there'); }).getValue([], {});
});

test('command with a required option without default', function(t) {
    t.plan(2);
    var option = cliparse.option('test', { required: true });
    var mkCommand = function(cb) {
        return cliparse.command( 'name', { options: [option] }, cb);
    };

    mkCommand(function(vs) { t.isEqual(vs.options.test, 'value', 'option present'); }).getValue([], { test: 'value' });
    var result = mkCommand(function(vs) { t.fail('must fail if option not there'); }).getValue([], {});
    t.isNotEqual(result.errors, undefined, 'fail if option not there');
});

test('command with arguments', function(t) {
    t.plan(1);
    var argument = cliparse.argument('test');
    var mkCommand = function(cb) {
        return cliparse.command('name', { args: [argument]}, cb);
    };

    mkCommand(function(vs) { t.same(vs.args, ['value'], 'argument present'); }).getValue(['value'], {});
    mkCommand(function(vs) { t.fail('must fail if argument not there'); }).getValue([], {});
});
