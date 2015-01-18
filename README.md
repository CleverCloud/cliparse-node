# Declarative CLI parsing for node apps

[![Build Status](https://travis-ci.org/divarvel/cliparse-node.svg?branch=master)](https://travis-ci.org/divarvel/cliparse-node)

This is a library designed to express command-line options. It supports
commands and subcommands (at an arbitrary depth), automatically generates help
text and `usage` contents. You can use custom parsers for attributes and
options values (types supported out of the box: `int`, `bool`, `string`).

Its design is vaguely inspired from
[optparse-applicative](https://hackage.haskell.org/package/optparse-applicative)
which is a great CLI parsing library. JS being not as expressive as Haskell, a
direct port is not possible.


## Enough talk, show me the code

```javascript
var cliparse = require("cliparse");
var parsers = cliparse.parsers;

var cliParser = cliparse.cli({
  name: "my-executable",
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
              parser: parsers.intParser,
              helpT: "int to add 2 to" })
        ]
      },
      addModule)
  ]
});

cliparse.parseValues(testCli);
```

Where `echoModule` and `addModule` are callbacks taking a `{ args: ['value'], options: {key: 'value'} }` parameter.

### Generated output

#### Top-level help

```
$ my-executable
my-executable: Simple CLI written for the sake of the example.

Available options:
--help, -h, -?                          display help

Available commands:
  echo VALUE                            display the given value
  add2 [INT]                            add 2 to the given integer and display the result
```

#### Command-level help

```
$ my-executable echo
Usage : my-executable  echo VALUE
display the given value

Available options:
--reverse, -r                           reverse the value
```

## Subcommands

The `command` constructor takes an optional `commands` attribute which allows
you to nest subcommands at an arbitrary level.

ToDo example

## API

### `cli`

```javascript
cli(opts, cb);
```

Where opts can contain

 - `name`: the name of the executable (if not provided, `process.argv` is used)
 - `description`: a one-line description of the executable
 - `options`: array of top-level options (constructed with `option` or `flag`). Default
   value: `[]`.
 - `commands`: array of commands (constructed with `command`). Default value: `[]`
 - `args`: array of arguments (constructed with `argument`). If your app
   doesn't have commands.

If your application is not solely made of commands, you can pass an action callback. If you don't give a callback, calling your application without any argument will display a `usage` message describing the available commands.

### `option`

```javascript
option(name, opts);
```

Where name is the name of the flag, and opts can contain

 - `aliases`: array of other names (the shorthand name for instance. Default
   value: `[]`
 - `metavar`: the name of the value of the option (if applicable: for flags,
  see below)
 - `parser`: the parser used to parse the value. Default value: `stringParser`
   which is a noop parser returning the string.
 - `helpT`: a single-line description of what the option is about. Default
   value: the empty string.
 - `defaultValue`: value used if the option is not given any value


### `flag`

Shorthand for flags (ie options with boolean values, defaulting to `false`)

```javascript
flag(name, opts);
```

Acts like `option`, with different defaults:

 - `parser` defaults to `booleanParser`, which parses boolean values
 - `defaultValue` defaults to `false`

### `argument`

```javascript
argument(name, opts);
```

Where opts can contain

 - `parser`: ther parser used to parse the value of the argument. Default
   value: `stringParser`
 - `help`: a single-line description of what the argument is about.
 - `defaultValue`: value used if the argument is not given any value


### `command`

```javascript
command(name, opts, cb);
```

Where `name` is the name of the command , and `opts` can contain

 - `description`: a single line description of the command
 - `args`: array of arguments (constructed with `argument`). Default value: `[]`
 - `options`: array of options (constructed with `option`). Default value:
   `[]`
 - `commands`: array of subcommands (constructed with `command`). Default
   value: `[]`

`cb` is a callback which is called when the command match (if no subcommand
match). It is called with a `{ args: ['value'], options: {key: 'value'}}` object. `opts` contains
both the options of the command and the options of the parent commands.

## Contributing

Make sure you don't break anything.

```bash
npm test
```

## ToDo list

 - Generate autocompletion script.
 - Better handling of parsing errors for commands (still to many side effects)
 - Document custom parsers
 - Document and test subcommands
