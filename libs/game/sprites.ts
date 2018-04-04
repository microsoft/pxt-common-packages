/*
Frame handlers:
 10 - physics and collisions
 20 - frame()
 60 - screen/sprite background
 90 - drawing sprites
 95 - drawing score
100 - loops.menu()
200 - screen refresh
*/

/**
 * Sprites on screen
 */
//% weight=98 color="#23c47e" icon="\uf1d8"
//% groups='["Create", "Properties", "Collisions", "Lifecycle"]'
namespace sprites {

    /**
     * Creates a new sprite from an image
     * @param img the image
     */
    //% group="Create"
    //% blockId=spritescreate block="sprite %img=screen_image_picker||at x %x y %y"
    //% expandableArgumentMode=toggle
    //% blockSetVariable
    //% weight=100
    export function create(img: Image, x?: number, y?: number): Sprite {
        const scene = game.scene();
        const sprite = new Sprite(img)
        scene.allSprites.push(sprite)
        sprite.id = scene.allSprites.length
        scene.physicsEngine.addSprite(sprite);
        if (x !== null && x != undefined)
            sprite.x = x;
        if (y !== null && y !== undefined)
            sprite.y = y;
        return sprite
    }

    /**
     * Creates a new object sprite from an image
     * @param img the image
     */
    //% group="Create"
    //% blockId=spritescreateobjectsable block="obstacle %img=screen_image_picker||at x %x y %y"
    //% expandableArgumentMode=toggle
    //% blockSetVariable
    //% weight=100
    export function createObstacle(img: Image, x?: number, y?: number) {
        const sprite = create(img, x, y);
        sprite.flags |= sprites.Flag.Obstacle;
        return sprite;
    }

    /**
     * Create a new sprite with given speed, and place it at the edge of the screen so it moves towards the middle.
     * The sprite auto-destroys when it leaves the screen. You can modify position after it's created.
     */
    //% group="Create"
    //% blockId=spritescreateprojectile block="projectile %img=screen_image_picker vx %vx vy %vy||from %sprite=variables_get"
    //% weight=99
    //% blockSetVariable
    //% inlineInputMode=inline
    //% expandableArgumentMode=toggle
    export function createProjectile(img: Image, vx: number, vy: number, sprite?: Sprite) {
        const s = create(img)
        s.vx = vx
        s.vy = vy

        // put it at the edge of the screen so that it moves towards the middle

        if (vx < 0)
            s.x = screen.width + (s.width >> 1) - 1
        else if (vx > 0)
            s.x = -(s.width >> 1) + 1

        if (vy < 0)
            s.y = screen.height + (s.height >> 1) - 1
        else if (vy > 0)
            s.y = -(s.height >> 1) + 1

        s.flags |= sprites.Flag.AutoDestroy;

        if (sprite) {
            s.x = sprite.x;
            s.y = sprite.y;
        }

        return s
    }

    //% blockId=screen_image_picker block="%img"
    //% shim=TD_ID
    //% img.fieldEditor="sprite"
    //% img.fieldOptions.taggedTemplate="img"
    //% weight=100
    export function _createImageShim(img: Image) { return img };

    export enum Flag {
        Ghost = 1, // doesn't collide with other sprites
        Destroyed = 2,
        AutoDestroy = 4, // remove the sprite when no longer visible
        Obstacle = 8, // generate collisions, immovable
    }
}
