namespace multiplayer {
    //% shim=multiplayer::getCurrentImage
    declare function getCurrentImage(): Image;

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
}