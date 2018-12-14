
particles.confetti.winConfetti();
// particles.print.fireworkPrint("hello", image.font5);
// particles.fireworks.runFireworks();
// particles.fountain.runFountain();
// particles.trail.runTrail();
// Space pong: See bottom of screen

namespace particles.print {
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

namespace particles.trail {
    enum SpriteKind {
        Player,
        Projectile,
        Food,
        Enemy
    }
    
    function mkTrailSource(sprite: Sprite) {
        // first, create a factory that outputs a trail
        const factory = new particles.TrailFactory(sprite, 1, 800);
        // then attach that trail to a new source
        const src = new particles.ParticleSource(sprite, 50, factory);
        return src;
    }
    
    export function runTrail(): Sprite {
        const s = sprites.create(sprites.castle.heroFrontAttack1, SpriteKind.Player);
        controller.moveSprite(s);
        mkTrailSource(s);
        return s;
    }
}

namespace particles.fountain {
    class FountainFactory extends particles.SprayFactory {
        galois: Math.FastRandom;

        constructor() {
            super(40, 180, 90)
            this.galois = new Math.FastRandom(1234);
        }

        createParticle(anchor: particles.ParticleAnchor) {
            const p = super.createParticle(anchor);
            p.data = this.galois.randomBool() ? 8 : 9;
            return p;
        }

        drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
            screen.setPixel(Fx.toInt(x), Fx.toInt(y), p.data);
        }
    }

    export function runFountain() {
        const testsprite = sprites.create(img`1`);
        controller.moveSprite(testsprite, 100, 100);
        const src = new particles.ParticleSource(testsprite, 100);
        src.setFactory(new FountainFactory());
        src.setAcceleration(0, 40);
        src.enabled = true
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => src.enabled = !src.enabled);
    }
}

namespace particles.confetti {
    /**
     * A factory for creating particles with the provided shapes.
     */
    class ShapeFactory extends particles.AreaFactory {
        protected sources: Image[];
        protected ox: Fx8;
        protected oy: Fx8;

        constructor(xRange: number, yRange: number, source: Image) {
            super(xRange, yRange);
            this.sources = [source];

            // Base offsets off of initial shape
            this.ox = Fx8(source.width >> 1);
            this.oy = Fx8(source.height >> 1);
        }

        /**
         * Add another possible shape for a particle to display
         * @param shape 
         */
        addShape(shape: Image) {
            if (shape) this.sources.push(shape);
        }

        drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
            const pImage = this.galois.pickRandom(this.sources).clone();
            pImage.replace(0xF, p.data);

            screen.drawImage(pImage,
                Fx.toInt(Fx.sub(x, this.ox)),
                Fx.toInt(Fx.sub(y, this.oy))
            );
        }

        createParticle(anchor: particles.ParticleAnchor) {
            const p = super.createParticle(anchor);

            p.data = this.galois.randomRange(1, 14);
            p.lifespan = this.galois.randomRange(1000, 4500);
            return p;
        }
    }

    function mkShapeSource(anchor: particles.ParticleAnchor, pImages: Image[]) {
        if (!pImages || pImages.length == 0) return undefined;

        const factory = new ShapeFactory(screen.width, 10, pImages[0]);
        for (let i = 1; i < pImages.length; i++) {
            factory.addShape(pImages[i]);
        }

        // factory.setDirection(0, 180)
        factory.setSpeed(30);

        const source = new particles.ParticleSource(anchor, 60, factory);

        return source;
    }

    // confetti
    export function winConfetti() {
        const confImages = [
            img`
                F
            `,
            img`
                F
                F
            `,
            img`
                F F
            `,
            img`
                F F
                F .
            `,
            img`
                F F
                . F
        `];
        const src = mkShapeSource({
            x: screen.width / 2,
            y: 0
        }, confImages);

        src.enabled = true;
        // dup game over printing for test
        game.onPaint(function () {
            const top = (screen.height - 44) >> 1;
            screen.fillRect(0, top, screen.width, 44, 0);
            screen.drawLine(0, top, screen.width, top, 1);
            screen.drawLine(0, top + 44 - 1, screen.width, top + 44 - 1, 1);
            screen.printCenter("You win!", 48, 0x5, image.font8);
            screen.printCenter("Score:" + 1, top + 20, screen.isMono ? 1 : 2, image.font5);
            screen.printCenter("HI" + 42, top + 28, screen.isMono ? 1 : 2, image.font5);
        })
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => src.enabled = !src.enabled);
    }

}

namespace particles.fireworks {
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