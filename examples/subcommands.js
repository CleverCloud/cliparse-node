#!/bin/env node

var cliparse = require("../src/cliparse");

var numberModule = {
  add: function(v) {
    console.log(v.args[0] + v.args[1]);
  },
  multiply: function(v) {
    console.log(v.args[0] * v.args[1]);
  }
};

var intArgument = cliparse.argument(
  "int",
  {
    defaultValue: 0,
    parser: cliparse.parsers.intParser,
    description: "int value"
  }
);




var testCli = cliparse.cli({
  name: "testCli",
  version: '0.1.0',
  description: "Simple CLI written for the sake of the example",
  commands: [
    cliparse.command(
      "number",
      { description: "perform simple arithmetic calculations",
        commands: [
          cliparse.command(
            "add",
            { description: "add two integers",
              args: [ intArgument, intArgument]
            }, numberModule.add),
          cliparse.command(
            "multiply",
            { description: "multiply two integers",
              args: [ intArgument, intArgument]
            }, numberModule.multiply)
        ]
      }),
  ]
});



cliparse.parse(testCli);
