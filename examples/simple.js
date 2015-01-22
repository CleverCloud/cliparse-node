#!/bin/env node

var cliparse = require("../src/cliparse");

var testCli = cliparse.cli({
  name: "testCli",
  description: "Simple CLI written for the sake of the example",
  args: [ cliparse.argument("value") ],
  options: [
    cliparse.flag("help", { aliases: ["h", "?"], helpT: "display help" })
  ],
}, function(x) { console.log(x.args[0]); });



cliparse.parseValues(testCli);

