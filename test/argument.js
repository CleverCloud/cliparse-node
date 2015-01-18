var test = require("tape");

var cliparse = require("../src/cliparse.js");
var parsers = require("../src/parsers.js");

/*
 * option
 */

test('default argument use case', function(t) {
    var arg = cliparse.argument('name');
    var result = arg.getValue(0, ['value']);

    t.plan(1);
    t.same(result, { success: 'value' }, 'dummy string');
});

test('argument default value', function(t) {
    var arg = cliparse.argument('name', { defaultValue: 'value' });
    var result = arg.getValue(0, []);

    t.plan(1);
    t.same(result, { success: 'value' }, 'using default value');
});

test('argument fail if absent with no default value', function(t) {
    var arg = cliparse.argument('name', {});
    var result = arg.getValue(0, []);

    t.plan(1);
    t.notEqual(result.error, undefined, 'error if neither value nor default is defined');
});

test('argument uses the given parser', function(t) {
    var arg = cliparse.argument('name', { parser: parsers.intParser});
    var result = arg.getValue(0, [12]);

    t.plan(1);
    t.same(result, { success: 12 }, 'argument taking an int');
});
