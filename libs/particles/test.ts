/** 'test' / example cases, pending change / relocation **/

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

    drawParticle(x: Fx8, y: Fx8, p: particles.Particle) {
        screen.setPixel(Fx.toInt(x), Fx.toInt(y), p.data);
    }
}

class AreaFactory extends particles.SprayFactory {
    xRange: number;
    yRange: number;
    galois: Math.FastRandom;

    constructor(xRange: number, yRange: number) {
        super(40, 0, 90);
        this.xRange = xRange;
        this.yRange = yRange;
        this.galois = new Math.FastRandom();
    }

    createParticle(anchor: particles.ParticleAnchor) {
        const p = super.createParticle(anchor);
        p.lifespan = this.galois.randomRange(150, 850);

        p._x = Fx.add(Fx8(this.galois.randomRange(0, this.xRange) - (this.xRange >> 1)), p._x);
        p._y = Fx.add(Fx8(this.galois.randomRange(0, this.yRange) - (this.yRange >> 1)), p._y);

        return p;
    }

    drawParticle(x: Fx8, y: Fx8, p: particles.Particle) {
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

        const source = new particles.ParticleSource(charSprite, 100);
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

class ImageFactory extends particles.SprayFactory {
    protected source: Image;
    protected ox: Fx8;
    protected oy: Fx8;

    constructor(source: Image) {
        super(0, 0, 0);
        this.source = source;
        this.ox = Fx8(this.source.width >> 1);
        this.oy = Fx8(this.source.height >> 1);
    }

    drawParticle(x: Fx8, y: Fx8, p: particles.Particle) {
        screen.drawImage(this.source,
                Fx.toInt(Fx.sub(x, this.ox)),
                Fx.toInt(Fx.sub(y, this.oy))
        );
    }
}

function mkImageParticle(anchor: particles.ParticleAnchor, pImage: Image) {
    const source = new particles.ParticleSource(anchor, 100);
    const factory = new ImageFactory(pImage);

    factory.setDirection(30, 45);
    factory.setSpeed(30);
    source.setFactory(factory);

    return source;
}

function mkImageArrayParticle(anchor: particles.ParticleAnchor, pImages: Image[]) {
    const source = new particles.ParticleSource(anchor, 60);
    const factory = new ImageArrayFactory(screen.width, 10, pImages);

    // factory.setDirection(0, 180)
    factory.setSpeed(30)
    source.setFactory(factory);

    return source;
}

class ImageArrayFactory extends particles.SprayFactory {
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

    drawParticle(x: Fx8, y: Fx8, p: particles.Particle) {
        let pImage = this.source[this.galois.randomRange(0, this.source.length - 1)].clone();
        pImage.replace(1, p.data);
        screen.drawImage(pImage, Fx.toInt(x), Fx.toInt(y));
    }

    createParticle(anchor: particles.ParticleAnchor) {
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
    const src = new particles.ParticleSource(testsprite, 100);
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