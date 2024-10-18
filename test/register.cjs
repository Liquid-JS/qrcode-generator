/* eslint-disable @typescript-eslint/no-require-imports */
const { pathToFileURL } = require("url");
const { register } = require("module");
process.env.TS_NODE_PROJECT = "tsconfig.test.json";
register("ts-node/esm", pathToFileURL("./"));

require("source-map-support/register.js");

// Better Set inspection for failed tests

Set.prototype.inspect = function () {
  return `Set { ${Array.from(this.values()).join(", ")} }`;
};
