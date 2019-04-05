namespace jacdac.options
{
    let sn: Buffer
    export function utf8Decode (buf: Buffer) {
        return buf.toString();
    }

    export function utf8Encode (str: string) {
        return control.createBufferFromUTF8(str);
    }

    export function createBuffer (size: number) {
        return control.createBuffer(size);
    }

    export function error (message: string) {
        console.add(ConsolePriority.Error, message);
    }

    export function log (message: string)  {
        console.add(ConsolePriority.Log, message);
    }

    export function getSerialNumber ()  {
        if (!sn) {
            sn = control.createBuffer(8);
            sn.setNumber(NumberFormat.UInt32LE, 0, control.deviceSerialNumber())
        }
        return sn;
    }
}