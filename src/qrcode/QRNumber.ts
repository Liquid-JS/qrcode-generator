import { BitBuffer } from './BitBuffer.js'
import { Mode } from './Mode.js'
import { QRData } from './QRData.js'

/**
 * QRNumber
 *
 * @author Kazuhiko Arase
 */
export class QRNumber extends QRData {
    constructor(data: string) {
        super(Mode.MODE_NUMBER, data)
    }

    public write(buffer: BitBuffer): void {
        const data = this.getData()

        let i = 0

        while (i + 2 < data.length) {
            buffer.put(QRNumber.strToNum(data.substring(i, i + 3)), 10)
            i += 3
        }

        if (i < data.length) {
            if (data.length - i == 1) {
                buffer.put(QRNumber.strToNum(data.substring(i, i + 1)), 4)
            } else if (data.length - i == 2) {
                buffer.put(QRNumber.strToNum(data.substring(i, i + 2)), 7)
            }
        }
    }

    public getLength(): number {
        return this.getData().length
    }

    private static strToNum(s: string): number {
        let num = 0
        for (let i = 0; i < s.length; i += 1) {
            num = num * 10 + QRNumber.chatToNum(s.charAt(i))
        }
        return num
    }

    private static chatToNum(c: string): number {
        if ('0' <= c && c <= '9') {
            return c.charCodeAt(0) - '0'.charCodeAt(0)
        }
        throw new Error('illegal char :' + c)
    }
}
