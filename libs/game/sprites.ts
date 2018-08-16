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
//% weight=98 color="#4B7BEC" icon="\uf1d8"
//% groups='["Create", "Properties", "Overlaps", "Collisions", "Lifecycle"]'
namespace sprites {

    /**
     * Creates a new sprite from an image
     * @param img the image
     */
    //% group="Create"
    //% blockId=spritescreate block="sprite %img=screen_image_picker of kind %kind=spritetype"
    //% expandableArgumentMode=toggle
    //% blockSetVariable=mySprite
    //% weight=100 help=sprites/create
    export function create(img: Image, kind?: number): Sprite {
        const scene = game.currentScene();
        const sprite = new Sprite(img)
        sprite.type = kind;
        scene.allSprites.push(sprite)
        sprite.id = scene.allSprites.length
        scene.physicsEngine.addSprite(sprite);

        // run on created handlers
        scene.createdHandlers
            .filter(h => h.type == kind)
            .forEach(h => h.handler(sprite));

        return sprite
    }

    /**
     * Return an array of all sprites of the given kind.
     * @param kind the target kind
     */
    //% blockId=allOfKind block="array of sprites of kind %kind=spritetype"
    //% blockNamespace="arrays" blockSetVariable="sprite list"
    //% weight=87
    export function allOfKind(kind: number): Sprite[] {
        const spritesByKind = game.currentScene().spritesByKind;
        if (!(kind >= 0) || !spritesByKind[kind]) return [];
        else return spritesByKind[kind].slice(0, spritesByKind[kind].length);
    }

    /**
     * Create a new sprite with given speed, and place it at the edge of the screen so it moves towards the middle.
     * The sprite auto-destroys when it leaves the screen. You can modify position after it's created.
     */
    //% group="Create"
    //% blockId=spritescreateprojectile block="projectile %img=screen_image_picker vx %vx vy %vy of kind %kind=spritetype || from sprite %sprite=variables_get"
    //% weight=99
    //% blockSetVariable=projectile
    //% inlineInputMode=inline
    //% expandableArgumentMode=toggle
    export function createProjectile(img: Image, vx: number, vy: number, kind: number, sprite?: Sprite) {
        const s = sprites.create(img, kind);
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

    /**
     * Creates a new sprite of the given kind and adds it to the game. Use this
     * with the "on sprite created" event.
     * @param kind the kind of sprite to create
     */
    //% group="Lifecycle"
    //% blockId=spritecreateempty block="create empty sprite of kind %kind=spritetype"
    //% weight=98
    export function createEmptySprite(kind: number): void {
        sprites.create(image.create(1, 1), kind);
    }

    export enum Flag {
        Ghost = 1, // doesn't collide with other sprites
        Destroyed = 2,
        AutoDestroy = 4, // remove the sprite when no longer visible
        StayInScreen = 8, // sprite cannot move outside the camera region
    }
}
