# Declarative CLI parsing for node apps

[![Build Status](https://travis-ci.org/CleverCloud/cliparse-node.svg?branch=master)](https://travis-ci.org/CleverCloud/cliparse-node)
[![Coverage Status](https://coveralls.io/repos/github/CleverCloud/cliparse-node/badge.svg?branch=master)](https://coveralls.io/github/CleverCloud/cliparse-node?branch=master)

This is a library designed to express command-line options. It supports
commands and subcommands (at an arbitrary depth), automatically generates help
text and `usage` contents. You can use custom parsers for attributes and
options values (types supported out of the box: `int`, `bool`, `string`).

Its design is vaguely inspired from
[optparse-applicative](https://hackage.haskell.org/package/optparse-applicative)
which is a great CLI parsing library. JS being not as expressive as Haskell, a
direct port is not possible.

> Disclaimer:
>
> This library has been started by @divarvel as part of his job at Clever Cloud. Since he
> left the company and doesn't use cliparse nor wishes to maintain it anymore, we
> mutually agreed to transfer ownership of the project to CleverCloud.
>
> Big thanks to him for producing this library!


## Enough talk, show me the code

```bash
npm install cliparse
```

```javascript
#!/usr/bin/env node

var cliparse = require("cliparse");
var parsers = cliparse.parsers;

function echoModule(params) {
    
}

function addModule(params) {
    
}

var cliParser = cliparse.cli({
  name: "my-executable",
  description: "Simple CLI written for the sake of the example",
  commands: [

    cliparse.command(
      "echo",
      { description: "Display the given value",
        args: [ cliparse.argument("value", { description: "Simple value" })],
        options: [ cliparse.flag("reverse", { aliases: ["r"], description: "Reverse the value"}) ]
      },
      echoModule),

    cliparse.command(
      "add2",
      { description: "Add 2 to the given integer and display the result",
        args: [
          cliparse.argument("int",
            { default: 0,
              parser: parsers.intParser,
              description: "Int to add 2 to" })
        ]
      },
      addModule)
  ]
});

cliparse.parse(cliParser);
```

Where `echoModule` and `addModule` are callbacks taking a `{ args: ['value'], options: {key: 'value'} }` parameter.

### Generated output

#### Top-level help

```
$ my-executable --help
Usage: my-executable
Simple CLI written for the sake of the example.


Options:
[--help, -?]                    Display help about this program

Available commands:
help                            Display help about this program
echo VALUE                      Display the given value
add2 [INT]                      Add 2 to the given integer and display the result
```

#### Command-level help

```
$ my-executable echo --help
Usage : my-executable echo VALUE
display the given value

Arguments:
VALUE                           Simple value

Options:
[--help, -?]                    Display help about this program
[--reverse, -r]                 Reverse the value
```

## Subcommands

The `command` constructor takes an optional `commands` attribute which allows
you to nest subcommands at an arbitrary level.

```javascript
var testCli = cliparse.cli({
  name: "testCli",
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
```

## Help command

An help command is automatically generated, with the following syntax:

```bash
$ my-executable help <command> <subcommand> <...>
```

It can be disabled by setting `helpCommand` to `false` in `cliparse.cli` options.

## Autocompletion

CLI parse allows you to generate autocompletion scripts for bash and zsh (work
in progress). Generate the script in your npm post-install hook and add it to
your users shell completion scripts to enable it.

It supports completion on commands, options and arguments, as well as on the
help command. Completion on options and arguments are configurable: you can
declare your own completion methods.

All the completion logic is handled within your app, so it will work with
dynamically defined commands.

### Bash

Generate the completion script and put it in bash completion dir:

```bash
$ my-executable --bash-autocomplete-script /complete/path/to/my-executable > ~/.bash_completion.d/my-executable
```

Normally `.bash_completion.d` is automatically sourced. You can put the file
where you want and source it manually.

### ZSH

Generate the completion script and put it in zsh completion dir:

```bash
$ my-executable --zsh-autocomplete-script /complete/path/to/my-executable > ~/.zsh.d/completion/_my-executable
```

The file name **must** be `_my-executable` (if your executable is named
`my-executable`). You can put the file where you want as long as it's in a
directory listed in `$fpath`.

### Custom completion

You can have custom completion for option or arguments, by passing a custom
complete function (see [API](#option)).

For instance to complete on a list of colors:

```javascript
var colorCompleter = function() {
  return autocomplete.words(['mauve', 'blue', 'yellow', 'purple', 'parabolic']);
};
```

To complete on a list of files:

```javascript
var fileCompleter = function() {
  return autocomplete.files;
};
```

The `complete` function can also return a promise for async results.

## API

### `cli`

```javascript
cli(opts, cb);
```

Where opts can contain

 - `name`: the name of the executable (if not provided, `process.argv` is used)
 - `description`: a one-line description of the executable
 - `version`: the version number of the executable (displayed by `--version`.
   Default value: `null`
 - `options`: array of top-level options (constructed with `option` or `flag`). Default
   value: `[]`.
 - `commands`: array of commands (constructed with `command`). Default value: `[]`
 - `args`: array of arguments (constructed with `argument`). If your app
   doesn't have commands.
 - `helpCommand`: Generate a `help` command. Default value: `true`.

If your application is not solely made of commands, you can pass an action
callback. If you don't give a callback, calling your application without any
argument will display a `usage` message describing the available commands.

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
 - `description`: a single-line description of what the option is about. Default
   value: the empty string.
 - `required`: make option mandatory
 - `default`: value used if the option is not given any value. If set,
   overrides the `required` setting.
 - `complete`: a function returning completion results for the option (or a
   promise of results). Default value: a function returning an empty result.
 - `expects_value`: does the option expect a value? Default: true. Rather than
   setting it yourself, use `flag`.


### `flag`

Shorthand for flags (ie options with boolean values, defaulting to `false`,
doesn't expect a value)

```javascript
flag(name, opts);
```

Acts like `option`, with different defaults:

 - `parser` defaults to `booleanParser`, which parses boolean values
 - `default` defaults to `false`

### `argument`

```javascript
argument(name, opts);
```

Where opts can contain

 - `parser`: ther parser used to parse the value of the argument. Default
   value: `stringParser`
 - `description`: a single-line description of what the argument is about.
 - `default`: value used if the argument is not given any value
 - `complete`: a function returning completion results for the argument. Default
   value: a function returning an empty result.

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

### Parsers

Basic scalar types (`int`, `bool`, and `string`) are already supported. It is
possible to declare your own parsers to validate more specific types of values
(eg. enums).

A parser is a function `String -> Result` where `Result` is either 

 - `{ success: <parsed value> }`
 - or `{ error: <error message> }`

Parser results can be constructed with `parsers.success(<value>)` and
`parsers.error(<reason>)`.

For instance, to parse an hexadecimal RBG color:

```javascript
var colorParser = function(input) {
  var pattern = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
  var matches = input.match(pattern);
  if(matches !== null) {
    var components = matches.slice(1,4)
          .map(function(x) { return parseInt(x, 16); });
    return parsers.success(components);
  } else {
    return parsers.error("invalid color code");
  }
}
```

### Autocompletion helpers

#### Autocompletion results

`autocomplete.empty`: no results

`autocomplete.words([…])`: list of words

`autocomplete.glob(<glob>)`: files matching glob (eg. `*.log`).

`autocomplete.files`: files

`autocomplete.directories`: directories

You can combine autocompletion results:

`autocomplete.mappend(<result1, result2>)`: combine results from `result1` and
`result2`. As globs can't be combined, the last one wins (if set).

`autocomplete.mconcat([ <results> ])`: reduce a list of result to a composite
result with `mappend`. If the list is empty, then `empty` is returned.

## Contributing

Make sure you don't break anything.

```bash
npm test
```

## ToDo

### For `0.3.0`

 - [x] Declare flags as boolean options in minimist
 - [ ] [Variadic arguments](https://github.com/divarvel/cliparse-node/issues/7)
 - [ ] [Parse failure on unrecognized options / arguments](https://github.com/divarvel/cliparse-node/issues/1)
 - [ ] [Cleaner display of errors](https://github.com/divarvel/cliparse-node/issues/8)

### Later

 - [ ] [Dedicated ZSH completion (help welcome :-\])](https://github.com/divarvel/cliparse-node/issues/9)
