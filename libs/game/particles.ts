namespace particle {
    export let cachedSin: Fx8[];
    export let cachedCos: Fx8[];
    const TIME_PRECISION = 10; // down to the 1 << 10

    let lastUpdate: number;
    let sources: ParticleSource[];
    const galois = new Math.FastRandom(1234);
    const NUM_SLICES = 100;
    let angleSlice = 2 * Math.PI / NUM_SLICES;

    export class Particle {
        _x: Fx8;
        _y: Fx8;
        vx: Fx8;
        vy: Fx8;
        lifespan: number;
        data: number;
        next: Particle;
    }

    export interface ParticleAnchor {
        x: number;
        y: number;
    }

    export class ParticleFactory {
        constructor() {
            // Compiler errors if this doesn't exist
        }

        createParticle(anchor: ParticleAnchor): Particle {
            return mkParticle(Fx8(anchor.x), Fx8(anchor.y), 1500);
        }

        drawParticle(x: Fx8, y: Fx8, particle: Particle) {
            screen.setPixel(Fx.toInt(x), Fx.toInt(y), 1);
        }
    }

    let defaultFactory: ParticleFactory;

    export class ParticleSource implements SpriteLike {
        anchor: ParticleAnchor;

        protected enabled: boolean;
        protected head: Particle;
        protected timer: number;
        protected period: number;
        protected factory: ParticleFactory;
        protected ax: Fx8;
        protected ay: Fx8;

        z: number;
        id: number;

        _dt: number;

        constructor(anchor: ParticleAnchor, particlesPerSecond: number) {
            this.setRate(particlesPerSecond);
            this.setAnchor(anchor);
            this._dt = 0;
            this.setAcceleration(0, 0);

            if (!defaultFactory) defaultFactory = new ParticleFactory();

            this.factory = defaultFactory;
        }

        __update(camera: scene.Camera, dt: number) {
            // see _update()
        }

        __draw(camera: scene.Camera) {
            let current = this.head;
            const left = Fx8(camera.offsetX);
            const top = Fx8(camera.offsetY);

            while (current) {
                if (current.lifespan > 0) this.drawParticle(current, left, top);
                current = current.next;
            }
        }

        _update(dt: number) {
            this.timer -= dt;
            while (this.timer < 0 && this.enabled) {
                this.timer += this.period;
                const p = this.factory.createParticle(this.anchor);
                p.next = this.head;
                this.head = p;
            }

            if (!this.head) return;

            let current = this.head;

            this._dt += dt;

            let fixedDt = Fx8(this._dt);
            if (fixedDt) {
                do {
                    if (current.lifespan > 0) {
                        current.lifespan -= dt;
                        this.updateParticle(current, fixedDt)
                    }
                } while (current = current.next);
                this._dt = 0;
            }
            else {
                do {
                    current.lifespan -= dt;
                } while (current = current.next);
            }
        }

        _prune() {
            while (this.head && this.head.lifespan <= 0) {
                this.head = this.head.next;
            }

            let current = this.head;
            while (current && current.next) {
                if (current.next.lifespan <= 0) {
                    current.next = current.next.next;
                }
                else {
                    current = current.next;
                }
            }
        }

        setAcceleration(ax: number, ay: number) {
            this.ax = Fx8(ax);
            this.ay = Fx8(ay);
        }

        enable() {
            if (this.enabled) return;
            this.enabled = true;
            this.timer = 0;
            addSource(this);
        }

        disable() {
            if (!this.enabled) return;
            this.enabled = false;
        }

        setAnchor(anchor: ParticleAnchor) {
            this.anchor = anchor;
        }

        setRate(particlesPerSecond: number) {
            this.period = Math.ceil(1000 / particlesPerSecond);
            this.timer = 0;
        }

        setFactory(factory: ParticleFactory) {
            if (factory) this.factory = factory;
        }

        protected updateParticle(p: Particle, fixedDt: Fx8) {
            fixedDt = (fixedDt as any as number >> TIME_PRECISION) as any as Fx8;
            p.vx = Fx.add(p.vx, Fx.mul(this.ax, fixedDt));
            p.vy = Fx.add(p.vy, Fx.mul(this.ay, fixedDt));

            p._x = Fx.add(p._x, Fx.mul(p.vx, fixedDt));
            p._y = Fx.add(p._y, Fx.mul(p.vy, fixedDt));
            // p._y = Fx.add(p._y, Fx.mul(p.vx, fixedDt)); // for firework print this looks **REALLY** cool, make a varient that looks like this
        }

        protected drawParticle(p: Particle, screenLeft: Fx8, screenTop: Fx8) {
            this.factory.drawParticle(Fx.sub(p._x, screenLeft), Fx.sub(p._y, screenTop), p);
        }
    }

    export class SprayFactory extends ParticleFactory {
        protected speed: Fx8;
        protected minAngle: number;
        protected spread: number;

        constructor(speed: number, centerDegrees: number, arcDegrees: number) {
            super();
            initTrig();
            this.setSpeed(speed);
            this.setDirection(centerDegrees, arcDegrees);
        }

        createParticle(anchor: ParticleAnchor) {
            const p = super.createParticle(anchor);
            const angle = (this.minAngle + galois.randomRange(0, this.spread)) % NUM_SLICES;

            p.vx = Fx.mul(cachedSin[angle], this.speed);
            p.vy = Fx.mul(cachedCos[angle], this.speed);
            return p;
        }

        drawParticle(x: Fx8, y: Fx8, particle: Particle) {
            screen.setPixel(Fx.toInt(x), Fx.toInt(y), 1);
        }

        setSpeed(pixelsPerSecond: number) {
            this.speed = Fx8(pixelsPerSecond);
        }

        setDirection(centerDegrees: number, arcDegrees: number) {
            this.minAngle = (toRadians(centerDegrees - (arcDegrees >> 1)) / angleSlice) | 0;
            this.spread = (toRadians(arcDegrees) / angleSlice) | 0;
        }
    }

    function initTrig() {
        if (!cachedSin) {
            cachedSin = [];
            cachedCos = [];
            for (let i = 0; i < NUM_SLICES; i++) {
                cachedSin.push(Fx8(Math.sin(i * angleSlice)));
                cachedCos.push(Fx8(Math.cos(i * angleSlice)));
            }
        }
    }

    export function mkParticle(x: Fx8, y: Fx8, lifespan: number) {
        const p = new Particle();
        p._x = x;
        p._y = y;
        p.vx = Fx.zeroFx8;
        p.vy = Fx.zeroFx8;

        p.lifespan = lifespan;
        return p;
    }

    function init() {
        if (sources) return;
        sources = [];
        lastUpdate = control.millis();
        game.onUpdate(updateParticles);
        game.onUpdateInterval(500, pruneParticles);
    }

    function addSource(src: ParticleSource) {
        init();
        if (sources.indexOf(src) == -1) sources.push(src);
        game.currentScene().addSprite(src);
    }

    function removeSource(src: ParticleSource) {
        init();
        sources.removeElement(src);
        game.currentScene().allSprites.removeElement(src);
    }

    function updateParticles() {
        const time = control.millis();
        const dt = time - lastUpdate;
        lastUpdate = time;

        for (let i = 0; i < sources.length; i++) {
            sources[i]._update(dt);
        }
    }

    function pruneParticles() {
        for (let i = 0; i < sources.length; i++) {
            sources[i]._prune();
        }
    }

    const ratio = Math.PI / 180;
    function toRadians(degrees: number) {
        if (degrees < 0) degrees = 360 - (Math.abs(degrees) % 360);
        else degrees = degrees % 360;

        return degrees * ratio;
    }
}

/** 'test' / example cases, pending change / relocation **/

class FountainFactory extends particle.SprayFactory {
    galois: Math.FastRandom;

    constructor() {
        super(40, 180, 90)
        this.galois = new Math.FastRandom(1234);
    }

    createParticle(anchor: particle.ParticleAnchor) {
        const p = super.createParticle(anchor);
        p.data = this.galois.randomBool() ? 8 : 9;
        return p;
    }

    drawParticle(x: Fx8, y: Fx8, p: particle.Particle) {
        screen.setPixel(Fx.toInt(x), Fx.toInt(y), p.data);
    }
}

class AreaFactory extends particle.SprayFactory {
    xRange: number;
    yRange: number;
    galois: Math.FastRandom;

    constructor(xRange: number, yRange: number) {
        super(40, 0, 90);
        this.xRange = xRange;
        this.yRange = yRange;
        this.galois = new Math.FastRandom();
    }

    createParticle(anchor: particle.ParticleAnchor) {
        const p = super.createParticle(anchor);
        p.lifespan = this.galois.randomRange(150, 850);

        p._x = Fx.add(Fx8(this.galois.randomRange(0, this.xRange) - (this.xRange >> 1)), p._x);
        p._y = Fx.add(Fx8(this.galois.randomRange(0, this.yRange) - (this.yRange >> 1)), p._y);

        return p;
    }

    drawParticle(x: Fx8, y: Fx8, p: particle.Particle) {
        if (p.lifespan > 500) screen.setPixel(Fx.toInt(x), Fx.toInt(y), 4);
        else if (p.lifespan > 250) screen.setPixel(Fx.toInt(x), Fx.toInt(y), 5);
        else screen.setPixel(Fx.toInt(x), Fx.toInt(y), 1);
    }
}

function fireworkPrint(text: string, font: image.Font) {
    const lleft = (screen.width >> 1) - ((text.length * font.charWidth) >> 1);

    let chars: Sprite[] = [];
    const factory = new AreaFactory(font.charWidth, font.charHeight);

    const baseline = 55;

    for (let i = 0; i < text.length; i++) {
        const charSprite = sprites.create(image.create(font.charWidth, font.charHeight));
        charSprite.image.print(text.charAt(i), 0, 0, 1, font);
        charSprite.left = lleft + i * font.charWidth;
        charSprite.top = baseline;
        charSprite.z = 100;

        const source = new particle.ParticleSource(charSprite, 100);
        source.z = 0;
        source.setFactory(factory);
        source.setAcceleration(0, 100);
        source.enable();

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

class ImageFactory extends particle.SprayFactory {
    protected source: Image;
    protected ox: Fx8;
    protected oy: Fx8;

    constructor(source: Image) {
        super(0, 0, 0);
        this.source = source;
        this.ox = Fx8(this.source.width >> 1);
        this.oy = Fx8(this.source.height >> 1);
    }

    drawParticle(x: Fx8, y: Fx8, p: particle.Particle) {
        screen.drawImage(this.source,
                Fx.toInt(Fx.sub(x, this.ox)),
                Fx.toInt(Fx.sub(y, this.oy))
        );
    }
}

function mkImageParticle(anchor: particle.ParticleAnchor, pImage: Image) {
    const source = new particle.ParticleSource(anchor, 100);
    const factory = new ImageFactory(pImage);

    factory.setDirection(30, 45);
    factory.setSpeed(30);
    source.setFactory(factory);

    return source;
}

function mkImageArrayParticle(anchor: particle.ParticleAnchor, pImages: Image[]) {
    const source = new particle.ParticleSource(anchor, 60);
    const factory = new ImageArrayFactory(screen.width, 10, pImages);

    // factory.setDirection(0, 180)
    factory.setSpeed(30)
    source.setFactory(factory);

    return source;
}

class ImageArrayFactory extends particle.SprayFactory {
    protected source: Image[];
    protected xRange: number;
    protected yRange: number;
    protected galois: Math.FastRandom;

    constructor(xRange: number, yRange: number, source: Image[]) {
        super(40, 0, 90);
        this.source = source;
        this.xRange = xRange;
        this.yRange = yRange;
        this.galois = new Math.FastRandom();
    }

    drawParticle(x: Fx8, y: Fx8, p: particle.Particle) {
        let pImage = this.source[this.galois.randomRange(0, this.source.length - 1)].clone();
        pImage.replace(1, p.data);
        screen.drawImage(pImage, Fx.toInt(x), Fx.toInt(y));
    }

    createParticle(anchor: particle.ParticleAnchor) {
        const p = super.createParticle(anchor);
        p.data = this.galois.randomRange(1, 14);
        p.lifespan = this.galois.randomRange(1000, 4500);
        p._x = Fx.add(Fx8(this.galois.randomRange(0, this.xRange) - (this.xRange >> 1)), p._x);
        p._y = Fx.add(Fx8(this.galois.randomRange(0, this.yRange) - (this.yRange >> 1)), p._y);
        return p;
    }
}


function sprayTest() {
    for (let i = 0; i < 5; i++) {
        const testsprite = sprites.create(img`1`);
        testsprite.x = 20 + i * 25;
        controller.moveSprite(testsprite, 100, 100);

        const src = mkImageParticle(testsprite, img`
            1 1 1
            1 1 1
            1 1 1
        `);
        src.enable();
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => src.enable());
        controller.B.onEvent(ControllerButtonEvent.Pressed, () => src.disable());
    }
}

function fountainTest() {
    const testsprite = sprites.create(img`1`);
    controller.moveSprite(testsprite, 100, 100);
    const src = new particle.ParticleSource(testsprite, 100);
    src.setFactory(new FountainFactory());
    src.setAcceleration(0, 40);
    src.enable();
    controller.A.onEvent(ControllerButtonEvent.Pressed, () => src.enable());
    controller.B.onEvent(ControllerButtonEvent.Pressed, () => src.disable());
}


// confetti
function winConfetti() {
    const confImages = [
            img`
            1
        `,
            img`
            1
            1
        `,
            img`
            1 1
        `,
            img`
            1 1
            1 .
        `,
            img`
            1 1
            . 1
    `];
    const src = mkImageArrayParticle({
        x: screen.width / 2,
        y: 0
    }, confImages);

    src.enable();
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
    controller.A.onEvent(ControllerButtonEvent.Pressed, () => src.enable());
    controller.B.onEvent(ControllerButtonEvent.Pressed, () => src.disable());
}