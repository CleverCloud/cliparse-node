var test = require("tape");

var parsers = require("../parsers.js");

/*
 * stringParser
 */

test('stringParser is noop for strings', function(t) {
    var string = "test string";
    var result = parsers.stringParser(string);

    t.plan(1);
    t.same(result, { success: string });
});

test('stringParser turns numbers into strings', function(t) {
    var input = 4.815162342;
    var input2 = 42;
    var input3 = Infinity;
    var result = parsers.stringParser(input);
    var result2 = parsers.stringParser(input2);
    var result3 = parsers.stringParser(input3);

    t.plan(3);
    t.same(result, { success: '4.815162342' }, 'double');
    t.same(result2, { success: '42' }, 'int');
    t.same(result3, { success: 'Infinity' }, 'infinity');
});

test('stringParser turns booleans into strings', function(t) {
    var input = true;
    var input2 = false;
    var result = parsers.stringParser(input);
    var result2 = parsers.stringParser(input2);

    t.plan(2);
    t.same(result, { success: 'true' }, 'true');
    t.same(result2, { success: 'false' }, 'false');
});





