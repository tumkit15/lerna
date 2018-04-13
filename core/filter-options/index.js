"use strict";

const dedent = require("dedent");

// FIXME: extract util
const camelize = str => str.replace(/-(\w)/g, (m, p1) => p1.toUpperCase());
const getSpec = yargsOptions =>
  Object.keys(yargsOptions).reduce((obj, key) => {
    const cfg = yargsOptions[key];

    obj[key] = {};

    if (cfg.defaultDescription && cfg.type) {
      // default descriptions _without_ type must _remain_ undefined
      obj[key].default = cfg.type === "boolean" ? JSON.parse(cfg.defaultDescription) : cfg.defaultDescription;
    } else if (cfg.default) {
      // propagate explicit defaults
      obj[key].default = cfg.default;
    } else if (cfg.type === "array") {
      // yargs does this, but why not
      obj[key].default = [];
    }

    if (key.indexOf("-") > -1) {
      // back-compat for durable camelOptions
      const ref = camelize(key);

      obj[ref] = obj[key];
      obj[key] = ref;
    }

    return obj;
  }, {});

module.exports = filterOptions;

// Only for 'run', 'exec', 'clean', 'ls', and 'bootstrap' commands
const opts = {
  scope: {
    describe: "Include only packages with names matching the given glob.",
    type: "string",
  },
  ignore: {
    describe: "Exclude packages with names matching the given glob.",
    type: "string",
  },
  private: {
    describe: "Include private packages. Pass --no-private to exclude private packages.",
    type: "boolean",
    default: true,
  },
  since: {
    describe: dedent`
      Only include packages that have been updated since the specified [ref].
      If no ref is passed, it defaults to the most-recent tag.
    `,
    type: "string",
  },
  "include-filtered-dependents": {
    describe: dedent`
      Include all transitive dependents when running a command
      regardless of --scope, --ignore, or --since.
    `,
    type: "boolean",
  },
  "include-filtered-dependencies": {
    describe: dedent`
      Include all transitive dependencies when running a command
      regardless of --scope, --ignore, or --since.
    `,
    type: "boolean",
  },
};

filterOptions.keys = Object.keys(opts);

filterOptions.spec = getSpec(opts);

function filterOptions(yargs) {
  return yargs.options(opts).group(filterOptions.keys, "Filter Options:");
}
