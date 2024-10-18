import { suite, test } from "@testdeck/mocha";
import { expect } from "chai";
import * as index from "./qr-code.js";

@suite("Index")
export class IndexTest {
  @test("The module should export certain submodules")
  exportsAll() {
    [
      "ErrorCorrectionLevel",
      "Mode",
      "QRCode",
      "QRCodeMinimal",
      "QRUtil",
      "stringToBytes_SJIS",
      "stringToBytes_UTF8"
    ].forEach((moduleName) => expect(Object.keys(index)).to.contain(moduleName));
  }
}
