/// <reference path="../../../node_modules/pxt-core/built/pxtsim.d.ts" />

namespace pxsim {
    export interface CommonBoard extends CoreBoard
        , EdgeConnectorBoard {
        bus: EventBus;
        buttonState: CommonButtonState;
        edgeConnectorState: EdgeConnectorState;
    }

    export function board(): CommonBoard {
        return runtime.board as CommonBoard;
    }
}