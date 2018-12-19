/// <reference path="../../../node_modules/pxt-core/built/pxtsim.d.ts" />

namespace pxsim {
    export interface CommonBoard extends CoreBoard {
        buttonState: CommonButtonState;
        edgeConnectorState: EdgeConnectorState;
    }

    export function board(): CommonBoard {
        return runtime.board as CommonBoard;
    }
}


namespace pxsim.pxtcore {
    // TODO: add in support for mode, as in CODAL
    export function registerWithDal(id: number, evid: number, handler: RefAction, mode: number = 0) {
        board().bus.listen(id, evid, handler);
    }
    export function getPin(id: number) : pxsim.Pin {
        return board().edgeConnectorState.getPin(id);
    }
    export function getPinCfg(key: number) : pxsim.Pin {
        return getPin(getConfig(key, -1))
    }
}
