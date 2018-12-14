/** 'test' / example cases, pending change / relocation **/

function fireworkPrint(text: string, font: image.Font) {
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

    drawParticle(p: particles.Particle, x: Fx8, y: Fx8) {
        screen.drawImage(this.source,
            Fx.toInt(Fx.sub(x, this.ox)),
            Fx.toInt(Fx.sub(y, this.oy))
        );
    }
}

function mkImageSource(anchor: particles.ParticleAnchor, pImage: Image) {
    const source = new particles.ParticleSource(anchor, 100);
    const factory = new ImageFactory(pImage);

    factory.setDirection(30, 45);
    factory.setSpeed(30);
    source.setFactory(factory);

    return source;
}

function sprayTest() {
    for (let i = 0; i < 5; i++) {
        const testsprite = sprites.create(img`1`);
        testsprite.x = 20 + i * 25;
        controller.moveSprite(testsprite, 100, 100);

        const src = mkImageSource(testsprite, img`
            1 1 1
            1 1 1
            1 1 1
        `);
        src.enabled = true
        controller.A.onEvent(ControllerButtonEvent.Pressed, () => src.enabled = !src.enabled);
    }
}

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
function fountainTest() {
    const testsprite = sprites.create(img`1`);
    controller.moveSprite(testsprite, 100, 100);
    const src = new particles.ParticleSource(testsprite, 100);
    src.setFactory(new FountainFactory());
    src.setAcceleration(0, 40);
    src.enabled = true
    controller.A.onEvent(ControllerButtonEvent.Pressed, () => src.enabled = !src.enabled);
}

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
function winConfetti() {
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

// fireworkPrint("hello", image.font5);

winConfetti();