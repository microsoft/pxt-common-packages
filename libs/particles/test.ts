
//particles.confetti.winConfetti();
// particles.print.fireworkPrint("hello", image.font5);
// particles.fireworks.runFireworks();
// particles.fountain.runFountain();
// particles.trail.runTrail();
// particles.fire.runTorch();
// particles.spiral.runSpiral();
// Space pong: See bottom of screen

/*
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
        const s = sprites.create(img`1`);
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

namespace particles.fire {
    const NUM_SLICES = 300;
    let cachedSin: Fx8[];
    let cachedCos: Fx8[];

    function initTrig() {
        if (!cachedSin) {
            cachedSin = particles.cacheSin(NUM_SLICES);
            cachedCos = particles.cacheCos(NUM_SLICES);
        }
    }

    class FlameFactory extends particles.ParticleFactory {
        protected galois: Math.FastRandom;
        protected minRadius: number;
        protected maxRadius: number;

        constructor(radius: number) {
            super();
            initTrig();
            this.galois = new Math.FastRandom();
            this.minRadius = radius >> 1;
            this.maxRadius = radius;
        }

        createParticle(anchor: particles.ParticleAnchor) {
            const p = super.createParticle(anchor);
            p.data = this.galois.randomBool() ?
                2 : this.galois.randomBool() ?
                    4 : 5 // 50% 2, otherwise 50% 4 or 5

            const i = this.galois.randomRange(0, cachedCos.length);
            const r = this.galois.randomRange(this.minRadius, this.maxRadius);
            p._x = Fx.iadd(anchor.x, Fx.mul(Fx8(r), cachedCos[i]));
            p._y = Fx.iadd(anchor.y, Fx.mul(Fx8(r), cachedSin[i]));
            p.vy = Fx8(Math.randomRange(0, 10));
            p.vx = Fx8(Math.randomRange(-5, 5))

            return p;
        }

        drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
            screen.setPixel(Fx.toInt(p._x), Fx.toInt(p._y), p.data);
        }
    }

    class FireSource extends particles.ParticleSource {
        private galois: Math.FastRandom;
        constructor(anchor: particles.ParticleAnchor, particlesPerSecond: number, factory?: particles.ParticleFactory) {
            super(anchor, particlesPerSecond, factory);
            this.galois = new Math.FastRandom();
            this.z = 20;
        }

        updateParticle(p: particles.Particle, fixedDt: Fx8) {
            super.updateParticle(p, fixedDt);
            if (p.next && this.galois.percentChance(30)) {
                p.vx = p.next.vx;
                p.vy = p.next.vy;
            }
        }
    }

    function mkFireSource(a: particles.ParticleAnchor) {
        const factory = new FlameFactory(5);
        const src = new FireSource(a, 100, factory);
        src.setAcceleration(0, -20)

        controller.A.onEvent(ControllerButtonEvent.Pressed,
            () => src.enabled = !src.enabled
        );
        return src;
    }

    export function runTorch() {
        let s = sprites.create(img`
            e e e
            e d e
            e d e
            e d e
            e e e
            e e d
            e e e
            d e e
            e e e
            d e e
            e e d
            e e d
            e e e
            e e e
        `)
        // need to offset sprite to make it look 'right', so this isn't attached to 
        s.y += 7;
        s.x += 1;

        mkFireSource({ x: screen.width / 2, y: screen.height / 2 })
    }
}

namespace particles.spiral {
    const NUM_SLICES = 300;
    let cachedSin: Fx8[];
    let cachedCos: Fx8[];

    function initTrig() {
        if (!cachedSin) {
            cachedSin = particles.cacheSin(NUM_SLICES);
            cachedCos = particles.cacheCos(NUM_SLICES);
        }
    }

    class CircleFactory extends particles.ParticleFactory {
        protected r: Fx8;
        protected speed: Fx8;
        protected t: number;
        protected spread: number;
        protected galois: Math.FastRandom;

        constructor(radius: number, speed: number, spread: number) {
            super();
            initTrig();

            this.setRadius(radius)
            this.speed = Fx8(-speed);
            this.spread = spread;
            this.t = 0;
            this.galois = new Math.FastRandom();
        }

        createParticle(anchor: particles.ParticleAnchor) {
            const p = super.createParticle(anchor);
            const time = ++this.t % cachedCos.length;
            const offsetTime = (time + this.galois.randomRange(0, this.spread)) % cachedCos.length;

            p._x = Fx.iadd(anchor.x, Fx.mul(this.r, cachedCos[time]));
            p._y = Fx.iadd(anchor.y, Fx.mul(this.r, cachedSin[time]));
            p.vx = Fx.mul(this.speed, cachedSin[offsetTime]);
            p.vy = Fx.mul(this.speed, Fx.neg(cachedCos[offsetTime]));

            p.lifespan = this.galois.randomRange(200, 1500);
            p.data = this.galois.randomRange(6, 0xb)
            // p.data = this.galois.randomRange(1, 15); // rainbow mode

            return p;
        }

        drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
            screen.setPixel(Fx.toInt(p._x), Fx.toInt(p._y), p.data);
        }

        setRadius(r: number) {
            this.r = Fx8(r >> 1);
        }

        setSpeed(s: number) {
            this.speed = Fx8(s);
        }

        setSpread(s: number) {
            this.spread = s;
        }
    }

    function mkCircleSource(a: particles.ParticleAnchor) {
        const factory = new CircleFactory(0, 60, 20);
        const src = new particles.ParticleSource(a, 500, factory);
        // src.setAcceleration(1000, 1000) // swirl designs
        controller.A.onEvent(ControllerButtonEvent.Pressed,
            () => src.enabled = !src.enabled
        );
        return src;
    }

    export function runSpiral() {
        mkCircleSource({ x: screen.width / 2, y: screen.height / 2 });
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

*/