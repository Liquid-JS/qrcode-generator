import * as index from "./qr-code.js";

describe("Index", () => {
  it.each([
    "ErrorCorrectionLevel",
    "Mode",
    "QRCode",
    "QRCodeMinimal",
    "QRUtil",
    "stringToBytes_SJIS",
    "stringToBytes_UTF8",
  ])("The module should export certain submodules", (moduleName) => {
    expect(Object.keys(index)).toContain(moduleName);
  });
});
