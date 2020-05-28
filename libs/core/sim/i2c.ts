namespace pxsim {
    export class I2CState {
        private received: pxt.Map<SimulatorI2CMessage[]>;

        constructor() {
            this.received = {}
        }

        write(address: number, data: RefBuffer, repeat?: boolean) {
            address = address | 0;
            Runtime.postMessage(<SimulatorI2CMessage>{
                type: "i2c",
                broadcast: true,
                address,
                packet: data.data,
                repeat
            })            
        }

        receive(msg: SimulatorI2CMessage) {
            let queue = this.received[msg.address];
            if (!queue)
                queue = this.received[msg.address] = []
            queue.push(msg);
        }

        read(address: number, size: number, repeat?: boolean): RefBuffer {
            address = address | 0;
            const queue = this.received[address];            
            const msg = queue.unshift();
            const r = pxsim.BufferMethods.createBuffer(size);
            const n = Math.min(size, msg.packet.length);
            for(let i = 0; i < n; ++i)
                r.data[i] = msg.packet[i];
            return r;
        }
    }

        
    export interface I2CBoard extends CommonBoard {
        i2cState: I2CState;
    }

    export function getI2cState() {
        return (board() as I2CBoard).i2cState;
    }
}
