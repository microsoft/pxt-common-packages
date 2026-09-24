namespace box2dblocks {
    export class Destroyable {
        constructor() {}

        destroy(): void {
            // subclass
        }
    }

    export class _CollisionHandler {
        constructor(
            public kind: number,
            public otherKind: number,
            public handler: (body: Body, otherBody: Body) => void
        ) {}
    }

    export class _CollisionRule {
        constructor(
            public kindA: number,
            public kindB: number
        ) {}
    }

    export class _FixtureDrawing {
        constructor(
            public fixture: box2d.Fixture,
            public shape: PhysicsShape
        ) {}
    }

    export class _SceneState {
        public world = new box2d.World(0, 10);
        public bodies: Body[] = [];
        public mouseJoints: MouseJoint[] = [];
        public handlers: _CollisionHandler[] = [];
        public activePairs: string[] = [];
        public speed = 1;
        public paused = false;
        public gravityX = 0;
        public gravityY = 10;
        private disabledCollisions: _CollisionRule[] = [];
        private filteredKinds: number[] = [];
        private accumulator = 0;
        private nextBodyId = 1;
        private lastUpdate = game.runtime();

        constructor() {
            game.eventContext().registerFrameHandler(scene.PHYSICS_PRIORITY, () => this.update());
            scene.createRenderable(scene.SPRITE_Z, (target, camera) => this.draw(target, camera));
        }

        createBody(type: box2d.BodyType, x: number, y: number, angle: number, kind: number): Body {
            const body = new Body(
                this.world.createBody(type, x / PIXELS_PER_METER, y / PIXELS_PER_METER, angle),
                this.nextBodyId++,
                kind,
                type,
                this
            );
            this.bodies.push(body);
            return body;
        }

        removeBody(body: Body): void {
            this.bodies.removeElement(body);
        }

        setGravity(x: number, y: number): void {
            this.gravityX = x;
            this.gravityY = y;
            this.world.setGravity(x, y);
        }

        setKindsCollide(kindA: number, kindB: number, collide: boolean): void {
            if (kindA != Math.floor(kindA) || kindB != Math.floor(kindB))
                throw "Box2D body kinds must be integers.";
            const low = Math.min(kindA, kindB);
            const high = Math.max(kindA, kindB);
            let ruleIndex = -1;
            for (let i = 0; i < this.disabledCollisions.length; ++i) {
                const rule = this.disabledCollisions[i];
                if (rule.kindA == low && rule.kindB == high) {
                    ruleIndex = i;
                    break;
                }
            }

            if (!collide && ruleIndex < 0) {
                const kinds = this.filteredKinds.slice();
                if (kinds.indexOf(low) < 0) kinds.push(low);
                if (kinds.indexOf(high) < 0) kinds.push(high);
                if (kinds.length > 15)
                    throw "Too many Box2D body kinds have custom collision rules.";
                this.disabledCollisions.push(new _CollisionRule(low, high));
            }
            else if (collide && ruleIndex >= 0) {
                this.disabledCollisions.removeAt(ruleIndex);
            }
            else {
                return;
            }

            this.rebuildCollisionFilters();
        }

        updateBodyFilter(body: Body): void {
            const filter = this.filterForKind(body.kind);
            for (let i = 0; i < body.fixtures.length; ++i)
                body.fixtures[i].fixture.setCategoryMask(filter[0], filter[1]);
        }

        configureFixture(body: Body, fixture: box2d.Fixture): void {
            const filter = this.filterForKind(body.kind);
            fixture.setCategoryMask(filter[0], filter[1]);
        }

        private rebuildCollisionFilters(): void {
            this.filteredKinds = [];
            for (let i = 0; i < this.disabledCollisions.length; ++i) {
                const rule = this.disabledCollisions[i];
                if (this.filteredKinds.indexOf(rule.kindA) < 0)
                    this.filteredKinds.push(rule.kindA);
                if (this.filteredKinds.indexOf(rule.kindB) < 0)
                    this.filteredKinds.push(rule.kindB);
            }
            for (let i = 0; i < this.bodies.length; ++i)
                this.updateBodyFilter(this.bodies[i]);
        }

        private filterForKind(kind: number): number[] {
            const index = this.filteredKinds.indexOf(kind);
            if (index < 0)
                return [1, 65535];

            const category = Math.pow(2, index + 1);
            let mask = 1;
            for (let i = 0; i < this.filteredKinds.length; ++i) {
                if (this.kindsCollide(kind, this.filteredKinds[i]))
                    mask += Math.pow(2, i + 1);
            }
            return [category, mask];
        }

        private kindsCollide(kindA: number, kindB: number): boolean {
            const low = Math.min(kindA, kindB);
            const high = Math.max(kindA, kindB);
            for (let i = 0; i < this.disabledCollisions.length; ++i) {
                const rule = this.disabledCollisions[i];
                if (rule.kindA == low && rule.kindB == high)
                    return false;
            }
            return true;
        }

        addMouseJoint(joint: MouseJoint): MouseJoint {
            this.mouseJoints.push(joint);
            return joint;
        }

        removeMouseJoint(joint: MouseJoint): void {
            this.mouseJoints.removeElement(joint);
        }

        destroyMouseJointsForBody(body: Body): void {
            for (let i = this.mouseJoints.length - 1; i >= 0; --i) {
                if (this.mouseJoints[i].body == body)
                    this.mouseJoints[i].destroy();
            }
        }

        findFixture(handle: box2dNative.Handle): Body {
            for (let i = 0; i < this.bodies.length; ++i) {
                const body = this.bodies[i];
                for (let j = 0; j < body.fixtures.length; ++j) {
                    if (body.fixtures[j].fixture.handle == handle)
                        return body;
                }
            }
            return null;
        }

        update(): void {
            const now = game.runtime();
            const elapsed = Math.min((now - this.lastUpdate) / 1000, STEP * MAX_STEPS);
            this.lastUpdate = now;
            for (let i = this.mouseJoints.length - 1; i >= 0; --i)
                this.mouseJoints[i].update();
            if (this.paused || this.speed <= 0) return;

            this.accumulator += elapsed * this.speed;
            this.accumulator = Math.min(this.accumulator, STEP * MAX_STEPS);
            let steps = 0;
            while (this.accumulator >= STEP && steps < MAX_STEPS) {
                this.world.step(STEP);
                this.accumulator -= STEP;
                ++steps;
            }
            if (steps)
                this.dispatchCollisions();
        }

        dispatchCollisions(): void {
            const contacts = this.world.getContacts();
            const pairs: string[] = [];
            for (let i = 0; i < contacts.length; ++i) {
                const contact = contacts[i];
                const bodyA = this.findFixture(contact.fixtureA.handle);
                const bodyB = this.findFixture(contact.fixtureB.handle);
                if (!bodyA || !bodyB || bodyA == bodyB || bodyA.destroyed || bodyB.destroyed)
                    continue;
                const low = Math.min(bodyA.id, bodyB.id);
                const high = Math.max(bodyA.id, bodyB.id);
                const key = low + ":" + high;
                if (pairs.indexOf(key) >= 0) continue;
                pairs.push(key);
                if (this.activePairs.indexOf(key) < 0)
                    this.raiseCollision(bodyA, bodyB);
            }
            this.activePairs = pairs;
        }

        raiseCollision(bodyA: Body, bodyB: Body): void {
            const handlers = this.handlers.slice();
            for (let i = 0; i < handlers.length; ++i) {
                const entry = handlers[i];
                if (entry.kind == bodyA.kind && entry.otherKind == bodyB.kind)
                    entry.handler(bodyA, bodyB);
                else if (entry.kind == bodyB.kind && entry.otherKind == bodyA.kind)
                    entry.handler(bodyB, bodyA);
            }
        }

        draw(target: Image, camera: scene.Camera): void {
            for (let i = 0; i < this.bodies.length; ++i) {
                const body = this.bodies[i];
                if (body.destroyed || !body.nativeBody.valid) continue;
                const state = body.nativeBody.getState();
                for (let j = 0; j < body.fixtures.length; ++j)
                    drawFixture(target, camera, state, body.fixtures[j]);
            }
        }

        destroy(): void {
            while (this.mouseJoints.length)
                this.mouseJoints[0].destroy();
            if (this.world && this.world.valid)
                this.world.destroy();
            for (let i = 0; i < this.bodies.length; ++i) {
                this.bodies[i].destroyed = true;
                this.bodies[i].fixtures = [];
            }
            this.bodies = [];
            this.handlers = [];
            this.activePairs = [];
            this.disabledCollisions = [];
            this.filteredKinds = [];
        }
    }

    let stateStack: _SceneState[];

    function init(): void {
        if (stateStack) return;
        stateStack = [new _SceneState()];

        game.addScenePushHandler(function () {
            stateStack.push(new _SceneState());
        });
        game.addScenePopHandler(function () {
            if (stateStack.length)
                stateStack[stateStack.length - 1].destroy();
            stateStack.pop();

            if (!stateStack.length)
                stateStack.push(new _SceneState());
        });
    }

    export function _state(): _SceneState {
        init();

        return stateStack[stateStack.length - 1];
    }

    function screenX(camera: scene.Camera, worldX: number): number {
        return Math.round(worldX * PIXELS_PER_METER - camera.drawOffsetX);
    }

    function screenY(camera: scene.Camera, worldY: number): number {
        return Math.round(worldY * PIXELS_PER_METER - camera.drawOffsetY);
    }

    function drawFixture(target: Image, camera: scene.Camera, state: box2d.BodySnapshot, fixture: _FixtureDrawing): void {
        const shape = fixture.shape;
        const values = shape.values;
        if (shape.type == ShapeType.Circle) {
            const x = screenX(camera, pointX(state, values[1], values[2]));
            const y = screenY(camera, pointY(state, values[1], values[2]));
            const radius = Math.round(values[0] * PIXELS_PER_METER);
            if (fixture.shape.fillColor) target.fillCircle(x, y, radius, fixture.shape.fillColor);
            if (fixture.shape.outlineColor) target.drawCircle(x, y, radius, fixture.shape.outlineColor);
            return;
        }

        let points: number[];
        if (shape.type == ShapeType.Box) {
            const halfWidth = values[0], halfHeight = values[1];
            const centerX = values[2], centerY = values[3], angle = values[4];
            const cosine = Math.cos(angle), sine = Math.sin(angle);
            points = [];
            const corners = [-1, -1, 1, -1, 1, 1, -1, 1];
            for (let i = 0; i < corners.length; i += 2) {
                const x = corners[i] * halfWidth;
                const y = corners[i + 1] * halfHeight;
                points.push(centerX + cosine * x - sine * y);
                points.push(centerY + sine * x + cosine * y);
            }
        } else {
            points = values;
        }

        const pixels: number[] = [];
        for (let i = 0; i < points.length; i += 2) {
            pixels.push(screenX(camera, pointX(state, points[i], points[i + 1])));
            pixels.push(screenY(camera, pointY(state, points[i], points[i + 1])));
        }

        if (fixture.shape.fillColor && (shape.type == ShapeType.Box || shape.type == ShapeType.Polygon)) {
            for (let i = 2; i < pixels.length - 2; i += 2) {
                target.fillTriangle(
                    pixels[0], pixels[1],
                    pixels[i], pixels[i + 1],
                    pixels[i + 2], pixels[i + 3],
                    fixture.shape.fillColor
                );
            }
        }
        if (fixture.shape.outlineColor) {
            for (let i = 0; i < pixels.length - 2; i += 2)
                target.drawLine(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3], fixture.shape.outlineColor);
            if (shape.type == ShapeType.Box || shape.type == ShapeType.Polygon || shape.loop)
                target.drawLine(
                    pixels[pixels.length - 2], pixels[pixels.length - 1],
                    pixels[0], pixels[1], fixture.shape.outlineColor
                );
        }
    }

}