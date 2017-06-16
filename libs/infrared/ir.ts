namespace ir {
    export function sendNumber(v: number) {
        let b: Buffer
        if ((v | 0) == v) {
            if ((v << 16) >> 16 == v) {
                b = pins.createBuffer(2)
                b.setNumber(NumberFormat.Int16LE, 0, v)
            } else {
                b = pins.createBuffer(4)
                b.setNumber(NumberFormat.Int32LE, 0, v)
            }
        } else {
            b = pins.createBuffer(8)
            b.setNumber(NumberFormat.Float64LE, 0, v)
        }
        send(b)
    }

    export function currentNumber() {
        let b = currentPacket()
        if (b.length == 8)
            return b.getNumber(NumberFormat.Float64LE, 0)
        else if (b.length == 2)
            return b.getNumber(NumberFormat.Int16LE, 0)
        else
            return b.getNumber(NumberFormat.Int32LE, 0)
    }
}