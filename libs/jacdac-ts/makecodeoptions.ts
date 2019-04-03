namespace jacdac{
    export let options: JDOptions = {
        utf8Decode(buf: Buffer) : string{
            return buf.toString();
        },
        utf8Encode(str: string) : Buffer{
            return control.createBufferFromUTF8(str);
        },
        createBuffer(size:number) : Buffer {
            return control.createBuffer(size);
        },
        error(message:string){
            console.error(message);
        },
        log(message:string){
            console.log(message);
        },
        getSerialNumber() : Buffer {
            const buf = control.createBuffer(8);
            buf.setNumber(NumberFormat.UInt32LE,0,control.deviceSerialNumber())
            return buf;
        }
    }
}