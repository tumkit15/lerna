"use strict";

const factory = require("yargs/yargs");
const invertNegatedOptions = require("..");

describe("@lerna/invert-negated-options", () => {
  it("works with simple CLI", () => {
    const parser = factory();
    setup(parser);

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

    expect(parser.parse(["--foo", "--bar"])).toMatchObject({
      foo: true,
      bar: true,
    });
    expect(parser.parse(["--foo", "--no-bar"])).toMatchObject({
      foo: true,
      bar: false,
    });
    expect(parser.parse(["--no-foo"])).toMatchObject({
      foo: false,
    });
    expect(parser.parse(["--foo"])).toMatchObject({
      foo: true,
    });
  });

  it("works from subcommand", () => {
    const parser = factory();
    setup(parser);

    parser.options({
      "no-baz": {
        describe: "Do not allow baz",
        type: "boolean",
      },
    });

    parser.command(
      "test",
      "decorate subcommand children",
      innerYargs => {
        invertNegatedOptions(innerYargs).option("no-qux", {
          describe: "Do not allow qux",
          type: "boolean",
        });
      },
      // no-op handler
      () => {}
    );

    expect(parser.parse(["test", "--no-baz", "--no-qux"])).toMatchObject({
      baz: false,
      qux: false,
    });
  });

  it("does not work post-hoc with .strict()", () => {
    const parser = factory();
    setup(parser);

    // configure this first (to simulate command nesting)
    parser.strict();

    invertNegatedOptions(parser);

    // subsequent additions will fail
    parser.options({
      "no-strict": {
        describe: "strict is not compatible with post-hoc inversion",
        type: "boolean",
      },
    });

    try {
      parser
        .fail(msg => {
          // re-throw during custom .fail() to avoid stderr logging
          throw new Error(msg);
        })
        .parse(["--no-strict"]);
    } catch (err) {
      expect(err.message).toMatch("Unknown argument: strict");
    }

    expect.assertions(1);
  });
});

// make yargs instance suitable for unit tests
function setup(parser) {
  return parser
    .exitProcess(false)
    .detectLocale(false)
    .showHelpOnFail(false)
    .wrap(null);
}

/*
function run(parser) {
  return (...args) =>
    new Promise((resolve, reject) => {
      parser
        .fail((msg, err) => {
          reject(err || new Error(msg));
        })
        .parse(args, (err, argv, stdout) => {
          resolve({ argv, stdout });
        });
    });
}
*/
