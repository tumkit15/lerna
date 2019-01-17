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
const runLifecycle = require("@lerna/run-lifecycle");
const loadJsonFile = require("load-json-file");

// helpers
const initFixture = require("@lerna-test/init-fixture")(__dirname);

// test command
const lernaPublish = require("@lerna-test/command-runner")(require("../command"));

describe("lifecycle scripts", () => {
  const npmLifecycleEvent = process.env.npm_lifecycle_event;

  afterEach(() => {
    process.env.npm_lifecycle_event = npmLifecycleEvent;
  });

  it("calls publish lifecycle scripts for root and packages", async () => {
    const cwd = await initFixture("lifecycle");

    await lernaPublish(cwd)();

    ["prepare", "prepublishOnly", "prepack", "postpack", "postpublish"].forEach(script => {
      // "lifecycle" is the root manifest name
      expect(runLifecycle).toHaveBeenCalledWith(expect.objectContaining({ name: "lifecycle" }), script);
    });

    // package-2 lacks version lifecycle scripts
    expect(runLifecycle).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: "package-2" }),
      expect.any(String)
    );

    expect(runLifecycle.getOrderedCalls()).toEqual([
      // TODO: separate from VersionCommand details
      ["lifecycle", "preversion"],
      ["package-1", "preversion"],
      ["package-1", "version"],
      ["lifecycle", "version"],
      ["package-1", "postversion"],
      ["lifecycle", "postversion"],
      // publish-specific
      ["lifecycle", "prepublish"],
      ["lifecycle", "prepare"],
      ["lifecycle", "prepublishOnly"],
      ["lifecycle", "prepack"],
      ["lifecycle", "postpack"],
      ["lifecycle", "postpublish"],
    ]);

    expect(loadJsonFile.registry).toMatchInlineSnapshot(`
Map {
  "/packages/package-1" => 3,
  "/packages/package-2" => 3,
}
`);
  });

  it("does not execute recursive root scripts", async () => {
    const cwd = await initFixture("lifecycle");

    process.env.npm_lifecycle_event = "prepublish";

    await lernaPublish(cwd)();

    expect(runLifecycle.getOrderedCalls()).toEqual([
      // TODO: separate from VersionCommand details
      ["lifecycle", "preversion"],
      ["package-1", "preversion"],
      ["package-1", "version"],
      ["lifecycle", "version"],
      ["package-1", "postversion"],
      ["lifecycle", "postversion"],
      // publish-specific
      ["lifecycle", "prepare"],
      ["lifecycle", "prepublishOnly"],
      ["lifecycle", "prepack"],
      ["lifecycle", "postpack"],
    ]);
  });
});
