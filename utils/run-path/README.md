# `@lerna/run-path`

> Like [npm-run-path][], but for Lerna

## Install

```
$ npm install --save-dev @lerna/run-path
```

## Usage

Unlike [npm-run-path][], this package only accepts [Package][] instances and does not provide the `.env()` named export.

```js
const Package = require("@lerna/package");
const runPath = require("@lerna/run-path");

console.log(process.env.PATH);
//=> '/usr/local/bin'

console.log(process.cwd());
//=> '$MONOREPO_ROOT'

const fooPkg = Package.lazy("packages/foo");
console.log(runPath(fooPkg));
//=> '$MONOREPO_ROOT/packages/foo/node_modules/.bin:$MONOREPO_ROOT/packages/node_modules/.bin:$MONOREPO_ROOT/node_modules/.bin:/usr/local/bin'
```

[npm-run-path]: https://github.com/sindresorhus/npm-run-path#readme
[package]: https://github.com/lerna/lerna/tree/master/core/package#readme
