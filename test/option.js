var test = require("tape");

var optparse = require("../optparse.js");
var parsers = require("../parsers.js");

/*
 * option
 */

test('default option use case', function(t) {
    var option = optparse.option('name');
    var result = option.getValue({ name: 'value' });

    t.plan(1);
    t.same(result, { success: 'value' }, 'dummy string');
});

test('option aliases', function(t) {
    var option = optparse.option('name', { aliases: ['n'] });
    var result = option.getValue({ n: 'value' });

    t.plan(1);
    t.same(result, { success: 'value' }, 'alias used');
});

test('option default value', function(t) {
    var option = optparse.option('name', { defaultValue: 'value' });
    var result = option.getValue({});

    t.plan(1);
    t.same(result, { success: 'value' }, 'using default value');
});

test('option fail if absent with no default value', function(t) {
    var option = optparse.option('name', {});
    var result = option.getValue({});

    t.plan(1);
    t.notEqual(result.error, undefined, 'error if neither value nor default is defined');
});

test('option uses the given parser', function(t) {
    var option = optparse.option('name', { parser: parsers.intParser});
    var result = option.getValue({ name: 12 });

    t.plan(1);
    t.same(result, { success: 12 }, 'option taking an int');
});

test('default flag use case', function(t) {
    var option = optparse.flag('name');
    var result = option.getValue({});
    var result2 = option.getValue({ name: true });
    var result3 = option.getValue({ name: false });

    t.plan(3);
    t.same(result, { success: false }, 'defaultValue for a flag');
    t.same(result2, { success: true }, 'true explicitely given');
    t.same(result3, { success: false }, 'false explicitely given');
});

