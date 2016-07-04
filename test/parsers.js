var test = require("tape");

var parsers = require("../src/parsers.js");

/*
 * stringParser
 */

test('stringParser is noop for strings', function(t) {
    var string = "test string";
    var result = parsers.stringParser(string);

    t.plan(1);
    t.same(result, { success: string }, 'dummy string');
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


/*
 * intParser
 */

test('intParser is noop for ints', function(t) {
    var input = 42;
    var result = parsers.intParser(input);

    t.plan(1);
    t.same(result, { success: input }, 'int');
});

/*
 * booleanParser
 */

test('booleanParser is noop for booleans', function(t) {
    var input = true;
    var input2 = false;
    var result = parsers.booleanParser(input);
    var result2 = parsers.booleanParser(input2);

    t.plan(2);
    t.same(result, { success: input }, 'true');
    t.same(result2, { success: input2 }, 'false');
});

/*
 * fileParser
 */

test('existingPathParser tests for file existence', function(t) {
   var input = 'test/parsers.js';
   var input2 = 'test/i-do-not-exist-cause-who-would-name-a-file-like-me';
   var result = parsers.existingPathParser(input);
   var result2 = parsers.existingPathParser(input2);

   t.plan(2);
   t.same(result, { success: 'test/parsers.js' }, 'File path');
   t.same(result2, { error: 'File ' + input2 + ' does not exist' }, 'Error string');
});

