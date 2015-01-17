# CLI parse for node

This is a library designed to express command-line options. It supports
commands and subcommands (at an arbitrary depth), automatically generates help
text and `usage` contents. You can use custom parsers for attributes and
options values (types supported out of the box: `int`, `bool`, `string`).


## Enough talk, show me the code

```javascript

var cliParser = optparse.cli({
  name: "my-executable",
  description: "Simple CLI written for the sake of the example",
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
```

Where `echoModule` and `addModule` are callbacks taking a `{ args: [], opts: {} }` parameter.

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

ToDo

### `flag`

ToDo

### `argument`

ToDo

### `command`

ToDo

