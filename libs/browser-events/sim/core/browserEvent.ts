namespace pxsim.browserEvents {
    export function mouseX() {
        return (pxsim.board() as BrowserEventsBoard).mouseState.mouseX();
    }

    export function mouseY() {
        return (pxsim.board() as BrowserEventsBoard).mouseState.mouseY();
    }

    export function wheelDx() {
        return (pxsim.board() as BrowserEventsBoard).mouseState.wheelDx();
    }

    export function wheelDy() {
        return (pxsim.board() as BrowserEventsBoard).mouseState.wheelDy();
    }

    export function wheelDz() {
        return (pxsim.board() as BrowserEventsBoard).mouseState.wheelDz();
    }
}