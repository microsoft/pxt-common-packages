/// <reference path="../../../node_modules/pxt-core/built/pxtsim.d.ts" />

namespace pxsim {
    export interface CommonBoard extends CoreBoard
        , EdgeConnectorBoard, EventBusBoard {
        bus: EventBus;
        buttonState: CommonButtonState;
        edgeConnectorState: EdgeConnectorState;
    }

    export function board(): CommonBoard {
        return runtime.board as CommonBoard;
    }

    export namespace BufferMethods {
        function fnv1(data: Uint8Array) {
            let h = 0x811c9dc5
            for (let i = 0; i < data.length; ++i) {
                h = Math.imul(h, 0x1000193) ^ data[i]
            }
            return h
        }

        export function hash(buf: RefBuffer, bits: number) {
            bits |= 0
            if (bits < 1)
                return 0
            const h = fnv1(buf.data)
            if (bits >= 32)
                return h >>> 0
            else
                return ((h ^ (h >>> bits)) & ((1 << bits) - 1)) >>> 0
        }
    }
}