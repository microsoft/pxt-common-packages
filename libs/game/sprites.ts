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
//% groups='["Create", "Properties", "Projectiles", "Overlaps", "Lifecycle"]'
namespace sprites {

    /**
     * Create a new sprite from an image
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
        sprite.setKind(kind);
        scene.addSprite(sprite);
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
    //% blockId=allOfKind block="array of sprites of kind %kind=spritetype"
    //% blockNamespace="arrays" blockSetVariable="sprite list"
    //% weight=87
    export function allOfKind(kind: number): Sprite[] {
        const spritesByKind = game.currentScene().spritesByKind;
        if (!(kind >= 0) || !spritesByKind[kind]) return [];
        else return spritesByKind[kind].sprites();
    }

    /**
     * Create a new sprite with given speed, and place it at the edge of the screen so it moves towards the middle.
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
        return createProjectile(img, vx, vy, 1);
    }


    
    /**
     * Create a new sprite with given speed, and place it at the edge of the screen so it moves towards the middle.
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
        return createProjectile(img, vx, vy, 1, sprite);
    }    

    /**
     * Create a new sprite with given speed, and place it at the edge of the screen so it moves towards the middle.
     * The sprite auto-destroys when it leaves the screen. You can modify position after it's created.
     */
    //% group="Projectiles"
    //% blockId=spritescreateprojectile block="projectile %img=screen_image_picker vx %vx vy %vy of kind %kind=spritetype||from sprite %sprite=variables_get(mySprite)"
    //% weight=99 help=sprites/create-projectile
    //% blockSetVariable=projectile
    //% inlineInputMode=inline
    //% expandableArgumentMode=toggle
    //% vy.defl=100
    //% deprecated=true blockHidden=true
    export function createProjectile(img: Image, vx: number, vy: number, kind?: number, sprite?: Sprite) {
        const s = sprites.create(img, kind);
        const sc = game.currentScene();
        s.vx = vx
        s.vy = vy

        // put it at the edge of the screen so that it moves towards the middle
        // If the scene has a tile map, place the sprite fully on the screen

        const xOff = sc.tileMap ? -(s.width >> 1) : (s.width >> 1) - 1;
        const yOff = sc.tileMap ? -(s.height >> 1) : (s.height >> 1) - 1;

        while(vx == 0 && vy == 0) {
            vx = Math.randomRange(-100, 100);
            vy = Math.randomRange(-100, 100);
        }

        if (vx < 0)
            s.x = screen.width + xOff
        else if (vx > 0)
            s.x = -xOff

        if (vy < 0)
            s.y = screen.height + yOff
        else if (vy > 0)
            s.y = -yOff

        s.flags |= sprites.Flag.AutoDestroy;
        s.flags |= sprites.Flag.DestroyOnWall;

        if (sprite) {
            s.x = sprite.x;
            s.y = sprite.y;
        }

        return s
    }

    export enum Flag {
        Ghost = 1 << 0, // doesn't collide with other sprites
        Destroyed = 1 << 1,
        AutoDestroy = 1 << 2, // remove the sprite when no longer visible
        StayInScreen = 1 << 3, // sprite cannot move outside the camera region
        DestroyOnWall = 1 << 4, // destroy sprite on contact with wall
        BounceOnWall = 1 << 5, // Bounce on walls
        ShowPhysics = 1 << 6, // display position, velocity, acc
    }
}
