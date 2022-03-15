var test = require("tape");

var argument = require("../src/argument.js");
var cliparse = require("../src/cliparse.js");
var parsers = require("../src/parsers.js");

/*
 * option
 */

test('default argument use case', function(t) {
    var arg = cliparse.argument('name');
    var result = argument.parse(arg, 'value');

    t.plan(1);
    t.same(result.success, 'value', 'dummy string');
});

test('argument default value', function(t) {
    var arg = cliparse.argument('name', { default: 'value' });
    var result = argument.parse(arg, undefined);

    t.plan(1);
    t.same(result.success, 'value', 'using default value');
});

test('argument fail if absent with no default value', function(t) {
    var arg = cliparse.argument('name', {});
    var result = argument.parse(arg, undefined);

    t.plan(1);
    t.notEqual(result.error, undefined, 'error if neither value nor default is defined');
});

test('argument uses the given parser', function(t) {
    var arg = cliparse.argument('name', { parser: parsers.intParser});
    var result = argument.parse(arg, 12);

    t.plan(1);
    t.same(result.success, 12, 'argument taking an int');
});

test('undefined argument defaults to stringParser', function(t) {
    var result = argument.parse(undefined, '12');

    t.plan(2);
    t.same(result.success, '12', 'undefined argument falls back to string');
    t.same(result.argument, undefined, 'undefined argument falls back to string');
});
