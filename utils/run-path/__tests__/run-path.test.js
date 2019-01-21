"use strict";

const path = require("path");
const pathKey = require("path-key");
const Package = require("@lerna/package");
const runPath = require("..");

describe("@lerna/run-path", () => {
  const processExecPath = process.execPath;
  const processEnvPath = process.env[pathKey()];

  beforeEach(() => {
    process.execPath = "/some/path/to/bin/node";
    process.env[pathKey()] = ["/path/to/other/bin", "/some/path/to/bin"].join(path.delimiter);
  });

  afterEach(() => {
    process.execPath = processExecPath;
    process.env[pathKey()] = processEnvPath;
  });

  it("builds a path from the leaf directory to the root", () => {
    const pkg = new Package({ name: "pkg-1" }, "/home/test/packages/pkg-1", "/home/test");
    const result = runPath(pkg);

    expect(result.split(path.delimiter)).toEqual([
      "/home/test/packages/pkg-1/node_modules/.bin",
      "/home/test/packages/node_modules/.bin",
      "/home/test/node_modules/.bin",
      "/path/to/other/bin",
      "/some/path/to/bin",
    ]);
  });

  it("only prepends execPath if it is missing in PATH", () => {
    process.env[pathKey()] = "/path/to/other/bin";

    const pkg = new Package({ name: "pkg-2" }, "/home/test/packages/pkg-2", "/home/test");
    const result = runPath(pkg);

    expect(result.split(path.delimiter)).toEqual([
      "/home/test/packages/pkg-2/node_modules/.bin",
      "/home/test/packages/node_modules/.bin",
      "/home/test/node_modules/.bin",
      "/some/path/to/bin",
      "/path/to/other/bin",
    ]);
  });
});
