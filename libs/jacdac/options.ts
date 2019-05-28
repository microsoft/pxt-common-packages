// namespace jacdac{
namespace jacdac.options{
    const startTimeMs = Date.now();
    export function utf8Decode(buf: Buffer){
        return new TextDecoder().decode(buf.toUint8());
    }

    export function utf8Encode(str: string) : Buffer{
        return Buffer.createBufferFromUint8(new TextEncoder().encode(str));
    }

    export function createBuffer(size:number) : Buffer {
        return new Buffer(size);
    }

    export function error(message:string){
        console.error("jd> " + message);
    }

    export function log(message:string){
        console.log("jd> " + message);
    }

    export function getSerialNumber() : Buffer {
        let euid = createBuffer(8);

        for (let i = 0; i < 8; i++)
            euid.setUint8(i, random(0,0xFF));

        euid.setUint8(6, euid.getUint8(6) & ~(0x02))

        return euid;
    }

    export function getTimeMs() {
        return Date.now() - startTimeMs;
    }
}
    // export let options: JDOptions = {
// }