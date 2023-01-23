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

    export function initServer() {
        if (getOrigin() === "server") {
            game.eventContext().registerFrameHandler(scene.MULTIPLAYER_POST_SCREEN_PRIORITY, () => {
                if (getOrigin() === "server") {
                    postImage(screen);
                }
            })
        }
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