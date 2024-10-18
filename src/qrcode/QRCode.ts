import { GIFImage } from "../image/GIFImage.js";
import { QRCodeMinimal } from "./QRCodeMinimal.js";

export class QRCode extends QRCodeMinimal {
  private _createHalfASCII(margin?: number) {
    const cellSize = 1;
    margin = typeof margin == "undefined" ? cellSize * 2 : margin;

    const size = this.getModuleCount() * cellSize + margin * 2;
    const min = margin;
    const max = size - margin;

    let y, x, r1, r2, p;

    const blocks: { [s: string]: string } = {
      "██": "█",
      "█ ": "▀",
      " █": "▄",
      "  ": " "
    };

    const blocksLastLineNoMargin: { [s: string]: string } = {
      "██": "▀",
      "█ ": "▀",
      " █": " ",
      "  ": " "
    };

    let ascii = "";
    for (y = 0; y < size; y += 2) {
      r1 = Math.floor((y - min) / cellSize);
      r2 = Math.floor((y + 1 - min) / cellSize);
      for (x = 0; x < size; x += 1) {
        p = "█";

        if (min <= x && x < max && min <= y && y < max && this.isDark(r1, Math.floor((x - min) / cellSize))) {
          p = " ";
        }

        if (min <= x && x < max && min <= y + 1 && y + 1 < max && this.isDark(r2, Math.floor((x - min) / cellSize))) {
          p += " ";
        } else {
          p += "█";
        }

        // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
        ascii += margin < 1 && y + 1 >= max ? blocksLastLineNoMargin[p] : blocks[p];
      }

      ascii += "\n";
    }

    if (size % 2 && margin > 0) {
      return ascii.substring(0, ascii.length - size - 1) + Array(size + 1).join("▀");
    }

    return ascii.substring(0, ascii.length - 1);
  }

  public createASCII(cellSize?: number, margin?: number) {
    cellSize = cellSize || 1;

    if (cellSize < 2) {
      return this._createHalfASCII(margin);
    }

    cellSize -= 1;
    margin = typeof margin == "undefined" ? cellSize * 2 : margin;

    const size = this.getModuleCount() * cellSize + margin * 2;
    const min = margin;
    const max = size - margin;

    const white = Array(cellSize + 1).join("██");
    const black = Array(cellSize + 1).join("  ");

    let ascii = "";
    let line = "";
    for (let y = 0; y < size; y += 1) {
      let r = Math.floor((y - min) / cellSize);
      line = "";
      for (let x = 0; x < size; x += 1) {
        let p = 1;

        if (min <= x && x < max && min <= y && y < max && this.isDark(r, Math.floor((x - min) / cellSize))) {
          p = 0;
        }

        // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
        line += p ? white : black;
      }

      for (r = 0; r < cellSize; r += 1) {
        ascii += line + "\n";
      }
    }

    return ascii.substring(0, ascii.length - 1);
  }

  public renderTo2dContext(context: CanvasRenderingContext2D, cellSize?: number) {
    cellSize = cellSize || 2;
    const length = this.getModuleCount();
    for (let row = 0; row < length; row++) {
      for (let col = 0; col < length; col++) {
        context.fillStyle = this.isDark(row, col) ? "black" : "white";
        context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
      }
    }
  }

  public toDataURL(cellSize = 2, margin = cellSize * 4): string {
    const mods = this.getModuleCount();
    const size = cellSize * mods + margin * 2;
    const gif = new GIFImage(size, size);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (
          margin <= x &&
          x < size - margin &&
          margin <= y &&
          y < size - margin &&
          this.isDark(~~((y - margin) / cellSize), ~~((x - margin) / cellSize))
        ) {
          gif.setPixel(x, y, 0);
        } else {
          gif.setPixel(x, y, 1);
        }
      }
    }
    return gif.toDataURL();
  }

  public createTableTag(cellSize?: number, margin?: number) {
    cellSize = cellSize || 2;
    margin = typeof margin == "undefined" ? cellSize * 4 : margin;

    let qrHtml = "";

    qrHtml += '<table style="';
    qrHtml += " border-width: 0px; border-style: none;";
    qrHtml += " border-collapse: collapse;";
    qrHtml += " padding: 0px; margin: " + margin + "px;";
    qrHtml += '">';
    qrHtml += "<tbody>";

    for (let r = 0; r < this.getModuleCount(); r += 1) {
      qrHtml += "<tr>";

      for (let c = 0; c < this.getModuleCount(); c += 1) {
        qrHtml += '<td style="';
        qrHtml += " border-width: 0px; border-style: none;";
        qrHtml += " border-collapse: collapse;";
        qrHtml += " padding: 0px; margin: 0px;";
        qrHtml += " width: " + cellSize + "px;";
        qrHtml += " height: " + cellSize + "px;";
        qrHtml += " background-color: ";
        qrHtml += this.isDark(r, c) ? "#000000" : "#ffffff";
        qrHtml += ";";
        qrHtml += '"/>';
      }

      qrHtml += "</tr>";
    }

    qrHtml += "</tbody>";
    qrHtml += "</table>";

    return qrHtml;
  }

  public createSvgTag(opts?: {
    cellSize?: number;
    margin?: number;
    scalable?: boolean;
    alt?: string | { text?: string | null; id?: string | null };
    title?: string | { text?: string | null; id?: string | null };
  }) {
    opts = opts || {};

    const cellSize = opts.cellSize || 2;
    const margin = typeof opts.margin == "undefined" ? cellSize * 4 : opts.margin;

    // Compose alt property surrogate
    const alt = typeof opts.alt === "string" ? { text: opts.alt } : opts.alt || {};
    alt.text = alt.text || null;
    alt.id = alt.text ? alt.id || "qrcode-description" : null;

    // Compose title property surrogate
    const title = typeof opts.title === "string" ? { text: opts.title } : opts.title || {};
    title.text = title.text || null;
    title.id = title.text ? title.id || "qrcode-title" : null;

    const size = this.getModuleCount() * cellSize + margin * 2;
    let qrSvg = "";

    const rect = "l" + cellSize + ",0 0," + cellSize + " -" + cellSize + ",0 0,-" + cellSize + "z ";

    qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
    qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : "";
    qrSvg += ' viewBox="0 0 ' + size + " " + size + '" ';
    qrSvg += ' preserveAspectRatio="xMinYMin meet"';
    qrSvg +=
      title.text || alt.text
        ? ' role="img" aria-labelledby="' + escapeXml([title.id, alt.id].join(" ").trim()) + '"'
        : "";
    qrSvg += ">";
    qrSvg += title.text ? '<title id="' + escapeXml(title.id || "") + '">' + escapeXml(title.text) + "</title>" : "";
    qrSvg += alt.text
      ? '<description id="' + escapeXml(alt.id || "") + '">' + escapeXml(alt.text) + "</description>"
      : "";
    qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
    qrSvg += '<path d="';

    for (let r = 0; r < this.getModuleCount(); r += 1) {
      const mr = r * cellSize + margin;
      for (let c = 0; c < this.getModuleCount(); c += 1) {
        if (this.isDark(r, c)) {
          const mc = c * cellSize + margin;
          qrSvg += "M" + mc + "," + mr + rect;
        }
      }
    }

    qrSvg += '" stroke="transparent" fill="black"/>';
    qrSvg += "</svg>";

    return qrSvg;
  }

  public createImgTag(cellSize?: number, margin?: number, alt?: string) {
    cellSize = cellSize || 2;
    margin = typeof margin == "undefined" ? cellSize * 4 : margin;

    const size = this.getModuleCount() * cellSize + margin * 2;

    let img = "";
    img += "<img";
    img += '\u0020src="';
    img += this.toDataURL(cellSize, margin);
    img += '"';
    img += '\u0020width="';
    img += size;
    img += '"';
    img += '\u0020height="';
    img += size;
    img += '"';
    if (alt) {
      img += '\u0020alt="';
      img += escapeXml(alt);
      img += '"';
    }
    img += "/>";

    return img;
  }
}

function escapeXml(s: string) {
  let escaped = "";
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charAt(i);
    switch (c) {
      case "<":
        escaped += "&lt;";
        break;
      case ">":
        escaped += "&gt;";
        break;
      case "&":
        escaped += "&amp;";
        break;
      case '"':
        escaped += "&quot;";
        break;
      default:
        escaped += c;
        break;
    }
  }
  return escaped;
}
