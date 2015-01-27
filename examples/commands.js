#!/bin/env node

var cliparse = require("../src/cliparse");

var echoModule = function(v) {
  if(v.options.reverse === true) {
    console.log(v.args[0].split("").reverse().join(""));
  } else {
    console.log(v.args[0]);
  }
};

var addModule = function(v) {
  console.log(v.args[0] + 2);
};




var testCli = cliparse.cli({
  name: "testCli",
  description: "Simple CLI written for the sake of the example",
  commands: [

    cliparse.command(
      "echo",
      { description: "display the given value",
        args: [ cliparse.argument("value", { description: "simple value" })],
        options: [ cliparse.flag("reverse", { aliases: ["r"], description: "reverse the value"}) ]
      },
      echoModule),

    cliparse.command(
      "add2",
      { description: "add 2 to the given integer and display the result",
        args: [
          cliparse.argument("int",
            { default: 0,
              parser: cliparse.parsers.intParser,
              description: "int to add 2 to" })
        ]
      },
      addModule)
  ]
});



cliparse.parse(testCli);

