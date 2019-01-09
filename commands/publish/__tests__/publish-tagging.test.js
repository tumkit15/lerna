"use strict";

// local modules _must_ be explicitly mocked
jest.mock("../lib/get-packages-without-license");
jest.mock("../lib/verify-npm-package-access");
jest.mock("../lib/get-npm-username");
// FIXME: better mock for version command
jest.mock("../../version/lib/git-push");
jest.mock("../../version/lib/is-anything-committed");
jest.mock("../../version/lib/is-behind-upstream");
jest.mock("../../version/lib/remote-branch-exists");

// mocked modules
const collectUpdates = require("@lerna/collect-updates");
const npmDistTag = require("@lerna/npm-dist-tag");
const npmPublish = require("@lerna/npm-publish");

// helpers
const initFixture = require("@lerna-test/init-fixture")(__dirname);

// test command
const lernaPublish = require("@lerna-test/command-runner")(require("../command"));

test("publish --dist-tag next", async () => {
  const cwd = await initFixture("normal");

  collectUpdates.setUpdated(cwd, "package-1");

  await lernaPublish(cwd)("--dist-tag", "next");

  expect(npmDistTag.add.tagged()).toEqual(["next"]);
});

test("publish --dist-tag nightly --canary", async () => {
  const cwd = await initFixture("normal");

  collectUpdates.setUpdated(cwd, "package-2");

  await lernaPublish(cwd)("--dist-tag", "nightly", "--canary");

  expect(npmDistTag.add.tagged()).toEqual(["nightly"]);
});

test("publish --npm-tag deprecated", async () => {
  const cwd = await initFixture("normal");

  collectUpdates.setUpdated(cwd, "package-3");

  await lernaPublish(cwd)("--npm-tag", "deprecated");

  expect(npmDistTag.add.tagged()).toEqual(["deprecated"]);
});

test("publish (pkg.publishConfig.tag)", async () => {
  const cwd = await initFixture("integration");

  await lernaPublish(cwd)();

  expect(npmPublish.registry).toMatchInlineSnapshot(`
Map {
  "@integration/package-1" => "lerna-temp",
  "@integration/package-2" => "lerna-temp",
}
`);
  expect(npmDistTag.add.registry).toMatchInlineSnapshot(`
Map {
  "@integration/package-1@1.0.1" => "CUSTOM",
  "@integration/package-2@1.0.1" => "latest",
}
`);
});

test("publish (pkg.publishConfig.tag) --dist-tag beta", async () => {
  const cwd = await initFixture("integration");

  await lernaPublish(cwd)("--dist-tag", "beta");

  expect(npmDistTag.add.registry).toMatchInlineSnapshot(`
Map {
  "@integration/package-1@1.0.1" => "beta",
  "@integration/package-2@1.0.1" => "beta",
}
`);
});

test("publish --no-temp-tag", async () => {
  const cwd = await initFixture("integration");

  await lernaPublish(cwd)("--no-temp-tag");

  expect(npmPublish.registry).toMatchInlineSnapshot(`
Map {
  "@integration/package-1" => "CUSTOM",
  "@integration/package-2" => "latest",
}
`);
  expect(npmDistTag.remove).not.toHaveBeenCalled();
  expect(npmDistTag.add).not.toHaveBeenCalled();
});
