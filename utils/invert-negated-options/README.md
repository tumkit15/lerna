# `@lerna/invert-negated-options`

> A yargs helper to invert negated boolean options in existing configuration

## Usage

```js
const factory = require("yargs/yargs");
const invertNegatedOptions = require("@lerna/invert-negated-options");

const parser = factory();

// document negated booleans inline
parser.options({
  foo: {
    describe: "Do foo",
    type: "boolean",
  },
  "no-bar": {
    describe: "Do not allow bar",
    type: "boolean",
  },
});

invertNegatedOptions(parser);

parser.parse(["--foo --bar"]); // => { foo: true, bar: true }
parser.parse(["--foo --no-bar"]); // => { foo: true, bar: false }
parser.parse(["--no-foo"]); // => { foo: false }
parser.parse(["--foo"]); // => { foo: true }
```

### Caveat

If you are using [`yargs.strict()`](https://github.com/yargs/yargs/blob/master/docs/api.md#strictenabledtrue),
unfortunately this helper will not work with subcommand options.
