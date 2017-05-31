var test = require("tape");

var cliparse = require("../src/cliparse.js");
var parsers = require("../src/parsers.js");
var option = require("../src/option.js");

/*
 * option
 */

test('default option use case', function(t) {
    var opt = cliparse.option('name');
    var result = option.parse(opt, { name: 'value' });

    t.plan(1);
    t.same(result.success, 'value', 'dummy string');
});

test('option aliases', function(t) {
    var opt = cliparse.option('name', { aliases: ['n'] });
    var result = option.parse(opt, { n: 'value' });

    t.plan(1);
    t.same(result.success, 'value', 'alias used');
});

test('option default value', function(t) {
    var opt = cliparse.option('name', { default: 'value' });
    var result = option.parse(opt, {});

    t.plan(1);
    t.same(result.success, 'value', 'using default value');
});

test('required option fail if absent with no default value', function(t) {
    var opt = cliparse.option('name', { required: true });
    var result = option.parse(opt, {});

    t.plan(1);
    t.notEqual(result.error, undefined, 'error if neither value nor default is defined');
});

test('falcultative option success if absent with no default value', function(t) {
    var opt = cliparse.option('name', {});
    var result = option.parse(opt, {});

    t.plan(1);
    t.same(result.success, null, 'null for non mandatory option');
});

test('option uses the given parser', function(t) {
    var opt = cliparse.option('name', { parser: parsers.intParser});
    var result = option.parse(opt, { name: 12 });

    t.plan(1);
    t.same(result.success, 12, 'option taking an int');
});

test('default flag use case', function(t) {
    var opt = cliparse.flag('name');
    var result = option.parse(opt, {});
    var result2 = option.parse(opt, { name: true });
    var result3 = option.parse(opt, { name: false });

    t.plan(3);
    t.same(result.success,  false, 'defaultValue for a flag');
    t.same(result2.success, true, 'true explicitely given');
    t.same(result3.success, false, 'false explicitely given');
});

test('make sure flags aliases are not overwritten by the complete name', function(t) {
    t.plan(1);
    var opt = cliparse.flag('name', { aliases: ["n"] });
    var cli = cliparse.cli({ options: [opt] }, function(params) {
      t.same(params.options.name, true, 'flag alias');
    });

    cliparse.parse(cli, ["node", "test.js", "-n"]);


});

test('make sure flags are not overwritten by their aliases', function(t) {
    t.plan(1);
    var opt = cliparse.flag('name', { aliases: ["n"] });
    var cli = cliparse.cli({ options: [opt] }, function(params) {
      t.same(params.options.name, true, 'flag');
    });

    cliparse.parse(cli, ["node", "test.js", "--name"]);
});

test('correctly parse option values', function(t) {
    t.plan(1);
    var opt = cliparse.option('name', { aliases: ["n"] });
    var cli = cliparse.cli({ options: [opt] }, function(params) {
      t.same(params.options.name, "value", 'option');
    });

    cliparse.parse(cli, ["node", "test.js", "--name", "value"]);
});