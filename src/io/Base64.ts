import { Base64DecodeInputStream } from './Base64DecodeInputStream.js'
import { Base64EncodeOutputStream } from './Base64EncodeOutputStream.js'
import { ByteArrayInputStream } from './ByteArrayInputStream.js'
import { ByteArrayOutputStream } from './ByteArrayOutputStream.js'

/**
 * Base64
 *
 * @author Kazuhiko Arase
 */
export class Base64 {
    constructor() {
        throw new Error('error')
    }

    public static encode(data: number[]): number[] {
        const bout = new ByteArrayOutputStream()
        try {
            const ostream = new Base64EncodeOutputStream(bout)
            try {
                ostream.writeBytes(data)
            } finally {
                ostream.close()
            }
        } finally {
            bout.close()
        }
        return bout.toByteArray()
    }

    public static decode(data: number[]): number[] {
        const bout = new ByteArrayOutputStream()
        try {
            const istream = new Base64DecodeInputStream(new ByteArrayInputStream(data))
            try {
                let b: number
                while ((b = istream.readByte()) != -1) {
                    bout.writeByte(b)
                }
            } finally {
                istream.close()
            }
        } finally {
            bout.close()
        }
        return bout.toByteArray()
    }
}
