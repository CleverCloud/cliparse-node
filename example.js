#!/bin/env node

var optparse = require("./optparse.js");
var parsers = require("./parsers.js");

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




var testCli = optparse.cli({
  name: "testCli",
  options: [
    optparse.flag("help", { aliases: ["h", "?"], helpT: "display help" })
  ],
  commands: [

    optparse.command(
      "echo",
      { description: "display the given value",
        args: [ optparse.argument("value", { helpT: "simple value" })],
        options: [ optparse.flag("reverse", { aliases: ["r"], helpT: "reverse the value"}) ]
      },
      echoModule),

    optparse.command(
      "add2",
      { description: "add 2 to the given integer and display the result",
        args: [
          optparse.argument("int",
            { defaultValue: 0,
              parser: parsers.intParser,
              helpT: "int to add 2 to" })
        ]
      },
      addModule)
  ]
});



optparse.parseValues(testCli);

