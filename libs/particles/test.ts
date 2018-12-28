
// particles.test.print.fireworkPrint("hello", image.font5);
// particles.test.fireworks.runFireworks();
// Space pong: See bottom of screen

namespace particles.test.print {
    export function fireworkPrint(text: string, font: image.Font) {
        const lleft = (screen.width >> 1) - ((text.length * font.charWidth) >> 1);

        let chars: Sprite[] = [];
        const factory = new particles.AreaFactory(font.charWidth, font.charHeight);

        const baseline = 55;

        for (let i = 0; i < text.length; i++) {
            const charSprite = sprites.create(image.create(font.charWidth, font.charHeight));
            charSprite.image.print(text.charAt(i), 0, 0, 1, font);
            charSprite.left = lleft + i * font.charWidth;
            charSprite.top = baseline;
            charSprite.z = 100;

            const source = new particles.ParticleSource(charSprite, 100, factory);
            source.z = 0;
            source.setAcceleration(0, 100);
            source.enabled = true;

            chars.push(charSprite);
        }

        let lt = control.millis();
        const slice = Math.PI / 6;

        game.onUpdate(function () {
            let time = control.millis();
            let dt = time - lt;
            lt = time;

            for (let i = 0; i < chars.length; i++) {
                chars[i].y = baseline + (Math.sin(slice * (i + (time >> 5))) * 3);
            }
        })
    }
}

namespace particles.test.fireworks {
    enum SpriteKind {
        Player,
        Projectile
    }

    export function runFireworks() {
        controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
            const s = sprites.createProjectileFromSide(img`
            2
            2
            `, 0, -100);
            s.data = new particles.ParticleSource(s, 50, new particles.SprayFactory(30, 0, 50));
            s.x = Math.randomRange(0, screen.width);
            s.lifespan = Math.randomRange(250, 1000)
        })

        sprites.onDestroyed(SpriteKind.Projectile, (s) => {
            if (s.data) (s.data as particles.ParticleSource).destroy();
            control.runInParallel(function () {
                const src = new particles.ParticleSource(s, 150, new particles.SprayFactory(100, 0, 359));
                pause(200);
                src.destroy();
            })
        });
    }
}

// space pong: requires local multiplayer, so commented out

// enum SpriteKind {
//     Player,
//     Enemy,
//     Ball,
//     Food,
//     Projectile
// }
// function mkTrailSource(sprite: Sprite) { // create a source attached to mysprite
//     const factory = new particles.TrailFactory(sprite, 1, 800);
//     const src = new particles.ParticleSource(sprite, 50, factory)
//     return src;
// }

// let currentBall: Sprite = null
// let sprite: Sprite = null
// let trail: particles.ParticleSource; // track trail
// sprites.onCreated(SpriteKind.Ball, function (sprite) {
//     sprite.setImage(sprites.space.spaceAsteroid0)
//     if (trail) trail.destroy(); // destroy previous trail
//     trail = mkTrailSource(sprite) // create new trail
//     sprite.z = 5;
//     if (Math.percentChance(50)) {
//         sprite.vx = -50
//     } else {
//         sprite.vx = 50
//     }
//     // sprite.z = 20;
//     sprite.vy = Math.randomRange(-50, 50)
//     sprite.setFlag(SpriteFlag.BounceOnWall, true)
//     currentBall = sprite
// })
// sprites.onOverlap(SpriteKind.Player, SpriteKind.Ball, function (sprite, otherSprite) {
//     otherSprite.vx = otherSprite.vx * -1.1
//     otherSprite.vy += sprite.vy * 0.33
//     pause(200)
// })
// info.setPlayerScore(PlayerNumber.One, 0)
// info.setPlayerScore(PlayerNumber.Two, 0)
// controller.setPlayerSprite(PlayerNumber.One, sprites.create(img`
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// 2 2 2 2 2 . . . . . . . . . . . 
// `, SpriteKind.Player))
// controller.movePlayer(PlayerNumber.One, 0, 100)
// controller.playerSprite(PlayerNumber.One).x = 0
// controller.playerSprite(PlayerNumber.One).setFlag(SpriteFlag.StayInScreen, true)
// controller.setPlayerSprite(PlayerNumber.Two, sprites.create(img`
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// . . . . . . . . . . . 8 8 8 8 8 
// `, SpriteKind.Player))
// controller.movePlayer(PlayerNumber.Two, 0, 100)
// controller.playerSprite(PlayerNumber.Two).x = scene.screenWidth()
// controller.playerSprite(PlayerNumber.Two).setFlag(SpriteFlag.StayInScreen, true)
// currentBall = sprites.create(img`1`, SpriteKind.Ball)
// game.onUpdate(function () {
//     if (currentBall.left <= 0) {
//         currentBall.destroy()
//         info.changePlayerScoreBy(PlayerNumber.Two, 1)
//         currentBall = sprites.create(img`1`, SpriteKind.Ball)
//     } else if (currentBall.right >= scene.screenWidth()) {
//         currentBall.destroy()
//         info.changePlayerScoreBy(PlayerNumber.One, 1)
//         currentBall = sprites.create(img`1`, SpriteKind.Ball)
//     }
// })