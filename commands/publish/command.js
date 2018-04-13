"use strict";

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

const cdVersionOptions = ["major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease"];
const cdVersionOptionString = `'${cdVersionOptions.slice(0, -1).join("', '")}', or '${
  cdVersionOptions[cdVersionOptions.length - 1]
}'.`;

// TODO: share only relevant options with `lerna changed`
const opts = {
  "allow-branch": {
    describe: "Specify which branches to allow publishing from.",
    type: "array",
  },
  canary: {
    defaultDescription: "alpha",
    describe: "Publish packages after every successful merge using the sha as part of the tag.",
    alias: "c",
    // NOTE: this type must remain undefined, as it is too overloaded to make sense
    // type: "string",
  },
  "cd-version": {
    describe: `Skip the version selection prompt and increment semver: ${cdVersionOptionString}`,
    type: "string",
    requiresArg: true,
    coerce: choice => {
      if (cdVersionOptions.indexOf(choice) === -1) {
        throw new Error(`--cd-version must be one of: ${cdVersionOptionString}`);
      }
      return choice;
    },
  },
  "conventional-commits": {
    describe: "Use angular conventional-commit format to determine version bump and generate CHANGELOG.",
    type: "boolean",
  },
  "changelog-preset": {
    describe: "Use another conventional-changelog preset rather than angular.",
    type: "string",
  },
  exact: {
    describe: "Specify cross-dependency version numbers exactly rather than with a caret (^).",
    type: "boolean",
  },
  "git-remote": {
    defaultDescription: "origin",
    describe: "Push git changes to the specified remote instead of 'origin'.",
    type: "string",
    requiresArg: true,
  },
  "ignore-changes": {
    describe: "Ignore changes in files matched by glob(s).",
    type: "array",
  },
  message: {
    describe: "Use a custom commit message when creating the publish commit.",
    alias: "m",
    type: "string",
    requiresArg: true,
  },
  amend: {
    describe: "Amend the existing commit, instead of generating a new one.",
    type: "boolean",
  },
  "npm-tag": {
    describe: "Publish packages with the specified npm dist-tag",
    type: "string",
    requiresArg: true,
  },
  "npm-client": {
    describe: "Executable used to publish dependencies (npm, yarn, pnpm, ...)",
    defaultDescription: "npm",
    type: "string",
    requiresArg: true,
  },
  registry: {
    describe: "Use the specified registry for all npm client operations.",
    type: "string",
    requiresArg: true,
  },
  preid: {
    describe: "Specify the prerelease identifier (major.minor.patch-pre).",
    type: "string",
    requiresArg: true,
  },
  "repo-version": {
    describe: "Specify repo version to publish.",
    type: "string",
    requiresArg: true,
  },
  "skip-git": {
    describe: "Skip commiting, tagging, and pushing git changes.",
    type: "boolean",
  },
  "skip-npm": {
    describe: "Stop before actually publishing change to npm.",
    type: "boolean",
  },
  "temp-tag": {
    describe: "Create a temporary tag while publishing.",
    type: "boolean",
  },
  yes: {
    describe: "Skip all confirmation prompts.",
    type: "boolean",
  },
};

const spec = getSpec(opts);

/**
 * @see https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
 */
exports.command = "publish";

exports.describe = "Publish packages in the current project";

exports.builder = yargs =>
  yargs
    .options(opts)
    .group(Object.keys(opts), "Command Options:")
    .option("ignore", {
      // NOT the same as filter-options --ignore
      hidden: true,
      conflicts: "ignore-changes",
      type: "array",
    })
    .check(argv => {
      if (argv.ignore) {
        /* eslint-disable no-param-reassign */
        argv.ignoreChanges = argv.ignore;
        delete argv.ignore;
        /* eslint-enable no-param-reassign */
      }

      return argv;
    });

exports.builder.spec = spec;

exports.handler = function handler(argv) {
  return require(".")(argv, spec);
};
