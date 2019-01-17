"use strict";

const dedent = require("dedent");
const getFilteredPackages = require("./lib/get-filtered-packages");

module.exports = filterOptions;
module.exports.getFilteredPackages = getFilteredPackages;

function filterOptions(yargs) {
  // Only for 'run', 'exec', 'clean', 'ls', and 'bootstrap' commands
  const opts = {
    include: {
      describe: "Include only packages with names matching the given glob.",
      type: "string",
    },
    exclude: {
      describe: "Exclude packages with names matching the given glob.",
      type: "string",
    },
    "no-private": {
      describe: 'Exclude packages with { "private": true } in their package.json.',
      type: "boolean",
    },
    private: {
      // proxy for --no-private
      hidden: true,
      type: "boolean",
    },
    since: {
      describe: dedent`
        Only include packages that have been updated since the specified [ref].
        If no ref is passed, it defaults to the most-recent tag.
      `,
      type: "string",
    },
    "with-dependents": {
      describe: dedent`
        Include all transitive dependents regardless of --include, --exclude, or --since.
      `,
      type: "boolean",
    },
    "with-dependencies": {
      describe: dedent`
        Include all transitive dependencies regardless of --include, --exclude, or --since.
      `,
      type: "boolean",
    },
  };

  return yargs
    .options(opts)
    .group(Object.keys(opts), "Filter Options:")
    .options({
      // back-compat
      scope: {
        hidden: true,
        conflicts: "include",
        type: "string",
      },
      ignore: {
        hidden: true,
        conflicts: "exclude",
        type: "string",
      },
      "include-filtered-dependents": {
        hidden: true,
        conflicts: "with-dependents",
        type: "boolean",
      },
      "include-filtered-dependencies": {
        hidden: true,
        conflicts: "with-dependencies",
        type: "boolean",
      },
    })
    .check(argv => {
      /* eslint-disable no-param-reassign */
      if (argv.scope) {
        argv.include = [].concat(argv.scope);
        delete argv.scope;
      }

      if (argv.ignore) {
        argv.exclude = [].concat(argv.ignore);
        delete argv.ignore;
      }

      if (argv.includeFilteredDependents) {
        argv.withDependents = true;
        argv["with-dependents"] = true;
        delete argv.includeFilteredDependents;
        delete argv["include-filtered-dependents"];
      }

      if (argv.includeFilteredDependencies) {
        argv.withDependencies = true;
        argv["with-dependencies"] = true;
        delete argv.includeFilteredDependencies;
        delete argv["include-filtered-dependencies"];
      }
      /* eslint-enable no-param-reassign */

      return argv;
    });
}
