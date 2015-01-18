#!/bin/env node

var cliparse = require("./src/cliparse");

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
  options: [
    cliparse.flag("help", { aliases: ["h", "?"], helpT: "display help" })
  ],
  commands: [

    cliparse.command(
      "echo",
      { description: "display the given value",
        args: [ cliparse.argument("value", { helpT: "simple value" })],
        options: [ cliparse.flag("reverse", { aliases: ["r"], helpT: "reverse the value"}) ]
      },
      echoModule),

    cliparse.command(
      "add2",
      { description: "add 2 to the given integer and display the result",
        args: [
          cliparse.argument("int",
            { defaultValue: 0,
              parser: cliparse.parsers.intParser,
              helpT: "int to add 2 to" })
        ]
      },
      addModule)
  ]
});



cliparse.parseValues(testCli);

