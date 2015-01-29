#!/bin/env node

var cliparse = require("../src/cliparse");

var testCli = cliparse.cli({
  name: "testCli",
  description: "Simple CLI written for the sake of the example",
  args: [ cliparse.argument("value") ],
  helpCommand: false,
}, function(x) { console.log(x.args[0]); });



cliparse.parse(testCli);

