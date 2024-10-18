import { QRMath } from "./QRMath.js";

/**
 * Polynomial
 * @author Kazuhiko Arase
 */
export class Polynomial {
  private num: number[];

  public constructor(num: number[], shift = 0) {
    let offset = 0;

    while (offset < num.length && num[offset] == 0) {
      offset += 1;
    }

    this.num = [];
    const len = num.length - offset;
    for (let i = 0; i < len; i += 1) {
      this.num.push(num[offset + i]);
    }
    for (let i = 0; i < shift; i += 1) {
      this.num.push(0);
    }
  }

  public getAt(index: number): number {
    return this.num[index];
  }

  public getLength(): number {
    return this.num.length;
  }

  public toString(): string {
    let buffer = "";
    for (let i = 0; i < this.getLength(); i += 1) {
      if (i > 0) {
        buffer += ",";
      }
      buffer += this.getAt(i);
    }
    return buffer.toString();
  }

  public toLogString(): string {
    let buffer = "";
    for (let i = 0; i < this.getLength(); i += 1) {
      if (i > 0) {
        buffer += ",";
      }
      buffer += QRMath.glog(this.getAt(i));
    }
    return buffer.toString();
  }

  public multiply(e: Polynomial): Polynomial {
    const num: number[] = [];
    const len = this.getLength() + e.getLength() - 1;
    for (let i = 0; i < len; i += 1) {
      num.push(0);
    }
    for (let i = 0; i < this.getLength(); i += 1) {
      for (let j = 0; j < e.getLength(); j += 1) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.getAt(i)) + QRMath.glog(e.getAt(j)));
      }
    }
    return new Polynomial(num);
  }

  public mod(e: Polynomial): Polynomial {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }

    const ratio = QRMath.glog(this.getAt(0)) - QRMath.glog(e.getAt(0));

    // create copy
    const num: number[] = [];
    for (let i = 0; i < this.getLength(); i += 1) {
      num.push(this.getAt(i));
    }

    // subtract and calc rest.
    for (let i = 0; i < e.getLength(); i += 1) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
    }

    // call recursively
    return new Polynomial(num).mod(e);
  }
}
