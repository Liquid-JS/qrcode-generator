import { Base64DecodeInputStream } from '../io/Base64DecodeInputStream.js'
import { ByteArrayInputStream } from '../io/ByteArrayInputStream.js'

/**
 * createStringToBytes
 *
 * @author Kazuhiko Arase
 * @param unicodeData base64 string of byte array.
 * [16bit Unicode],[16bit Bytes], ...
 * @param numChars
 */
export function createStringToBytes(unicodeData: string, numChars: number): (s: string) => number[] {
    function toBytes(s: string): number[] {
        const bytes: number[] = []
        for (let i = 0; i < s.length; i += 1) {
            bytes.push(s.charCodeAt(i))
        }
        return bytes
    }
    // create conversion map.
    const unicodeMap = (() => {
        const bin = new Base64DecodeInputStream(new ByteArrayInputStream(toBytes(unicodeData)))
        const read = () => {
            const b = bin.readByte()
            if (b == -1) throw new Error('eof')
            return b
        }
        let count = 0
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const unicodeMap: { [ch: string]: number } = {}
        while (true) {
            const b0 = bin.readByte()
            if (b0 == -1) break
            const b1 = read()
            const b2 = read()
            const b3 = read()
            const k = String.fromCharCode((b0 << 8) | b1)
            const v = (b2 << 8) | b3
            unicodeMap[k] = v
            count += 1
        }
        if (count != numChars) {
            throw new Error(count + '!=' + numChars)
        }
        return unicodeMap
    })()

    const unknownChar = '?'.charCodeAt(0)

    return (s: string): number[] => {
        const bytes: number[] = []
        for (let i = 0; i < s.length; i += 1) {
            const c = s.charCodeAt(i)
            if (c < 128) {
                bytes.push(c)
            } else {
                const b = unicodeMap[s.charAt(i)]
                if (typeof b == 'number') {
                    if ((b & 0xff) == b) {
                        // 1byte
                        bytes.push(b)
                    } else {
                        // 2bytes
                        bytes.push(b >>> 8)
                        bytes.push(b & 0xff)
                    }
                } else {
                    bytes.push(unknownChar)
                }
            }
        }
        return bytes
    }
}
