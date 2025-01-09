/**
 * OutputStream
 *
 * @author Kazuhiko Arase
 */
export abstract class OutputStream {
    constructor() { }
    public abstract writeByte(b: number): void
    public writeBytes(bytes: number[]): void {
        bytes.forEach(val => this.writeByte(val))
    }
    public flush(): void { }
    public close(): void {
        this.flush()
    }
}
