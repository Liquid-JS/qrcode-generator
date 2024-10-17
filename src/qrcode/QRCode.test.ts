import { QRCode } from "./QRCode.js";

describe("QRCode", function () {
  it("should exist", function () {
    expect(QRCode).toBeTruthy();
  });

  it("should be a callable function", function () {
    expect(QRCode).toBeInstanceOf(Function);
  });

  it("should generate correct GIF image tag", function () {
    const sourceText = "http://www.example.com/ążśźęćńół";
    const correctImgTag =
      '<img src="data:image/gif;base64,R0lGODdhSgBKAIAAAAAAAP///ywAAAAASgBKAAAC/4yPqcvtD6OctNqLs968+w+G4kiWZgKk6roa7ZEiccACco1TeE6r9997uXYsna0xmw0VLyXsyHBCpKijk9qEPh1UrrXYAy4Xu3FtLEmCr9pucP3NGofyN9peBZ7DE3W9Tqd15+fDlxZXiPVlltiGqDb3BpnHRzj4uNgnSHkjZCiZGbXpRVrlyQZINopE9Jc5CdtaeCj7asvIWEvimet4oqkYKDZiCSrMWtobmcW8esfki2exN4XY2cj7aZQtehxIGHwR+41dDg3tdogLCm7N+ZTOOom+irqZGk//DF/vqDiv7cEpTMW4CZxVYSC5gghpOTt46dg4PGxE5aNUkeItje3Drm3zh9DewIytPl7LuBCkHiImpbEjaAvlloTm+DVzJXNftZM89lAz5vLiOZs94YysqZNmtZ8/vQiFeJApmKUPu30qU6mhKola1V0t6g2ZxqcaAK4biraE2axW004LyeNs1loGHfIkGY3uVLV7Ge4rSayvu7WAHQIGGMvn4KqqdLGd2S5xKE2lit2dfIlswJVhU/5VSRmoyEbr9NbdKhqkq156l8GJCFQZ0aRWFcOWGtZ2aN2IN3LlvPv149Kg8UZqi5ElP+JvkyXH+ns4MFnR/+0F/vEw6YDQk//6Dj68+PHky5s/jz69+vULCgAAOw==" width="74" height="74"/>';

    const qr = new QRCode(0, "M");
    qr.addData(unescape(encodeURI(sourceText)));
    qr.make();

    expect(qr.createImgTag()).toEqual(correctImgTag);
  });

  it("should generate correct GIF image data", function () {
    const sourceText = "http://www.example.com/ążśźęćńół";
    const correctImgData =
      "R0lGODdhSgBKAIAAAAAAAP///ywAAAAASgBKAAAC/4yPqcvtD6OctNqLs968+w+G4kiWZgKk6roa7ZEiccACco1TeE6r9997uXYsna0xmw0VLyXsyHBCpKijk9qEPh1UrrXYAy4Xu3FtLEmCr9pucP3NGofyN9peBZ7DE3W9Tqd15+fDlxZXiPVlltiGqDb3BpnHRzj4uNgnSHkjZCiZGbXpRVrlyQZINopE9Jc5CdtaeCj7asvIWEvimet4oqkYKDZiCSrMWtobmcW8esfki2exN4XY2cj7aZQtehxIGHwR+41dDg3tdogLCm7N+ZTOOom+irqZGk//DF/vqDiv7cEpTMW4CZxVYSC5gghpOTt46dg4PGxE5aNUkeItje3Drm3zh9DewIytPl7LuBCkHiImpbEjaAvlloTm+DVzJXNftZM89lAz5vLiOZs94YysqZNmtZ8/vQiFeJApmKUPu30qU6mhKola1V0t6g2ZxqcaAK4biraE2axW004LyeNs1loGHfIkGY3uVLV7Ge4rSayvu7WAHQIGGMvn4KqqdLGd2S5xKE2lit2dfIlswJVhU/5VSRmoyEbr9NbdKhqkq156l8GJCFQZ0aRWFcOWGtZ2aN2IN3LlvPv149Kg8UZqi5ElP+JvkyXH+ns4MFnR/+0F/vEw6YDQk//6Dj68+PHky5s/jz69+vULCgAAOw==";

    const qr = new QRCode(0, "M");
    qr.addData(unescape(encodeURI(sourceText)));
    qr.make();

    const data = Buffer.from(
      qr.toDataURL().replace("data:image/gif;base64,", ""),
      "base64",
    );

    expect(data.toString("base64")).toEqual(correctImgData);
  });

  it("should generate correct UTF8 text data", function () {
    const sourceText = "http://www.example.com/ążśźęćńół";
    const correctTextData1 = [
      "█████████████████████████████████",
      "██ ▄▄▄▄▄ █ ▄█▀▄██ ▀▄ ▄██ ▄▄▄▄▄ ██",
      "██ █   █ █▀ █▀▄█▀▀█▄▄ ▄█ █   █ ██",
      "██ █▄▄▄█ ███ ▀ █▄▀▄▄▀ ▀█ █▄▄▄█ ██",
      "██▄▄▄▄▄▄▄█ ▀▄█▄▀▄▀ █▄▀▄█▄▄▄▄▄▄▄██",
      "██▄█  ▀▄▄▄█▄▄█▀█▀▀▄█▀▀▀█ ▀▀▄█▄ ██",
      "██▀▀▄▀▄█▄█  ▄▄█▄ ▄█  ███ ▀█▀▄▄▀██",
      "██ ▄▀█▄▀▄  ▄▀▄ █ ▄▀▀█▀██▀██▄▄▀▀██",
      "██  █▀ ▄▄▀▀ ▀█    █▀▄ ▀█▄▀▄▄▄ ▄██",
      "██▄██ ▄▄▄▄▄█   ▀▄▄ ▀▀▄▄▄█▄▄█▀ ███",
      "██▄█▄██▄▄▄ █ █▄▄▀█▀███▄▀▄▄█▄ ████",
      "███▄▄██▄▄▄ ▀▀▄█ █▀ █ ▄ ▄▄▄   ▀▀██",
      "██ ▄▄▄▄▄ █ █ ▀█▄█ ▀  ▄ █▄█ ▄█ ▀██",
      "██ █   █ █▀▄▄ ▄▀ ▀▄█ █  ▄▄   ▄ ██",
      "██ █▄▄▄█ █▄█▄▀█ ▀ ▀ ██  █ █▀▄▀▄██",
      "██▄▄▄▄▄▄▄█▄▄█▄█▄███▄▄▄▄████▄█▄███",
      "▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀",
    ].join("\n");

    const correctTextData2 = [
      " ▄▄▄▄▄ █ ▄█▀▄██ ▀▄ ▄██ ▄▄▄▄▄ ",
      " █   █ █▀ █▀▄█▀▀█▄▄ ▄█ █   █ ",
      " █▄▄▄█ ███ ▀ █▄▀▄▄▀ ▀█ █▄▄▄█ ",
      "▄▄▄▄▄▄▄█ ▀▄█▄▀▄▀ █▄▀▄█▄▄▄▄▄▄▄",
      "▄█  ▀▄▄▄█▄▄█▀█▀▀▄█▀▀▀█ ▀▀▄█▄ ",
      "▀▀▄▀▄█▄█  ▄▄█▄ ▄█  ███ ▀█▀▄▄▀",
      " ▄▀█▄▀▄  ▄▀▄ █ ▄▀▀█▀██▀██▄▄▀▀",
      "  █▀ ▄▄▀▀ ▀█    █▀▄ ▀█▄▀▄▄▄ ▄",
      "▄██ ▄▄▄▄▄█   ▀▄▄ ▀▀▄▄▄█▄▄█▀ █",
      "▄█▄██▄▄▄ █ █▄▄▀█▀███▄▀▄▄█▄ ██",
      "█▄▄██▄▄▄ ▀▀▄█ █▀ █ ▄ ▄▄▄   ▀▀",
      " ▄▄▄▄▄ █ █ ▀█▄█ ▀  ▄ █▄█ ▄█ ▀",
      " █   █ █▀▄▄ ▄▀ ▀▄█ █  ▄▄   ▄ ",
      " █▄▄▄█ █▄█▄▀█ ▀ ▀ ██  █ █▀▄▀▄",
      "       ▀  ▀ ▀ ▀▀▀    ▀▀▀▀ ▀ ▀",
    ].join("\n");

    const correctTextData3 = [
      "██████████████████████████████████████████████████████████████████",
      "██████████████████████████████████████████████████████████████████",
      "████              ██    ████  ████  ██      ████              ████",
      "████  ██████████  ██  ████  ██████    ██  ██████  ██████████  ████",
      "████  ██      ██  ████  ████  ████████        ██  ██      ██  ████",
      "████  ██      ██  ██    ██  ████    ██████  ████  ██      ██  ████",
      "████  ██      ██  ██████  ██  ██  ██    ██  ████  ██      ██  ████",
      "████  ██████████  ██████      ████  ████      ██  ██████████  ████",
      "████              ██  ██  ██  ██  ██  ██  ██  ██              ████",
      "████████████████████    ██████  ██    ████  ██████████████████████",
      "████  ██    ██      ██    ██████████  ██████████  ████  ██    ████",
      "████████      ██████████████  ██    ████      ██      ██████  ████",
      "████████  ██  ██  ██        ██      ██    ██████  ██████    ██████",
      "████    ██  ████████    ████████  ████    ██████    ██  ████  ████",
      "████    ████  ██        ██    ██    ██████████████████    ████████",
      "████  ██  ████  ██    ██  ██  ██  ██    ██  ████  ████████    ████",
      "████    ████      ████  ████        ████    ████  ██          ████",
      "████    ██    ████        ██        ██  ██    ████  ██████  ██████",
      "████  ████            ██      ██      ████      ██    ████  ██████",
      "██████████  ████████████        ████      ██████████████    ██████",
      "████  ██  ████        ██  ██    ████████████  ██    ██    ████████",
      "████████████████████  ██  ██████  ██  ████████  ████████  ████████",
      "██████    ████        ████  ██  ████  ██                  ████████",
      "████████████████████      ████  ██    ██  ██  ██████          ████",
      "████              ██  ██  ████  ██  ██        ██  ██    ██  ██████",
      "████  ██████████  ██  ██    ██████        ██  ██████  ████    ████",
      "████  ██      ██  ████        ██  ██  ██  ██                  ████",
      "████  ██      ██  ██  ████  ██      ████  ██    ████      ██  ████",
      "████  ██      ██  ██  ██  ████  ██  ██  ████    ██  ████  ██  ████",
      "████  ██████████  ████████  ██          ████    ██  ██  ██  ██████",
      "████              ██    ██  ██  ██████        ████████  ██  ██████",
      "██████████████████████████████████████████████████████████████████",
      "██████████████████████████████████████████████████████████████████",
    ].join("\n");

    const qr = new QRCode(0, "M");
    qr.addData(unescape(encodeURI(sourceText)));
    qr.make();

    expect(qr.createASCII()).toEqual(correctTextData1);
    expect(qr.createASCII(1, 0)).toEqual(correctTextData2);
    expect(qr.createASCII(2)).toEqual(correctTextData3);
  });
});
