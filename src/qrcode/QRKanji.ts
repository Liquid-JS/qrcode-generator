import { BitBuffer } from "./BitBuffer.js";
import { Mode } from "./Mode.js";
import { QRData } from "./QRData.js";

/**
 * QRKanji(SJIS only)
 * @author Kazuhiko Arase
 */
export class QRKanji extends QRData {
  constructor(
    data: string,
    private stringToBytes: (s: string) => number[],
  ) {
    super(Mode.MODE_KANJI, data);
  }

  public write(buffer: BitBuffer): void {
    const data = this.stringToBytes(this.getData());

    let i = 0;

    while (i + 1 < data.length) {
      let c = ((0xff & data[i]) << 8) | (0xff & data[i + 1]);

      if (0x8140 <= c && c <= 0x9ffc) {
        c -= 0x8140;
      } else if (0xe040 <= c && c <= 0xebbf) {
        c -= 0xc140;
      } else {
        throw "illegal char at " + (i + 1) + "/" + c;
      }

      c = ((c >>> 8) & 0xff) * 0xc0 + (c & 0xff);

      buffer.put(c, 13);

      i += 2;
    }

    if (i < data.length) {
      throw "illegal char at " + (i + 1);
    }
  }

  public getLength(): number {
    return this.stringToBytes(this.getData()).length / 2;
  }
}
