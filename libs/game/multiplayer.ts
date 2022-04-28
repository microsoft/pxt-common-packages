namespace multiplayer {
    export function init() {
        game.addScenePushHandler(() => {
            game.eventContext().registerFrameHandler(scene.MULTIPLAYER_MESSAGING_PRIORITY, () => {
                if (multiplayer.getOrigin() === "client") {
                    const im: Image = multiplayer.getCurrentImage();
                    scene.setBackgroundImage(im);
                }
            });
        });
    }
}