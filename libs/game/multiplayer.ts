namespace multiplayer {
    //% shim=multiplayer::getCurrentImage
    declare function getCurrentImage(): Image;

    //% shim=multiplayer::postImage
    export declare function postImage(im: Image): void;

    //% shim=multiplayer::setOrigin
    declare function setOrigin(origin: string): void;

    //% shim=multiplayer::getOrigin
    export declare function getOrigin(): string;

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