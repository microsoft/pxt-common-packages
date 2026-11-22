namespace pxsim {
    export interface CommonBoard extends CoreBoard
        , EdgeConnectorBoard, EventBusBoard {
        bus: EventBus;
        buttonState: CommonButtonState;
        edgeConnectorState: EdgeConnectorState;
    }

    export function board(): CommonBoard {
        return runtime && runtime.board as CommonBoard;
    }
}