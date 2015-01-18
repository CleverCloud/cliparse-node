var test = require("tape");

var cliparse = require("../src/cliparse.js");
var parsers = require("../src/parsers.js");

/*
 * subcommand
 */

test('minimal subcommand use case', function(t) {
    t.plan(1);
    var topCommand = cliparse.command('top', {
      commands: [
        cliparse.command('nested', {}, function(vs) { t.pass("no args, no options"); })
      ]
    });

    topCommand.getValue(['nested'], {});
});

test('apply main command in no subcommand matches', function(t) {
    t.plan(1);
    var topCommand = cliparse.command('top', {
      commands: [
        cliparse.command('nested', {}, function(vs) { t.fail("the top-level command should be applied"); })
      ]
    }, function(vs) { t.pass("top-level without arguments"); });

    topCommand.getValue([], {});
});

test('correctly parse subcommand options', function(t) {
    t.plan(1);
    var topCommand = cliparse.command('top', {
      commands: [
        cliparse.command(
          'nested', {
             options: [ cliparse.flag("test") ]
           }, function(vs) {
            t.equal(vs.options.test, true, "subcommand option");
           })
      ]
    });

    topCommand.getValue(['nested'], { test: true });
});

test('carry top-level options to subcommands', function(t) {
    t.plan(1);
    var topCommand = cliparse.command('top', {
      options: [ cliparse.flag("test") ],
      commands: [
        cliparse.command('nested', {}, function(vs) {
          t.equal(vs.options.test, true, "top-level option carried to subcommand");
        })
      ]
    });

    topCommand.getValue(['nested'], { test: true });
});
