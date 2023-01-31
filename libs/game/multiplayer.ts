namespace multiplayer {
    //% shim=multiplayer::getCurrentImage
    declare function getCurrentImage(): Image;

    //% shim=multiplayer::postImage
    declare function postImage(im: Image): void;

    //% shim=multiplayer::setOrigin
    declare function setOrigin(origin: string): void;

    //% shim=multiplayer::getOrigin
    declare function getOrigin(): string;

    export function init() {
        game.addScenePushHandler(() => {
            game.eventContext().registerFrameHandler(scene.MULTIPLAYER_SCREEN_PRIORITY, () => {
                if (getOrigin() === "client") {
                    const im: Image = getCurrentImage();
                    scene.setBackgroundImage(im);
                    // clear default menu button behavior
                    controller.menu.onEvent(ControllerButtonEvent.Pressed, () => { });
                }
            });
        });
        game.pushScene();
    }

    const MULTIPLAYER_PLAYER_JOINED_ID = 3241;
    const MULTIPLAYER_PLAYER_LEFT_ID = 3242;
    export function initServer() {
        if (getOrigin() === "server") {
            game.eventContext().registerFrameHandler(scene.MULTIPLAYER_POST_SCREEN_PRIORITY, () => {
                if (getOrigin() === "server") {
                    postImage(screen);
                }
            })
        }
    }

    export function initPlayerConnectionListeners() {
        for (let p = 1; p <= 4; p++) {
            registerPlayerConnectionListeners(p);
        }
    }

    function registerPlayerConnectionListeners(playerNumber: number) {
        control.onEvent(
            MULTIPLAYER_PLAYER_JOINED_ID,
            playerNumber,
            () => receiveConnectionChangedEvent(playerNumber, true)
        );
        control.onEvent(
            MULTIPLAYER_PLAYER_LEFT_ID,
            playerNumber,
            () => receiveConnectionChangedEvent(playerNumber, false)
        );
    }

    function receiveConnectionChangedEvent(playerNumber: number, connected: boolean) {
        let c: controller.Controller;
        switch (playerNumber) {
            case 1:
                c = controller.player1;
                break;
            case 2:
                c = controller.player2;
                break;
            case 3:
                c = controller.player3;
                break;
            case 4:
                c = controller.player4;
                break;
        }
        if (c)
            c.connected = connected;
    }
}

namespace mp {
    enum IconType {
        Player = 0,
        Reaction = 1,
    }
    //% shim=multiplayer::postIcon
    declare function postIcon(type: IconType, slot: number, im: Image): void;

    export function postPresenceIcon(slot: number, im: Image, implicit?: boolean) {
        initIconState();
        if (slot < 1 || slot > 4)
            return;

        const presenceSetExplicitly = explicitlySetIcons[IconType.Player];
        if (implicit && presenceSetExplicitly[slot])
            return;
        if (!implicit)
            presenceSetExplicitly[slot] = true;

        postIcon(IconType.Player, slot, im);
    }

    export function postReactionIcon(slot: number, im: Image, implicit?: boolean) {
        initIconState();
        if (slot < 1 || slot > 6)
            return;

        const reactionsSetExplicitly = explicitlySetIcons[IconType.Reaction];
        if (implicit && reactionsSetExplicitly[slot])
            return;
        if (!implicit)
            reactionsSetExplicitly[slot] = true;

        postIcon(IconType.Reaction, slot, im);
    }

    let explicitlySetIcons: boolean[][];
    function initIconState() {
        if (explicitlySetIcons)
            return;
        explicitlySetIcons = [];
        explicitlySetIcons[IconType.Player] = [];
        explicitlySetIcons[IconType.Reaction] = [];
    }
}