namespace pxsim {
    export interface EdgeConnectorBoard {
        edgeConnectorState: EdgeConnectorState;
    }
}

namespace pxsim.pxtcore {
    export function getPin(id: number): pxsim.Pin {
        const b = board() as EdgeConnectorBoard;
        if (b && b.edgeConnectorState)
            return b.edgeConnectorState.getPin(id);
        return undefined;
    }
    export function lookupPinCfg(key: number): pxsim.Pin {
        return getPinCfg(key);
    }
    export function getPinCfg(key: number): pxsim.Pin {
        return getPin(getConfig(key, -1))
    }
}
