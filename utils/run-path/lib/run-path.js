"use strict";

const path = require("path");
const pathKey = require("path-key");

module.exports = runPath;

function runPath(pkg) {
  const { rootPath } = pkg;
  const existingPath = process.env[pathKey()];

  let prev;
  let curr = path.resolve(pkg.location);
  const result = [];

  while (prev !== rootPath) {
    result.push(path.join(curr, "node_modules/.bin"));
    prev = curr;
    curr = path.resolve(curr, "..");
  }

  // ensure the running `node` binary is used
  const execPathDir = path.dirname(process.execPath);

  // but only if it isn't already present
  if (existingPath.indexOf(execPathDir) === -1) {
    result.push(execPathDir);
  }

  return result.concat(existingPath).join(path.delimiter);
}
