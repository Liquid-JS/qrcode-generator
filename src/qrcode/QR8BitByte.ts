import { BitBuffer } from "./BitBuffer.js";
import { Mode } from "./Mode.js";
import { QRData } from "./QRData.js";

/**
 * QR8BitByte
 * @author Kazuhiko Arase
 */
export class QR8BitByte extends QRData {
  constructor(
    data: string,
    private stringToBytes: (s: string) => number[],
  ) {
    super(Mode.MODE_8BIT_BYTE, data);
  }

  public write(buffer: BitBuffer): void {
    const data = this.stringToBytes(this.getData());
    for (let i = 0; i < data.length; i += 1) {
      buffer.put(data[i], 8);
    }
  }

  public getLength(): number {
    return this.stringToBytes(this.getData()).length;
  }
}