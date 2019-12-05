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
//% weight=99 color="#4B7BEC" icon="\uf1d8"
//% groups='["Create", "Physics", "Effects", "Projectiles", "Overlaps", "Lifecycle"]'
namespace sprites {
    export class FollowingSprite {
        constructor(
            public self: Sprite,
            public target: Sprite,
            public rate: number,
            public turnRate: number
        ) { }
    }

    /**
     * Create a new sprite from an image
     * @param img the image
     */
    //% group="Create"
    //% blockId=spritescreate block="sprite %img=screen_image_picker of kind %kind=spritekind"
    //% expandableArgumentMode=toggle
    //% blockSetVariable=mySprite
    //% weight=100 help=sprites/create
    export function create(img: Image, kind?: number): Sprite {
        const scene = game.currentScene();
        const sprite = new Sprite(img)
        sprite.setKind(kind);
        scene.physicsEngine.addSprite(sprite);

        // run on created handlers
        scene.createdHandlers
            .filter(h => h.kind == kind)
            .forEach(h => h.handler(sprite));

        return sprite
    }

    /**
     * Return an array of all sprites of the given kind.
     * @param kind the target kind
     */
    //% blockId=allOfKind block="array of sprites of kind %kind=spritekind"
    //% blockNamespace="arrays" blockSetVariable="sprite list"
    //% weight=87
    export function allOfKind(kind: number): Sprite[] {
        const spritesByKind = game.currentScene().spritesByKind;
        if (!(kind >= 0) || !spritesByKind[kind]) return [];
        else return spritesByKind[kind].sprites();
    }

    /**
     * Create a new sprite with a given speed, and place it at the edge of the screen so it moves towards the middle.
     * The sprite auto-destroys when it leaves the screen. You can modify position after it's created.
     */
    //% group="Projectiles"
    //% blockId=spritescreateprojectilefromside block="projectile %img=screen_image_picker from side with vx %vx vy %vy"
    //% vx.shadow=spriteSpeedPicker
    //% vy.shadow=spriteSpeedPicker
    //% weight=99 help=sprites/create-projectile-from-side
    //% blockSetVariable=projectile
    //% inlineInputMode=inline
    //% vy.defl=100
    export function createProjectileFromSide(img: Image, vx: number, vy: number) {
        return createProjectile(img, vx, vy, SpriteKind.Projectile);
    }

    /**
     * Create a new sprite with a given speed that starts from the location of another sprite.
     * The sprite auto-destroys when it leaves the screen. You can modify position after it's created.
     */
    //% group="Projectiles"
    //% blockId=spritescreateprojectilefromsprite block="projectile %img=screen_image_picker from %sprite=variables_get(mySprite) with vx %vx vy %vy"
    //% vx.shadow=spriteSpeedPicker
    //% vy.shadow=spriteSpeedPicker
    //% weight=99 help=sprites/create-projectile-from-sprite
    //% blockSetVariable=projectile
    //% inlineInputMode=inline
    //% vy.defl=100
    export function createProjectileFromSprite(img: Image, sprite: Sprite, vx: number, vy: number): Sprite {
        return createProjectile(img, vx, vy, SpriteKind.Projectile, sprite);
    }

    /**
     * Create a new sprite with given speed, and place it at the edge of the screen so it moves towards the middle.
     * The sprite auto-destroys when it leaves the screen. You can modify position after it's created.
     */
    //% group="Projectiles"
    //% blockId=spritescreateprojectile block="projectile %img=screen_image_picker vx %vx vy %vy of kind %kind=spritekind||from sprite %sprite=variables_get(mySprite)"
    //% weight=99 help=sprites/create-projectile
    //% blockSetVariable=projectile
    //% inlineInputMode=inline
    //% expandableArgumentMode=toggle
    //% vy.defl=100
    //% deprecated=true blockHidden=true
    export function createProjectile(img: Image, vx: number, vy: number, kind?: number, sprite?: Sprite) {
        const s = sprites.create(img, kind || SpriteKind.Projectile);
        const sc = game.currentScene();

        while (vx == 0 && vy == 0) {
            vx = Math.randomRange(-100, 100);
            vy = Math.randomRange(-100, 100);
        }

        s.vx = vx;
        s.vy = vy;

        if (sprite) {
            s.setPosition(sprite.x, sprite.y);
        } else {
            // put it at the edge of the screen so that it moves towards the middle
            // If the scene has a tile map, place the sprite fully on the screen
            const xOff = sc.tileMap ? -(s.width >> 1) : (s.width >> 1) - 1;
            const yOff = sc.tileMap ? -(s.height >> 1) : (s.height >> 1) - 1;
            const cam = game.currentScene().camera;

            let initialX = cam.offsetX;
            let initialY = cam.offsetY;

            if (vx < 0) {
                initialX += screen.width + xOff;
            } else if (vx > 0) {
                initialX += -xOff;
            }

            if (vy < 0) {
                initialY += screen.height + yOff;
            } else if (vy > 0) {
                initialY += -yOff;
            }

            s.setPosition(initialX, initialY);
        }

        s.flags |= sprites.Flag.AutoDestroy | sprites.Flag.DestroyOnWall;

        return s;
    }

    export enum Flag {
        None = 0, // no flags are set
        Ghost = 1 << 0, // doesn't collide with other sprites
        Destroyed = 1 << 1, // whether the sprite has been destroyed or not
        AutoDestroy = 1 << 2, // remove the sprite when no longer visible
        StayInScreen = 1 << 3, // sprite cannot move outside the camera region
        DestroyOnWall = 1 << 4, // destroy sprite on contact with wall
        BounceOnWall = 1 << 5, // Bounce on walls
        ShowPhysics = 1 << 6, // display position, velocity, acc
        Invisible = 1 << 7, // makes the sprite invisible, so it does not show up on the screen
        IsClipping = 1 << 8, // whether the sprite is currently clipping into a wall. This can happen when a sprite is created or moved explicitly.
        RelativeToCamera = 1 << 9 // draw relative to the camera, not the world (e.g. HUD elements)
    }
}
