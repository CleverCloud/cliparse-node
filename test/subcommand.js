var test = require("tape");

var _ = require("lodash");

var cliparse = require("../src/cliparse.js");
var command = require("../src/command.js");
var parsers = require("../src/parsers.js");

/*
 * subcommand
 */

test('minimal subcommand use case', function(t) {
    t.plan(3);
    var topCommand = cliparse.command('top', {
      commands: [ cliparse.command('nested', {}) ]
    });

    var r = command.parse(topCommand, [], ['nested'], {});

    t.equal(r.error, undefined, 'parse must succeed');
    t.equal(r.context.length, 2, 'subcommand parse');
    t.equal(_.last(r.context).name, 'nested', 'correct subcommand parse');
});

test('apply main command in no subcommand matches', function(t) {
    t.plan(3);
    var topCommand = cliparse.command('top', {
      commands: [
        cliparse.command('nested', {})
      ]
    });

    var r = command.parse(topCommand, [], [], {});

    t.equal(r.error, undefined, 'parse must succeed');
    t.equal(r.context.length, 1, 'subcommand doesn\'t match');
    t.equal(_.last(r.context).name, 'top', 'subcommand doesn\'t match');
});

test('correctly parse subcommand options', function(t) {
    t.plan(4);
    var topCommand = cliparse.command('top', {
      commands: [
        cliparse.command('nested', { options: [ cliparse.flag("test") ] })
      ]
    });

    var r = command.parse(topCommand, [], ['nested'], { test: true });

    t.equal(r.error, undefined, 'parse must succeed');
    t.equal(r.context.length, 2, 'subcommand parse');
    t.equal(_.last(r.context).name, 'nested', 'correct subcommand parse');
    t.same(r.success, { args: [], namedArgs: {}, unnamedArgs: [], options: { test: true }}, 'correct subcommand parse');
});

test('carry top-level options to subcommands', function(t) {
    t.plan(4);
    var topCommand = cliparse.command('top', {
      options: [ cliparse.flag("test") ],
      commands: [
        cliparse.command('nested', {})
      ]
    });

    var r = command.parse(topCommand, [], ['nested'], { test: true });
    t.equal(r.error, undefined, 'parse must succeed');
    t.equal(r.context.length, 2, 'subcommand parse');
    t.equal(_.last(r.context).name, 'nested', 'correct subcommand parse');
    t.same(r.success, { args: [], namedArgs: {}, unnamedArgs: [], options: { test: true }}, 'correct subcommand parse');

});
