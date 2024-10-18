import { BitBuffer } from "./BitBuffer.js";
import { ErrorCorrectLevel } from "./ErrorCorrectLevel.js";
import { Polynomial } from "./Polynomial.js";
import { QR8BitByte } from "./QR8BitByte.js";
import { QRAlphaNum } from "./QRAlphaNum.js";
import { QRData } from "./QRData.js";
import { QRKanji } from "./QRKanji.js";
import { QRNumber } from "./QRNumber.js";
import { QRUtil } from "./QRUtil.js";
import { RSBlock } from "./RSBlock.js";

type TypeNumber =
  | 0 // Automatic type number
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40;

const TypeNumber = Array(41)
  .fill(0)
  .map((_, i) => i) as unknown as {
  [P in TypeNumber]: P;
};

export { TypeNumber };

export enum ErrorCorrectionLevel {
  L = "L",
  M = "M",
  Q = "Q",
  H = "H"
}

export enum Mode {
  numeric = "numeric",
  alphanumeric = "alphanumeric",
  /**
   * Default
   */
  byte = "byte",
  kanji = "kanji",
  unicode = "unicode"
}

/**
 * QRCode
 * @author Kazuhiko Arase
 */
export class QRCodeMinimal {
  private static PAD0 = 0xec;

  private static PAD1 = 0x11;

  private typeNumber: number;

  private errorCorrectLevel: ErrorCorrectLevel;

  private qrDataList: QRData[];

  private modules: (boolean | null)[][] = [];

  private moduleCount: number = 0;

  public constructor(
    typeNumber: TypeNumber = 0,
    errorCorrectionLevel: `${ErrorCorrectionLevel}` = ErrorCorrectionLevel.L
  ) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = ErrorCorrectLevel[errorCorrectionLevel];
    this.qrDataList = [];
  }

  public getTypeNumber(): number {
    return this.typeNumber;
  }

  public setTypeNumber(typeNumber: number): void {
    this.typeNumber = typeNumber;
  }

  public getErrorCorrectLevel(): ErrorCorrectLevel {
    return this.errorCorrectLevel;
  }

  public setErrorCorrectLevel(errorCorrectLevel: ErrorCorrectLevel) {
    this.errorCorrectLevel = errorCorrectLevel;
  }

  public clearData(): void {
    this.qrDataList = [];
  }

  public addData(qrData: QRData | string, mode: `${Mode}` = Mode.byte): void {
    if (qrData instanceof QRData) {
      this.qrDataList.push(qrData);
    } else if (typeof qrData === "string") {
      switch (mode) {
        case Mode.numeric:
          this.qrDataList.push(new QRNumber(qrData));
          break;
        case Mode.alphanumeric:
          this.qrDataList.push(new QRAlphaNum(qrData));
          break;
        case Mode.byte:
          this.qrDataList.push(new QR8BitByte(qrData, QRCodeMinimal.stringToBytesFuncs.default));
          break;
        case Mode.unicode:
          this.qrDataList.push(new QR8BitByte(qrData, QRCodeMinimal.stringToBytesFuncs["UTF8"]));
          break;
        case Mode.kanji:
          this.qrDataList.push(new QRKanji(qrData, QRCodeMinimal.stringToBytesFuncs["SJIS"]));
          break;
        default:
          throw "mode:" + mode;
      }
    } else {
      throw typeof qrData;
    }
  }

  /*private getDataCount(): number {
    return this.qrDataList.length;
  }

  private getData(index: number): QRData {
    return this.qrDataList[index];
  }*/

  public isDark(row: number, col: number): boolean {
    if (this.modules[row][col] != null) {
      return this.modules[row][col];
    } else {
      return false;
    }
  }

  public getModuleCount(): number {
    return this.moduleCount;
  }

  public make(): void {
    if (this.typeNumber < 1) {
      let typeNumber = 1;

      for (; typeNumber < 40; typeNumber++) {
        const rsBlocks = RSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);
        const buffer = new BitBuffer();

        for (let i = 0; i < this.qrDataList.length; i++) {
          const data = this.qrDataList[i];
          buffer.put(data.getMode(), 4);
          buffer.put(data.getLength(), data.getLengthInBits(typeNumber));
          data.write(buffer);
        }

        let totalDataCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) {
          totalDataCount += rsBlocks[i].getDataCount();
        }

        if (buffer.getLengthInBits() <= totalDataCount * 8) {
          break;
        }
      }

      this.typeNumber = typeNumber;
    }

    this.makeImpl(false, this.getBestMaskPattern());
  }

  private getBestMaskPattern(): number {
    let minLostPoint = 0;
    let pattern = 0;

    for (let i = 0; i < 8; i += 1) {
      this.makeImpl(true, i);

      const lostPoint = QRUtil.getLostPoint(this);

      if (i == 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }

    return pattern;
  }

  private makeImpl(test: boolean, maskPattern: number): void {
    // initialize modules
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = [];
    for (let i = 0; i < this.moduleCount; i += 1) {
      this.modules.push([]);
      for (let j = 0; j < this.moduleCount; j += 1) {
        this.modules[i].push(null);
      }
    }

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);

    this.setupPositionAdjustPattern();
    this.setupTimingPattern();

    this.setupTypeInfo(test, maskPattern);

    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }

    const data = QRCodeMinimal.createData(this.typeNumber, this.errorCorrectLevel, this.qrDataList);
    this.mapData(data, maskPattern);
  }

  private mapData(data: number[], maskPattern: number): void {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    const maskFunc = QRUtil.getMaskFunc(maskPattern);

    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col == 6) {
        col -= 1;
      }

      while (true) {
        for (let c = 0; c < 2; c += 1) {
          if (this.modules[row][col - c] == null) {
            let dark = false;

            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) == 1;
            }

            const mask = maskFunc(row, col - c);

            if (mask) {
              dark = !dark;
            }

            this.modules[row][col - c] = dark;
            bitIndex -= 1;

            if (bitIndex == -1) {
              byteIndex += 1;
              bitIndex = 7;
            }
          }
        }

        row += inc;

        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  private setupPositionAdjustPattern(): void {
    const pos = QRUtil.getPatternPosition(this.typeNumber);

    for (let i = 0; i < pos.length; i += 1) {
      for (let j = 0; j < pos.length; j += 1) {
        const row = pos[i];
        const col = pos[j];

        if (this.modules[row][col] != null) {
          continue;
        }

        for (let r = -2; r <= 2; r += 1) {
          for (let c = -2; c <= 2; c += 1) {
            if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  private setupPositionProbePattern(row: number, col: number): void {
    for (let r = -1; r <= 7; r += 1) {
      for (let c = -1; c <= 7; c += 1) {
        if (row + r <= -1 || this.moduleCount <= row + r || col + c <= -1 || this.moduleCount <= col + c) {
          continue;
        }

        if (
          (0 <= r && r <= 6 && (c == 0 || c == 6)) ||
          (0 <= c && c <= 6 && (r == 0 || r == 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  private setupTimingPattern(): void {
    for (let r = 8; r < this.moduleCount - 8; r += 1) {
      if (this.modules[r][6] != null) {
        continue;
      }
      this.modules[r][6] = r % 2 == 0;
    }
    for (let c = 8; c < this.moduleCount - 8; c += 1) {
      if (this.modules[6][c] != null) {
        continue;
      }
      this.modules[6][c] = c % 2 == 0;
    }
  }

  private setupTypeNumber(test: boolean): void {
    const bits = QRUtil.getBCHTypeNumber(this.typeNumber);

    for (let i = 0; i < 18; i += 1) {
      this.modules[~~(i / 3)][(i % 3) + this.moduleCount - 8 - 3] = !test && ((bits >> i) & 1) == 1;
    }

    for (let i = 0; i < 18; i += 1) {
      this.modules[(i % 3) + this.moduleCount - 8 - 3][~~(i / 3)] = !test && ((bits >> i) & 1) == 1;
    }
  }

  private setupTypeInfo(test: boolean, maskPattern: number): void {
    const data = (this.errorCorrectLevel << 3) | maskPattern;
    const bits = QRUtil.getBCHTypeInfo(data);

    // vertical
    for (let i = 0; i < 15; i += 1) {
      const mod = !test && ((bits >> i) & 1) == 1;

      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }

    // horizontal
    for (let i = 0; i < 15; i += 1) {
      const mod = !test && ((bits >> i) & 1) == 1;

      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }

    // fixed
    this.modules[this.moduleCount - 8][8] = !test;
  }

  public static createData(typeNumber: number, errorCorrectLevel: ErrorCorrectLevel, dataArray: QRData[]): number[] {
    const rsBlocks: RSBlock[] = RSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

    const buffer = new BitBuffer();

    for (let i = 0; i < dataArray.length; i += 1) {
      const data = dataArray[i];
      buffer.put(data.getMode(), 4);
      buffer.put(data.getLength(), data.getLengthInBits(typeNumber));
      data.write(buffer);
    }

    // calc max data count
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i += 1) {
      totalDataCount += rsBlocks[i].getDataCount();
    }

    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw "code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")";
    }

    // end
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }

    // padding
    while (buffer.getLengthInBits() % 8 != 0) {
      buffer.putBit(false);
    }

    // padding
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(QRCodeMinimal.PAD0, 8);

      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(QRCodeMinimal.PAD1, 8);
    }

    return QRCodeMinimal.createBytes(buffer, rsBlocks);
  }

  private static createBytes(buffer: BitBuffer, rsBlocks: RSBlock[]): number[] {
    let offset = 0;

    let maxDcCount = 0;
    let maxEcCount = 0;

    const dcdata: number[][] = [];
    const ecdata: number[][] = [];

    for (let r = 0; r < rsBlocks.length; r += 1) {
      dcdata.push([]);
      ecdata.push([]);
    }

    function createNumArray(len: number): number[] {
      const a: number[] = [];
      for (let i = 0; i < len; i += 1) {
        a.push(0);
      }
      return a;
    }

    for (let r = 0; r < rsBlocks.length; r += 1) {
      const dcCount = rsBlocks[r].getDataCount();
      const ecCount = rsBlocks[r].getTotalCount() - dcCount;

      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);

      dcdata[r] = createNumArray(dcCount);
      for (let i = 0; i < dcdata[r].length; i += 1) {
        dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
      }
      offset += dcCount;

      const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
      const rawPoly = new Polynomial(dcdata[r], rsPoly.getLength() - 1);

      const modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = createNumArray(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i += 1) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
      }
    }

    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i += 1) {
      totalCodeCount += rsBlocks[i].getTotalCount();
    }

    const data = createNumArray(totalCodeCount);
    let index = 0;

    for (let i = 0; i < maxDcCount; i += 1) {
      for (let r = 0; r < rsBlocks.length; r += 1) {
        if (i < dcdata[r].length) {
          data[index] = dcdata[r][i];
          index += 1;
        }
      }
    }

    for (let i = 0; i < maxEcCount; i += 1) {
      for (let r = 0; r < rsBlocks.length; r += 1) {
        if (i < ecdata[r].length) {
          data[index] = ecdata[r][i];
          index += 1;
        }
      }
    }
    return data;
  }

  public static stringToBytesFuncs: {
    [encoding: string]: (s: string) => number[];
  } = {
    default: function (s: string) {
      const bytes = [];
      for (let i = 0; i < s.length; i += 1) {
        const c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };
}
