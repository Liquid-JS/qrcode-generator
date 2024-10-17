import { Base64 } from "../io/Base64.js";
import { ByteArrayOutputStream } from "../io/ByteArrayOutputStream.js";
import { OutputStream } from "../io/OutputStream.js";

/**
 * GIF Image (B/W)
 * @author Kazuhiko Arase
 */
export class GIFImage {
  private width: number;
  private height: number;
  private data: number[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const size = width * height;
    this.data = [];
    for (let i = 0; i < size; i += 1) {
      this.data.push(0);
    }
  }

  public setPixel(x: number, y: number, pixel: number): void {
    if (x < 0 || this.width <= x) throw "!" + x;
    if (y < 0 || this.height <= y) throw "!" + y;
    this.data[y * this.width + x] = pixel;
  }

  public getPixel(x: number, y: number): number {
    if (x < 0 || this.width <= x) throw "!" + x;
    if (y < 0 || this.height <= y) throw "!" + y;
    return this.data[y * this.width + x];
  }

  public write(out: OutputStream): void {
    //---------------------------------
    // GIF Signature

    out.writeByte("G".charCodeAt(0));
    out.writeByte("I".charCodeAt(0));
    out.writeByte("F".charCodeAt(0));
    out.writeByte("8".charCodeAt(0));
    out.writeByte("7".charCodeAt(0));
    out.writeByte("a".charCodeAt(0));

    //---------------------------------
    // Screen Descriptor

    this.writeWord(out, this.width);
    this.writeWord(out, this.height);

    out.writeByte(0x80); // 2bit
    out.writeByte(0);
    out.writeByte(0);

    //---------------------------------
    // Global Color Map

    // black
    out.writeByte(0x00);
    out.writeByte(0x00);
    out.writeByte(0x00);

    // white
    out.writeByte(0xff);
    out.writeByte(0xff);
    out.writeByte(0xff);

    //---------------------------------
    // Image Descriptor

    out.writeByte(",".charCodeAt(0));
    this.writeWord(out, 0);
    this.writeWord(out, 0);
    this.writeWord(out, this.width);
    this.writeWord(out, this.height);
    out.writeByte(0);

    //---------------------------------
    // Local Color Map

    //---------------------------------
    // Raster Data

    const lzwMinCodeSize = 2;
    const raster = this.getLZWRaster(lzwMinCodeSize);

    out.writeByte(lzwMinCodeSize);

    let offset: number = 0;

    while (raster.length - offset > 255) {
      out.writeByte(255);
      this.writeBytes(out, raster, offset, 255);
      offset += 255;
    }

    out.writeByte(raster.length - offset);
    this.writeBytes(out, raster, offset, raster.length - offset);
    out.writeByte(0x00);

    //---------------------------------
    // GIF Terminator
    out.writeByte(";".charCodeAt(0));
  }

  private getLZWRaster(lzwMinCodeSize: number): number[] {
    const clearCode = 1 << lzwMinCodeSize;
    const endCode = (1 << lzwMinCodeSize) + 1;
    let bitLength = lzwMinCodeSize + 1;

    // Setup LZWTable
    const table = new LZWTable();

    for (let i = 0; i < clearCode; i += 1) {
      table.add(String.fromCharCode(i));
    }
    table.add(String.fromCharCode(clearCode));
    table.add(String.fromCharCode(endCode));

    const byteOut = new ByteArrayOutputStream();
    const bitOut = new BitOutputStream(byteOut);

    try {
      // clear code
      bitOut.write(clearCode, bitLength);

      let dataIndex = 0;
      let s = String.fromCharCode(this.data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < this.data.length) {
        const c = String.fromCharCode(this.data[dataIndex]);
        dataIndex += 1;
        if (table.contains(s + c)) {
          s = s + c;
        } else {
          bitOut.write(table.indexOf(s), bitLength);
          if (table.getSize() < 0xfff) {
            if (table.getSize() == 1 << bitLength) {
              bitLength += 1;
            }
            table.add(s + c);
          }
          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);
    } finally {
      bitOut.close();
    }

    return byteOut.toByteArray();
  }

  private writeWord(out: OutputStream, i: number) {
    out.writeByte(i & 0xff);
    out.writeByte((i >>> 8) & 0xff);
  }

  private writeBytes(
    out: OutputStream,
    bytes: number[],
    off: number,
    len: number,
  ) {
    for (let i = 0; i < len; i += 1) {
      out.writeByte(bytes[i + off]);
    }
  }

  public toDataURL(): string {
    const bout = new ByteArrayOutputStream();
    this.write(bout);
    bout.close();
    let s = "";
    const bytes = Base64.encode(bout.toByteArray());
    for (let i = 0; i < bytes.length; i += 1) {
      s += String.fromCharCode(bytes[i]);
    }
    return "data:image/gif;base64," + s;
  }
}

class LZWTable {
  private map: { [key: string]: number } = {};
  private size: number = 0;

  constructor() {}

  public add(key: string): void {
    if (this.contains(key)) {
      throw "dup key:" + key;
    }
    this.map[key] = this.size;
    this.size += 1;
  }

  public getSize(): number {
    return this.size;
  }

  public indexOf(key: string): number {
    return this.map[key];
  }

  public contains(key: string): boolean {
    return typeof this.map[key] != "undefined";
  }
}

class BitOutputStream {
  private out: OutputStream;
  private bitLength: number;
  private bitBuffer: number = 0;

  constructor(out: OutputStream) {
    this.out = out;
    this.bitLength = 0;
  }

  public write(data: number, length: number): void {
    if (data >>> length != 0) {
      throw "length over";
    }

    while (this.bitLength + length >= 8) {
      this.out.writeByte(0xff & ((data << this.bitLength) | this.bitBuffer));
      length -= 8 - this.bitLength;
      data >>>= 8 - this.bitLength;
      this.bitBuffer = 0;
      this.bitLength = 0;
    }

    this.bitBuffer = (data << this.bitLength) | this.bitBuffer;
    this.bitLength = this.bitLength + length;
  }

  public flush(): void {
    if (this.bitLength > 0) {
      this.out.writeByte(this.bitBuffer);
    }
    this.out.flush();
  }

  public close(): void {
    this.flush();
    this.out.close();
  }
}
