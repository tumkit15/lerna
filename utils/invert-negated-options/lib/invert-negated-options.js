"use strict";

module.exports = invertNegatedOptions;

function invertNegatedOptions(yargs) {
  const opts = yargs.getOptions();

  for (const key of Object.keys(opts.key)) {
    if (key.startsWith("no-")) {
      // --no-foo => inverted --foo
      yargs.option(key.substring(3), {
        hidden: true,
        type: "boolean",
      });
    }
  }

  return yargs;
}
