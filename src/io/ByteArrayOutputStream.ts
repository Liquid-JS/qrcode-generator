import { OutputStream } from './OutputStream.js'

/**
 * ByteArrayOutputStream
 *
 * @author Kazuhiko Arase
 */
export class ByteArrayOutputStream extends OutputStream {
    private bytes: number[] = []

    constructor() {
        super()
    }

    public writeByte(b: number): void {
        this.bytes.push(b)
    }

    public toByteArray(): number[] {
        return this.bytes
    }
}
