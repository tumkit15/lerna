"use strict";

const log = require("libnpm/log");
const versionCommand = require("@lerna/version/command");

/**
 * @see https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
 */
exports.command = "publish [bump]";

exports.describe = "Publish packages in the current project.";

exports.builder = yargs => {
  const opts = {
    c: {
      describe: "Publish packages after every successful merge using the sha as part of the tag.",
      alias: "canary",
      type: "boolean",
    },
    // preid is copied from ../version/command because a whitelist for one option isn't worth it
    preid: {
      describe: "Specify the prerelease identifier when publishing a prerelease",
      type: "string",
      requiresArg: true,
      defaultDescription: "alpha",
    },
    contents: {
      describe: "Subdirectory to publish. Must apply to ALL packages.",
      type: "string",
      requiresArg: true,
      defaultDescription: ".",
    },
    "dist-tag": {
      describe: "Publish packages with the specified npm dist-tag",
      type: "string",
      requiresArg: true,
    },
    registry: {
      describe: "Use the specified registry for all npm client operations.",
      type: "string",
      requiresArg: true,
    },
    "require-scripts": {
      describe: "Execute ./scripts/prepublish.js and ./scripts/postpublish.js, relative to package root.",
      type: "boolean",
    },
    "no-git-reset": {
      describe: "Do not reset changes to working tree after publishing is complete.",
      type: "boolean",
    },
    "git-reset": {
      // proxy for --no-git-reset
      hidden: true,
      type: "boolean",
    },
    "temp-tag": {
      describe: "Create a temporary tag while publishing.",
      type: "boolean",
    },
    "no-verify": {
      describe: "Do not verify credentials for logged-in npm user.",
      type: "boolean",
    },
    verify: {
      // proxy for --no-verify
      hidden: true,
      type: "boolean",
    },
    // y: {
    //   describe: "Skip all confirmation prompts.",
    //   alias: "yes",
    //   type: "boolean",
    // },
  };

  composeVersionOptions(yargs);

  yargs.options(opts);

  // "unhide" duplicate options
  const { hiddenOptions } = yargs.getOptions();
  const sharedKeys = ["preid", "y"];

  for (const sharedKey of sharedKeys) {
    hiddenOptions.splice(hiddenOptions.findIndex(k => k === sharedKey), 1);
  }

  yargs.group(Object.keys(opts).concat(sharedKeys), "Command Options:");

  return yargs
    .option("npm-tag", {
      // TODO: remove in next major release
      hidden: true,
      conflicts: "dist-tag",
      type: "string",
      requiresArg: true,
    })
    .option("verify-access", {
      // TODO: remove in next major release
      hidden: true,
      conflicts: "verify",
      type: "boolean",
    })
    .option("verify-registry", {
      // TODO: remove in next major release
      hidden: true,
      type: "boolean",
    })
    .option("skip-npm", {
      // TODO: remove in next major release
      // deprecation notice handled in initialize()
      hidden: true,
      type: "boolean",
    })
    .check(argv => {
      /* eslint-disable no-param-reassign */
      if (argv.npmTag) {
        argv.distTag = argv.npmTag;
        argv["dist-tag"] = argv.npmTag;
        delete argv.npmTag;
        delete argv["npm-tag"];
        log.warn("deprecated", "--npm-tag has been renamed --dist-tag");
      }

      if ("verifyAccess" in argv) {
        argv.verify = argv.verifyAccess;
        delete argv.verifyAccess;
        delete argv["verify-access"];
        log.warn("deprecated", "--no-verify-access has been renamed --no-verify");
      }
      /* eslint-enable no-param-reassign */

      return argv;
    });
};

exports.handler = function handler(argv) {
  return require(".")(argv);
};

function composeVersionOptions(yargs) {
  versionCommand.addBumpPositional(yargs, ["from-git", "from-package"]);
  versionCommand.builder(yargs, "publish");

  return yargs;
}
