
// particles.test.print.fireworkPrint("hello", image.font5);
// particles.test.fireworks.runFireworks();
// particles.test.spacepong.runSpacePong();

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

namespace particles.test.spacepong {
    enum SpriteKind {
        Player,
        Enemy,
        Ball,
        Food,
        Projectile
    }

    export function runSpacePong() {
        let currentBall: Sprite = null
        let sprite: Sprite = null
        sprites.onCreated(SpriteKind.Ball, function (sprite) {
            sprite.setImage(sprites.space.spaceAsteroid0)
            particles.trail.start(sprite, 40)
            sprite.z = 5;
            if (Math.percentChance(50)) {
                sprite.vx = -50
            } else {
                sprite.vx = 50
            }
            sprite.vy = Math.randomRange(-50, 50)
            sprite.setFlag(SpriteFlag.BounceOnWall, true)
            currentBall = sprite
        })
        sprites.onOverlap(SpriteKind.Player, SpriteKind.Ball, function (sprite, otherSprite) {
            particles.ashes.start(currentBall, 200)
            otherSprite.vx = otherSprite.vx * -1.1
            otherSprite.vy += sprite.vy * 0.33
            pause(200)
        })
        info.player1.setScore(0)
        info.player2.setScore(0)
        let sprite1 = sprites.create(img`
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        2 2 2 2 2 . . . . . . . . . . .
        `, SpriteKind.Player);
        controller.moveSprite(sprite1, 0, 100);
        sprite1.x = 0;
        sprite1.setFlag(SpriteFlag.StayInScreen, true)
        let sprite2 = sprites.create(img`
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        . . . . . . . . . . . 8 8 8 8 8
        `, SpriteKind.Player);
        controller.player2.moveSprite(sprite2, 0, 100);
        sprite2.x = scene.screenWidth()
        sprite2.setFlag(SpriteFlag.StayInScreen, true)
        currentBall = sprites.create(img`1`, SpriteKind.Ball)
        game.onUpdate(function () {
            if (currentBall.left <= 0) {
                currentBall.destroy()
                info.player2.changeScoreBy(1)
                currentBall = sprites.create(img`1`, SpriteKind.Ball)
            } else if (currentBall.right >= scene.screenWidth()) {
                currentBall.destroy()
                info.player1.changeScoreBy(1)
                currentBall = sprites.create(img`1`, SpriteKind.Ball)
            }
        })
    }
}