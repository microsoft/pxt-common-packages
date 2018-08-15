namespace controller {
    interface ControlledSprite {
        s: Sprite;
        vx: number;
        vy: number;
    }

    let controlledSprites: ControlledSprite[];

    /**
     * Control a sprite using the direction buttons from the controller. Note that this
     * control will take over the vx and vy of the sprite and overwrite any changes
     * made unless a 0 is passed.
     *
     * @param sprite The Sprite to control
     * @param vx The velocity used for horizontal movement when left/right is pressed
     * @param vy The velocity used for vertical movement when up/down is pressed
     */
    //% blockId="game_control_sprite" block="control sprite $sprite=variables_get(mySprite) with vx $vx vy $vy"
    //% weight=100
    //% vx.defl=100 vy.defl=100
    export function controlSprite(sprite: Sprite, vx: number, vy: number) {
        if (!sprite) return;
        if (!controlledSprites) {
            controlledSprites = [];
            game.currentScene().eventContext.registerFrameHandler(19, () => {
                controlledSprites.forEach(controlled => {
                    if (controlled.vx) {
                        controlled.s.vx = 0;

                        if (controller.right.isPressed()) {
                            controlled.s.vx = controlled.vx;
                        }
                        if (controller.left.isPressed()) {
                            controlled.s.vx = -controlled.vx;
                        }
                    }

                    if (controlled.vy) {
                        controlled.s.vy = 0;

                        if (controller.down.isPressed()) {
                            controlled.s.vy = controlled.vy;
                        }
                        if (controller.up.isPressed()) {
                            controlled.s.vy = -controlled.vy;
                        }
                    }
                });
            });
        }

        for (let i = 0; i < controlledSprites.length; i++) {
            if (controlledSprites[i].s.id === sprite.id) {
                controlledSprites[i].vx = vx;
                controlledSprites[i].vy = vy;
                return;
            }
        }
        controlledSprites.push({ s: sprite, vx: vx, vy: vy });
    }
}
