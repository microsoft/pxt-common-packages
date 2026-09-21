namespace PhysicsBodyKind {
    let nextKind: number;

    export function create(): number {
        if (nextKind === undefined) nextKind = 1;
        return nextKind++;
    }

    //% isKind
    export const Body = create();

    //% isKind
    export const Wall = create();

    //% isKind
    export const Projectile = create();
}

/**
 * Scene-aware Box2D physics with automatic drawing.
 */
//% color=#426b9a weight=80 icon="\uf1b2" block="Box2D"
//% groups='["Create", "Physics", "Motion", "Joints", "Collisions", "Lifecycle"]'
namespace box2dblocks {
    const PIXELS_PER_METER = 10;
    const STEP = 1 / 60;
    const MAX_STEPS = 4;

    enum ShapeType {
        Circle,
        Box,
        Polygon,
        Edge,
        Chain
    }

    export enum BodyValue {
        //% block="x position"
        X,
        //% block="y position"
        Y,
        //% block="angle"
        Angle,
        //% block="x velocity"
        VelocityX,
        //% block="y velocity"
        VelocityY,
        //% block="angular velocity"
        AngularVelocity,
        //% block="mass"
        Mass,
        //% block="inertia"
        Inertia
    }

    export enum BodyAnchor {
        //% block="center"
        Center,
        //% block="top"
        Top,
        //% block="bottom"
        Bottom,
        //% block="left"
        Left,
        //% block="right"
        Right,
        //% block="top left"
        TopLeft,
        //% block="top right"
        TopRight,
        //% block="bottom left"
        BottomLeft,
        //% block="bottom right"
        BottomRight
    }

    export enum AttachmentJointType {
        //% block="revolute"
        Revolute,
        //% block="wheel"
        Wheel
    }

    export class JointAnchor {
        constructor(
            public anchor: BodyAnchor,
            public dx: number,
            public dy: number
        ) {}
    }

    export class Joint {
        constructor(
            public nativeJoint: box2d.Joint,
            public type: AttachmentJointType
        ) {}

        destroy(): void {
            this.nativeJoint.destroy();
        }
    }

    export class MouseJoint {
        public destroyed = false;

        constructor(
            public nativeJoint: box2d.MouseJoint,
            public sprite: Sprite,
            public body: Body,
            private follower: box2d.Body,
            private owner: SceneState
        ) {}

        update(): void {
            if (this.destroyed) return;
            if (!this.sprite || (this.sprite.flags & sprites.Flag.Destroyed) ||
                !this.body || this.body.destroyed || !this.body.nativeBody.valid ||
                !this.nativeJoint.valid || !this.follower.valid) {
                this.destroy();
                return;
            }

            const x = this.sprite.x / PIXELS_PER_METER;
            const y = this.sprite.y / PIXELS_PER_METER;
            this.follower.setTransform(x, y, 0);
            this.nativeJoint.setTarget(x, y);
        }

        destroy(): void {
            if (this.destroyed) return;
            this.destroyed = true;
            if (this.nativeJoint.valid)
                this.nativeJoint.destroy();
            if (this.follower.valid)
                this.follower.destroy();
            this.owner.removeMouseJoint(this);
        }
    }

    export class PhysicsPoint {
        constructor(
            public x: number,
            public y: number
        ) {}
    }

    class FixtureDrawing {
        constructor(
            public fixture: box2d.Fixture,
            public shape: PhysicsShape,
            public fill: number,
            public outline: number
        ) {}
    }

    class CollisionHandler {
        constructor(
            public kind: number,
            public otherKind: number,
            public handler: (body: Body, otherBody: Body) => void
        ) {}
    }

    export class PhysicsShape {
        private consumed = false;

        constructor(
            public nativeShape: box2d.Shape,
            public type: ShapeType,
            public values: number[],
            public loop: boolean,
            private owner: SceneState
        ) {}

        attach(): box2d.Shape {
            if (this.consumed || !this.nativeShape.valid)
                control.fail("This Box2D shape has already been attached or destroyed.");
            return this.nativeShape;
        }

        consume(): void {
            this.nativeShape.destroy();
            this.consumed = true;
            this.owner.removeShape(this);
        }

        destroy(): void {
            if (!this.consumed && this.nativeShape.valid)
                this.nativeShape.destroy();
            this.consumed = true;
            this.owner.removeShape(this);
        }

        belongsTo(owner: SceneState): boolean {
            return this.owner == owner;
        }
    }

    export class Body {
        public fixtures: FixtureDrawing[] = [];
        public connectedBodies: Body[] = [];
        public destroyed = false;

        constructor(
            public nativeBody: box2d.Body,
            public id: number,
            public kind: number,
            public type: box2d.BodyType,
            private owner: SceneState
        ) {}

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="x" callInDebugger
        get x(): number {
            return this.nativeBody.getState().x * PIXELS_PER_METER;
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="x"
        set x(value: number) {
            const snapshot = this.nativeBody.getState();
            this.nativeBody.setTransform(value / PIXELS_PER_METER, snapshot.y, snapshot.angle);
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="y" callInDebugger
        get y(): number {
            return this.nativeBody.getState().y * PIXELS_PER_METER;
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="y"
        set y(value: number) {
            const snapshot = this.nativeBody.getState();
            this.nativeBody.setTransform(snapshot.x, value / PIXELS_PER_METER, snapshot.angle);
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="angle (radians)" callInDebugger
        get angle(): number {
            return this.nativeBody.getState().angle;
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="angle (radians)"
        set angle(value: number) {
            const snapshot = this.nativeBody.getState();
            this.nativeBody.setTransform(snapshot.x, snapshot.y, value);
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="left" callInDebugger
        get left(): number {
            return this.worldBounds()[0] * PIXELS_PER_METER;
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="left"
        set left(value: number) {
            this.moveBy(value - this.left, 0);
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="top" callInDebugger
        get top(): number {
            return this.worldBounds()[1] * PIXELS_PER_METER;
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="top"
        set top(value: number) {
            this.moveBy(0, value - this.top);
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="right" callInDebugger
        get right(): number {
            return this.worldBounds()[2] * PIXELS_PER_METER;
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="right"
        set right(value: number) {
            this.moveBy(value - this.right, 0);
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="bottom" callInDebugger
        get bottom(): number {
            return this.worldBounds()[3] * PIXELS_PER_METER;
        }

        //% group="Motion" blockSetVariable="body"
        //% blockCombine block="bottom"
        set bottom(value: number) {
            this.moveBy(0, value - this.bottom);
        }

        destroy(): void {
            if (this.destroyed) return;
            this.destroyed = true;
            this.owner.destroyMouseJointsForBody(this);
            for (let i = 0; i < this.connectedBodies.length; ++i)
                this.connectedBodies[i].connectedBodies.removeElement(this);
            this.connectedBodies = [];
            if (this.nativeBody.valid)
                this.nativeBody.destroy();
            this.fixtures = [];
            this.owner.removeBody(this);
        }

        belongsTo(owner: SceneState): boolean {
            return this.owner == owner;
        }

        private moveBy(dx: number, dy: number): void {
            const snapshot = this.nativeBody.getState();
            this.nativeBody.setTransform(
                snapshot.x + dx / PIXELS_PER_METER,
                snapshot.y + dy / PIXELS_PER_METER,
                snapshot.angle
            );
        }

        private worldBounds(): number[] {
            const snapshot = this.nativeBody.getState();
            let left = snapshot.x;
            let top = snapshot.y;
            let right = snapshot.x;
            let bottom = snapshot.y;
            let hasBounds = false;

            const include = function (x: number, y: number) {
                if (!hasBounds) {
                    left = right = x;
                    top = bottom = y;
                    hasBounds = true;
                } else {
                    left = Math.min(left, x);
                    right = Math.max(right, x);
                    top = Math.min(top, y);
                    bottom = Math.max(bottom, y);
                }
            };

            for (let i = 0; i < this.fixtures.length; ++i) {
                const shape = this.fixtures[i].shape;
                const values = shape.values;
                if (shape.type == ShapeType.Circle) {
                    const x = pointX(snapshot, values[1], values[2]);
                    const y = pointY(snapshot, values[1], values[2]);
                    include(x - values[0], y - values[0]);
                    include(x + values[0], y + values[0]);
                } else if (shape.type == ShapeType.Box) {
                    const halfWidth = values[0];
                    const halfHeight = values[1];
                    const centerX = values[2];
                    const centerY = values[3];
                    const cosine = Math.cos(values[4]);
                    const sine = Math.sin(values[4]);
                    const corners = [-1, -1, 1, -1, 1, 1, -1, 1];
                    for (let j = 0; j < corners.length; j += 2) {
                        const x = corners[j] * halfWidth;
                        const y = corners[j + 1] * halfHeight;
                        const localX = centerX + cosine * x - sine * y;
                        const localY = centerY + sine * x + cosine * y;
                        include(pointX(snapshot, localX, localY), pointY(snapshot, localX, localY));
                    }
                } else {
                    for (let j = 0; j < values.length; j += 2)
                        include(
                            pointX(snapshot, values[j], values[j + 1]),
                            pointY(snapshot, values[j], values[j + 1])
                        );
                }
            }
            return [left, top, right, bottom];
        }

        localAnchor(anchor: JointAnchor): number[] {
            if (anchor.anchor === undefined)
                return [anchor.dx / PIXELS_PER_METER, anchor.dy / PIXELS_PER_METER];

            let left = 0;
            let right = 0;
            let top = 0;
            let bottom = 0;
            let hasBounds = false;

            const include = function (x: number, y: number) {
                if (!hasBounds) {
                    left = right = x;
                    top = bottom = y;
                    hasBounds = true;
                } else {
                    left = Math.min(left, x);
                    right = Math.max(right, x);
                    top = Math.min(top, y);
                    bottom = Math.max(bottom, y);
                }
            };

            for (let i = 0; i < this.fixtures.length; ++i) {
                const shape = this.fixtures[i].shape;
                const values = shape.values;
                if (shape.type == ShapeType.Circle) {
                    include(values[1] - values[0], values[2] - values[0]);
                    include(values[1] + values[0], values[2] + values[0]);
                } else if (shape.type == ShapeType.Box) {
                    const halfWidth = values[0];
                    const halfHeight = values[1];
                    const centerX = values[2];
                    const centerY = values[3];
                    const cosine = Math.cos(values[4]);
                    const sine = Math.sin(values[4]);
                    const corners = [-1, -1, 1, -1, 1, 1, -1, 1];
                    for (let j = 0; j < corners.length; j += 2) {
                        const x = corners[j] * halfWidth;
                        const y = corners[j + 1] * halfHeight;
                        include(centerX + cosine * x - sine * y, centerY + sine * x + cosine * y);
                    }
                } else {
                    for (let j = 0; j < values.length; j += 2)
                        include(values[j], values[j + 1]);
                }
            }

            let x = (left + right) / 2;
            let y = (top + bottom) / 2;
            switch (anchor.anchor) {
                case BodyAnchor.Top:
                    y = top;
                    break;
                case BodyAnchor.Bottom:
                    y = bottom;
                    break;
                case BodyAnchor.Left:
                    x = left;
                    break;
                case BodyAnchor.Right:
                    x = right;
                    break;
                case BodyAnchor.TopLeft:
                    x = left;
                    y = top;
                    break;
                case BodyAnchor.TopRight:
                    x = right;
                    y = top;
                    break;
                case BodyAnchor.BottomLeft:
                    x = left;
                    y = bottom;
                    break;
                case BodyAnchor.BottomRight:
                    x = right;
                    y = bottom;
                    break;
            }
            return [x, y];
        }
    }

    class SceneState {
        public world = new box2d.World(0, 10);
        public bodies: Body[] = [];
        public shapes: PhysicsShape[] = [];
        public mouseJoints: MouseJoint[] = [];
        public handlers: CollisionHandler[] = [];
        public activePairs: string[] = [];
        public speed = 1;
        public paused = false;
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

        addShape(shape: PhysicsShape): PhysicsShape {
            this.shapes.push(shape);
            return shape;
        }

        removeShape(shape: PhysicsShape): void {
            this.shapes.removeElement(shape);
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

        findFixture(handle: number): Body {
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
            while (this.shapes.length)
                this.shapes[0].destroy();
            this.handlers = [];
            this.activePairs = [];
        }
    }

    let hooksInstalled = false;
    let currentState: SceneState;
    let stateStack: SceneState[] = [];

    function installSceneHooks(): void {
        if (hooksInstalled) return;
        hooksInstalled = true;
        game.addScenePushHandler(function () {
            stateStack.push(currentState);
            currentState = undefined;
        });
        game.addScenePopHandler(function () {
            if (currentState)
                currentState.destroy();
            currentState = stateStack.length ? stateStack.pop() : undefined;
        });
    }

    function state(): SceneState {
        installSceneHooks();
        if (!currentState)
            currentState = new SceneState();
        return currentState;
    }

    function pointX(state: box2d.BodySnapshot, localX: number, localY: number): number {
        return state.x + Math.cos(state.angle) * localX - Math.sin(state.angle) * localY;
    }

    function pointY(state: box2d.BodySnapshot, localX: number, localY: number): number {
        return state.y + Math.sin(state.angle) * localX + Math.cos(state.angle) * localY;
    }

    function connectedComponent(body: Body): Body[] {
        const result: Body[] = [body];
        for (let i = 0; i < result.length; ++i) {
            const connected = result[i].connectedBodies;
            for (let j = 0; j < connected.length; ++j) {
                if (result.indexOf(connected[j]) < 0)
                    result.push(connected[j]);
            }
        }
        return result;
    }

    function moveBodies(bodies: Body[], offsetX: number, offsetY: number): void {
        for (let i = 0; i < bodies.length; ++i) {
            if (bodies[i].type == box2d.BodyType.Static)
                continue;
            const snapshot = bodies[i].nativeBody.getState();
            bodies[i].nativeBody.setTransform(
                snapshot.x + offsetX,
                snapshot.y + offsetY,
                snapshot.angle
            );
        }
    }

    function attachAtAnchors(bodyA: Body, anchorA: JointAnchor, bodyB: Body, anchorB: JointAnchor): number[] {
        const owner = state();
        if (!bodyA || bodyA.destroyed || !bodyA.belongsTo(owner) ||
            !bodyB || bodyB.destroyed || !bodyB.belongsTo(owner) || bodyA == bodyB)
            control.fail("Cannot attach these Box2D bodies.");

        const localA = bodyA.localAnchor(anchorA);
        const localB = bodyB.localAnchor(anchorB);
        const stateA = bodyA.nativeBody.getState();
        const stateB = bodyB.nativeBody.getState();
        const anchorX = pointX(stateA, localA[0], localA[1]);
        const anchorY = pointY(stateA, localA[0], localA[1]);
        const offsetX = anchorX - pointX(stateB, localB[0], localB[1]);
        const offsetY = anchorY - pointY(stateB, localB[0], localB[1]);
        const componentA = connectedComponent(bodyA);
        const componentB = connectedComponent(bodyB);
        const aligned = Math.abs(offsetX) <= 0.0001 && Math.abs(offsetY) <= 0.0001;

        if (componentB.indexOf(bodyA) >= 0) {
            if (!aligned)
                control.fail("These Box2D bodies are already attached and cannot be aligned.");
        } else if (!aligned && bodyB.type != box2d.BodyType.Static) {
            moveBodies(componentB, offsetX, offsetY);
        } else if (!aligned && bodyA.type != box2d.BodyType.Static) {
            moveBodies(componentA, -offsetX, -offsetY);
            return [anchorX - offsetX, anchorY - offsetY];
        } else if (!aligned) {
            control.fail("Static Box2D bodies cannot be moved to align this attachment.");
        }
        return [anchorX, anchorY];
    }

    function connectBodies(bodyA: Body, bodyB: Body): void {
        if (bodyA.connectedBodies.indexOf(bodyB) < 0)
            bodyA.connectedBodies.push(bodyB);
        if (bodyB.connectedBodies.indexOf(bodyA) < 0)
            bodyB.connectedBodies.push(bodyA);
    }

    function screenX(camera: scene.Camera, worldX: number): number {
        return Math.round(worldX * PIXELS_PER_METER - camera.drawOffsetX);
    }

    function screenY(camera: scene.Camera, worldY: number): number {
        return Math.round(worldY * PIXELS_PER_METER - camera.drawOffsetY);
    }

    function drawFixture(target: Image, camera: scene.Camera, state: box2d.BodySnapshot, fixture: FixtureDrawing): void {
        const shape = fixture.shape;
        const values = shape.values;
        if (shape.type == ShapeType.Circle) {
            const x = screenX(camera, pointX(state, values[1], values[2]));
            const y = screenY(camera, pointY(state, values[1], values[2]));
            const radius = Math.round(values[0] * PIXELS_PER_METER);
            if (fixture.fill) target.fillCircle(x, y, radius, fixture.fill);
            if (fixture.outline) target.drawCircle(x, y, radius, fixture.outline);
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

        if (fixture.fill && (shape.type == ShapeType.Box || shape.type == ShapeType.Polygon)) {
            for (let i = 2; i < pixels.length - 2; i += 2) {
                target.fillTriangle(
                    pixels[0], pixels[1],
                    pixels[i], pixels[i + 1],
                    pixels[i + 2], pixels[i + 3],
                    fixture.fill
                );
            }
        }
        if (fixture.outline) {
            for (let i = 0; i < pixels.length - 2; i += 2)
                target.drawLine(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3], fixture.outline);
            if (shape.type == ShapeType.Box || shape.type == ShapeType.Polygon || shape.loop)
                target.drawLine(
                    pixels[pixels.length - 2], pixels[pixels.length - 1],
                    pixels[0], pixels[1], fixture.outline
                );
        }
    }

    //% shim=KIND_GET
    //% blockId=box2d_blocks_body_kind block="$kind"
    //% kindNamespace=PhysicsBodyKind kindMemberName=kind kindPromptHint="e.g. Player, Crate, Ground..."
    export function _bodyKind(kind: number): number {
        return kind;
    }

    //% blockId=box2d_blocks_body_anchor
    //% block="$anchor"
    //% anchor.defl=BodyAnchor.Center
    //% blockHidden=true
    export function bodyAnchor(anchor: BodyAnchor = BodyAnchor.Center): JointAnchor {
        return new JointAnchor(anchor, 0, 0);
    }

    //% blockId=box2d_blocks_joint_offset
    //% block="offset x $dx y $dy"
    //% group="Joints" weight=95
    export function jointOffset(dx: number, dy: number): JointAnchor {
        return new JointAnchor(undefined, dx, dy);
    }

    /**
     * Create a body at the center of the screen in the current scene's physics world.
     */
    //% blockId=box2d_blocks_create_body
    //% block="create $type body of kind $kind=box2d_blocks_body_kind with $shape"
    //% type.defl=box2d.BodyType.Dynamic
    //% kind.defl=PhysicsBodyKind.Body
    //% shape.shadow=box2d_blocks_circle_shape
    //% blockSetVariable=body
    //% group="Create" weight=100
    export function createBody(type: box2d.BodyType, kind: number, shape?: PhysicsShape): Body {
        const body = state().createBody(type, screen.width / 2, screen.height / 2, 0, kind);
        if (shape)
            attachShape(body, shape);
        return body;
    }

    /**
     * Create a world-space point in pixels for the ground and walls block.
     */
    //% blockId=box2d_blocks_xy_point
    //% block="x $x y $y"
    //% x.shadow=positionPicker y.shadow=positionPicker
    //% blockHidden=true
    export function point(x: number, y: number): PhysicsPoint {
        return new PhysicsPoint(x, y);
    }

    /**
     * Create static ground and walls through a list of world-space points.
     */
    //% blockId=box2d_blocks_create_ground
    //% block="create ground / walls connecting positions $positions"
    //% positions.shadow=lists_create_with
    //% positions.defl=box2d_blocks_xy_point
    //% blockSetVariable=ground
    //% group="Create" weight=98
    export function createGround(positions: PhysicsPoint[]): Body {
        if (!positions || positions.length < 2)
            control.fail("Ground and walls need at least two positions.");

        const vertices: number[] = [];
        for (let i = 0; i < positions.length; ++i) {
            if (!positions[i])
                control.fail("Ground and wall positions cannot be empty.");
            vertices.push(positions[i].x);
            vertices.push(positions[i].y);
        }
        const body = state().createBody(box2d.BodyType.Static, 0, 0, 0, PhysicsBodyKind.Wall);
        attachShape(body, chainShape(vertices), 0, 1, 0, false, 0, 1);
        return body;
    }

    //% blockId=box2d_blocks_circle_shape
    //% block="circle shape radius $radius||center x $centerX y $centerY"
    //% radius.min=1 radius.defl=5
    //% expandableArgumentMode=toggle
    //% blockSetVariable=shape
    //% group="Create" weight=95
    export function circleShape(radius: number, centerX: number = 0, centerY: number = 0): PhysicsShape {
        const owner = state();
        return owner.addShape(new PhysicsShape(
            box2d.Shape.circle(radius / PIXELS_PER_METER, centerX / PIXELS_PER_METER, centerY / PIXELS_PER_METER),
            ShapeType.Circle,
            [radius / PIXELS_PER_METER, centerX / PIXELS_PER_METER, centerY / PIXELS_PER_METER],
            false,
            owner
        ));
    }

    //% blockId=box2d_blocks_box_shape
    //% block="box shape half width $halfWidth half height $halfHeight||center x $centerX y $centerY angle $angle"
    //% halfWidth.min=1 halfWidth.defl=5 halfHeight.min=1 halfHeight.defl=5
    //% expandableArgumentMode=toggle
    //% blockSetVariable=shape
    //% group="Create" weight=90
    export function boxShape(halfWidth: number, halfHeight: number, centerX: number = 0, centerY: number = 0, angle: number = 0): PhysicsShape {
        const owner = state();
        return owner.addShape(new PhysicsShape(
            box2d.Shape.box(
                halfWidth / PIXELS_PER_METER, halfHeight / PIXELS_PER_METER,
                centerX / PIXELS_PER_METER, centerY / PIXELS_PER_METER, angle
            ),
            ShapeType.Box,
            [
                halfWidth / PIXELS_PER_METER, halfHeight / PIXELS_PER_METER,
                centerX / PIXELS_PER_METER, centerY / PIXELS_PER_METER, angle
            ],
            false,
            owner
        ));
    }

    //% blockId=box2d_blocks_polygon_shape
    //% block="polygon shape with vertices $vertices"
    //% vertices.shadow=lists_create_with
    //% vertices.defl=box2d_blocks_xy_point
    //% blockSetVariable=shape
    //% group="Create" weight=85
    export function polygonShape(vertices: PhysicsPoint[]): PhysicsShape {
        if (!vertices || vertices.length < 3)
            control.fail("Polygon shapes need at least three vertices.");

        const owner = state();
        const meters: number[] = [];
        for (let i = 0; i < vertices.length; ++i) {
            if (!vertices[i])
                control.fail("Polygon vertices cannot be empty.");
            meters.push(vertices[i].x / PIXELS_PER_METER);
            meters.push(vertices[i].y / PIXELS_PER_METER);
        }
        return owner.addShape(new PhysicsShape(box2d.Shape.polygon(meters), ShapeType.Polygon, meters, false, owner));
    }

    //% blockId=box2d_blocks_edge_shape
    //% block="edge shape length $length angle $angle"
    //% length.min=1 length.defl=10 angle.defl=0
    //% blockSetVariable=shape
    //% group="Create" weight=80
    export function edgeShape(length: number, angle: number): PhysicsShape {
        const owner = state();
        const halfLength = length / PIXELS_PER_METER / 2;
        const x = Math.cos(angle) * halfLength;
        const y = Math.sin(angle) * halfLength;
        const values = [
            -x, -y,
            x, y
        ];
        return owner.addShape(new PhysicsShape(
            box2d.Shape.edge(values[0], values[1], values[2], values[3]),
            ShapeType.Edge,
            values,
            false,
            owner
        ));
    }

    //% blockId=box2d_blocks_chain_shape
    //% block="chain shape pixel vertices $vertices||closed loop $loop"
    //% vertices.shadow=lists_create_with
    //% loop.shadow=toggleOnOff
    //% expandableArgumentMode=toggle
    //% blockSetVariable=shape
    //% group="Create" weight=75 advanced=true
    export function chainShape(vertices: number[], loop: boolean = false): PhysicsShape {
        const owner = state();
        const meters: number[] = [];
        for (let i = 0; i < vertices.length; ++i)
            meters.push(vertices[i] / PIXELS_PER_METER);
        return owner.addShape(new PhysicsShape(box2d.Shape.chain(meters, loop), ShapeType.Chain, meters, loop, owner));
    }

    /**
     * Attach and consume a shape. The fixture is owned by the body.
     */
    //% blockId=box2d_blocks_attach_shape
    //% block="attach $shape to $body||density $density friction $friction restitution $restitution sensor $sensor fill $fill=colorindexpicker outline $outline=colorindexpicker"
    //% shape.shadow=variables_get shape.defl=shape
    //% body.shadow=variables_get body.defl=body
    //% density.min=0 density.defl=1 friction.min=0 friction.defl=0.2 restitution.min=0
    //% sensor.shadow=toggleOnOff fill.defl=6 outline.defl=1
    //% expandableArgumentMode=toggle
    //% group="Create" weight=70
    export function attachShape(body: Body, shape: PhysicsShape, density: number = 1, friction: number = 0.2, restitution: number = 0, sensor: boolean = false, fill: number = 6, outline: number = 1): void {
        const owner = state();
        if (!body || body.destroyed || !body.belongsTo(owner) || !shape || !shape.belongsTo(owner))
            control.fail("Cannot attach a shape to this Box2D body.");
        const fixture = body.nativeBody.createFixture(shape.attach(), density, friction, restitution, sensor);
        body.fixtures.push(new FixtureDrawing(fixture, shape, fill, outline));
        shape.consume();
    }

    //% blockId=box2d_blocks_set_gravity
    //% block="set Box2D gravity x $x y $y"
    //% x.defl=0 y.defl=100
    //% group="Physics" weight=100
    export function setGravity(x: number, y: number): void {
        state().world.setGravity(x / PIXELS_PER_METER, y / PIXELS_PER_METER);
    }

    //% blockId=box2d_blocks_pause
    //% block="set Box2D paused $paused"
    //% paused.shadow=toggleOnOff
    //% group="Physics" weight=95
    export function setPaused(paused: boolean): void {
        state().paused = paused;
    }

    //% blockId=box2d_blocks_speed
    //% block="set Box2D simulation speed $speed"
    //% speed.min=0 speed.max=4 speed.defl=1
    //% group="Physics" weight=90
    export function setSimulationSpeed(speed: number): void {
        state().speed = Math.max(0, speed);
    }

    //% blockId=box2d_blocks_body_value
    //% block="$body $value"
    //% body.shadow=variables_get body.defl=body
    //% group="Physics" weight=85
    export function bodyValue(body: Body, value: BodyValue): number {
        const snapshot = body.nativeBody.getState();
        switch (value) {
            case BodyValue.X: return snapshot.x * PIXELS_PER_METER;
            case BodyValue.Y: return snapshot.y * PIXELS_PER_METER;
            case BodyValue.Angle: return snapshot.angle;
            case BodyValue.VelocityX: return snapshot.velocityX * PIXELS_PER_METER;
            case BodyValue.VelocityY: return snapshot.velocityY * PIXELS_PER_METER;
            case BodyValue.AngularVelocity: return snapshot.angularVelocity;
            case BodyValue.Mass: return snapshot.mass;
            default: return snapshot.inertia;
        }
    }

    /**
     * Return the first body whose fixture contains the world-space pixel coordinate.
     */
    //% blockId=box2d_blocks_body_at
    //% block="body at x $x y $y"
    //% x.shadow=positionPicker y.shadow=positionPicker
    //% group="Physics" weight=80
    export function bodyAt(x: number, y: number): Body {
        const owner = state();
        const worldX = x / PIXELS_PER_METER;
        const worldY = y / PIXELS_PER_METER;
        for (let i = 0; i < owner.bodies.length; ++i) {
            const body = owner.bodies[i];
            if (body.destroyed || !body.nativeBody.valid)
                continue;
            for (let j = 0; j < body.fixtures.length; ++j) {
                const fixture = body.fixtures[j].fixture;
                if (fixture.valid && fixture.testPoint(worldX, worldY))
                    return body;
            }
        }
        return null;
    }

    //% blockId=box2d_blocks_set_transform
    //% blockHidden=true
    export function setTransform(body: Body, x: number, y: number, angle: number): void {
        body.nativeBody.setTransform(x / PIXELS_PER_METER, y / PIXELS_PER_METER, angle);
    }

    //% blockId=box2d_blocks_set_velocity
    //% block="set $body velocity x $x y $y"
    //% body.shadow=variables_get body.defl=body
    //% group="Motion" weight=95
    export function setLinearVelocity(body: Body, x: number, y: number): void {
        body.nativeBody.setLinearVelocity(x / PIXELS_PER_METER, y / PIXELS_PER_METER);
    }

    //% blockId=box2d_blocks_set_angular_velocity
    //% block="set $body angular velocity $velocity"
    //% body.shadow=variables_get body.defl=body
    //% group="Motion" weight=90
    export function setAngularVelocity(body: Body, velocity: number): void {
        body.nativeBody.angularVelocity = velocity;
    }

    //% blockId=box2d_blocks_set_damping
    //% block="set $body damping linear $linear angular $angular"
    //% body.shadow=variables_get body.defl=body linear.min=0 angular.min=0
    //% group="Motion" weight=85
    export function setDamping(body: Body, linear: number, angular: number): void {
        body.nativeBody.setDamping(linear, angular);
    }

    //% blockId=box2d_blocks_set_gravity_scale
    //% block="set $body gravity scale $scale"
    //% body.shadow=variables_get body.defl=body scale.defl=1
    //% group="Motion" weight=80
    export function setGravityScale(body: Body, scale: number): void {
        body.nativeBody.setGravityScale(scale);
    }

    //% blockId=box2d_blocks_set_body_flag
    //% block="set $body $flag $enabled"
    //% body.shadow=variables_get body.defl=body enabled.shadow=toggleOnOff
    //% group="Motion" weight=75
    export function setBodyFlag(body: Body, flag: box2d.BodyFlag, enabled: boolean): void {
        body.nativeBody.setFlag(flag, enabled);
    }

    //% blockId=box2d_blocks_apply_force_center
    //% block="apply force x $x y $y to center of $body"
    //% body.shadow=variables_get body.defl=body
    //% group="Motion" weight=70
    export function applyForceToCenter(body: Body, x: number, y: number): void {
        body.nativeBody.applyForceToCenter(x, y);
    }

    //% blockId=box2d_blocks_apply_impulse_center
    //% block="apply impulse x $x y $y to center of $body"
    //% body.shadow=variables_get body.defl=body
    //% group="Motion" weight=65
    export function applyLinearImpulseToCenter(body: Body, x: number, y: number): void {
        body.nativeBody.applyLinearImpulseToCenter(x, y);
    }

    //% blockId=box2d_blocks_apply_torque
    //% block="apply torque $torque to $body"
    //% body.shadow=variables_get body.defl=body
    //% group="Motion" weight=60
    export function applyTorque(body: Body, torque: number): void {
        body.nativeBody.applyTorque(torque);
    }

    //% blockId=box2d_blocks_apply_angular_impulse
    //% block="apply angular impulse $impulse to $body"
    //% body.shadow=variables_get body.defl=body
    //% group="Motion" weight=55
    export function applyAngularImpulse(body: Body, impulse: number): void {
        body.nativeBody.applyAngularImpulse(impulse);
    }

    //% blockId=box2d_blocks_distance_joint
    //% block="distance joint from $bodyA at x $anchorAX y $anchorAY to $bodyB at x $anchorBX y $anchorBY"
    //% bodyA.shadow=variables_get bodyA.defl=body bodyB.shadow=variables_get bodyB.defl=otherBody
    //% blockSetVariable=joint
    //% group="Joints" weight=100
    export function createDistanceJoint(bodyA: Body, bodyB: Body, anchorAX: number, anchorAY: number, anchorBX: number, anchorBY: number): box2d.DistanceJoint {
        return bodyA.nativeBody.createDistanceJoint(
            bodyB.nativeBody,
            anchorAX / PIXELS_PER_METER, anchorAY / PIXELS_PER_METER,
            anchorBX / PIXELS_PER_METER, anchorBY / PIXELS_PER_METER
        );
    }

    //% blockId=box2d_blocks_attach_bodies
    //% block="attach $anchorA of $bodyA to $anchorB of $bodyB with $jointType joint"
    //% anchorA.shadow=box2d_blocks_body_anchor anchorB.shadow=box2d_blocks_body_anchor
    //% bodyA.shadow=variables_get bodyA.defl=body bodyB.shadow=variables_get bodyB.defl=otherBody
    //% jointType.defl=AttachmentJointType.Revolute
    //% blockSetVariable=joint
    //% group="Joints" weight=100
    export function attachBodies(bodyA: Body, anchorA: JointAnchor, bodyB: Body, anchorB: JointAnchor, jointType: AttachmentJointType = AttachmentJointType.Revolute): Joint {
        const worldAnchor = attachAtAnchors(bodyA, anchorA, bodyB, anchorB);
        let nativeJoint: box2d.Joint;
        if (jointType == AttachmentJointType.Wheel) {
            nativeJoint = bodyA.nativeBody.createWheelJoint(
                bodyB.nativeBody,
                worldAnchor[0],
                worldAnchor[1],
                0,
                1
            );
        } else {
            nativeJoint = bodyA.nativeBody.createRevoluteJoint(
                bodyB.nativeBody,
                worldAnchor[0],
                worldAnchor[1]
            );
        }
        connectBodies(bodyA, bodyB);
        return new Joint(nativeJoint, jointType);
    }

    //% blockId=box2d_blocks_configure_distance_joint
    //% block="set $joint length $length min $minLength max $maxLength||stiffness $stiffness damping $damping"
    //% joint.shadow=variables_get joint.defl=joint
    //% expandableArgumentMode=toggle
    //% group="Joints" weight=95
    export function configureDistanceJoint(joint: box2d.DistanceJoint, length: number, minLength: number, maxLength: number, stiffness: number = 0, damping: number = 0): void {
        joint.configure(
            length / PIXELS_PER_METER,
            minLength / PIXELS_PER_METER,
            maxLength / PIXELS_PER_METER,
            stiffness,
            damping
        );
    }

    //% blockId=box2d_blocks_revolute_joint
    //% blockHidden=true
    export function createRevoluteJoint(bodyA: Body, bodyB: Body, anchorX: number, anchorY: number): box2d.RevoluteJoint {
        return bodyA.nativeBody.createRevoluteJoint(
            bodyB.nativeBody, anchorX / PIXELS_PER_METER, anchorY / PIXELS_PER_METER
        );
    }

    //% blockId=box2d_blocks_revolute_motor
    //% blockHidden=true
    export function setRevoluteMotor(joint: box2d.RevoluteJoint, enabled: boolean, speed: number, maxTorque: number): void {
        joint.setMotor(enabled, speed, maxTorque);
    }

    //% blockId=box2d_blocks_revolute_limits
    //% blockHidden=true
    export function setRevoluteLimits(joint: box2d.RevoluteJoint, enabled: boolean, lower: number, upper: number): void {
        joint.setLimits(enabled, lower, upper);
    }

    //% blockId=box2d_blocks_wheel_joint
    //% blockHidden=true
    export function createWheelJoint(bodyA: Body, bodyB: Body, anchorX: number, anchorY: number, axisX: number = 0, axisY: number = 1): box2d.WheelJoint {
        return bodyA.nativeBody.createWheelJoint(
            bodyB.nativeBody,
            anchorX / PIXELS_PER_METER, anchorY / PIXELS_PER_METER,
            axisX, axisY
        );
    }

    //% blockId=box2d_blocks_wheel_motor
    //% blockHidden=true
    export function setWheelMotor(joint: box2d.WheelJoint, enabled: boolean, speed: number, maxTorque: number): void {
        joint.setMotor(enabled, speed, maxTorque);
    }

    //% blockId=box2d_blocks_wheel_limits
    //% blockHidden=true
    export function setWheelLimits(joint: box2d.WheelJoint, enabled: boolean, lower: number, upper: number): void {
        joint.setLimits(enabled, lower / PIXELS_PER_METER, upper / PIXELS_PER_METER);
    }

    //% blockId=box2d_blocks_joint_motor
    //% block="set $joint motor $enabled speed $speed max torque $maxTorque"
    //% joint.shadow=variables_get joint.defl=joint enabled.shadow=toggleOnOff
    //% group="Joints" weight=85
    export function setJointMotor(joint: Joint, enabled: boolean, speed: number, maxTorque: number): void {
        if (!joint || !joint.nativeJoint || !joint.nativeJoint.valid)
            control.fail("This Box2D joint is invalid.");
        if (joint.type == AttachmentJointType.Wheel)
            (joint.nativeJoint as box2d.WheelJoint).setMotor(enabled, speed, maxTorque);
        else
            (joint.nativeJoint as box2d.RevoluteJoint).setMotor(enabled, speed, maxTorque);
    }

    //% blockId=box2d_blocks_joint_limits
    //% block="set $joint limits $enabled lower $lower upper $upper"
    //% joint.shadow=variables_get joint.defl=joint enabled.shadow=toggleOnOff
    //% group="Joints" weight=80
    export function setJointLimits(joint: Joint, enabled: boolean, lower: number, upper: number): void {
        if (!joint || !joint.nativeJoint || !joint.nativeJoint.valid)
            control.fail("This Box2D joint is invalid.");
        if (joint.type == AttachmentJointType.Wheel) {
            (joint.nativeJoint as box2d.WheelJoint).setLimits(
                enabled,
                lower / PIXELS_PER_METER,
                upper / PIXELS_PER_METER
            );
        } else {
            (joint.nativeJoint as box2d.RevoluteJoint).setLimits(enabled, lower, upper);
        }
    }

    //% blockId=box2d_blocks_wheel_suspension
    //% block="set wheel $joint stiffness $stiffness damping $damping"
    //% joint.shadow=variables_get joint.defl=joint
    //% group="Joints" weight=60
    export function setWheelSuspension(joint: Joint, stiffness: number, damping: number): void {
        if (!joint || joint.type != AttachmentJointType.Wheel)
            control.fail("This Box2D joint is not a wheel joint.");
        if (!joint.nativeJoint || !joint.nativeJoint.valid)
            control.fail("This Box2D joint is invalid.");
        (joint.nativeJoint as box2d.WheelJoint).setSuspension(stiffness, damping);
    }

    //% blockId=box2d_blocks_mouse_joint
    //% block="drag $anchor of $body with $sprite||max force $maxForce stiffness $stiffness damping $damping"
    //% anchor.shadow=box2d_blocks_body_anchor
    //% body.shadow=variables_get body.defl=body sprite.shadow=variables_get sprite.defl=mySprite
    //% maxForce.min=0 maxForce.defl=1000 stiffness.min=0 stiffness.defl=100 damping.min=0 damping.defl=10
    //% expandableArgumentMode=toggle
    //% blockSetVariable=mouseJoint
    //% group="Joints" weight=75
    export function createMouseJoint(sprite: Sprite, body: Body, anchor: JointAnchor, maxForce: number = 1000, stiffness: number = 100, damping: number = 10): MouseJoint {
        const owner = state();
        if (!sprite || (sprite.flags & sprites.Flag.Destroyed))
            control.fail("Cannot create a mouse joint for this sprite.");
        if (!body || body.destroyed || !body.belongsTo(owner) || body.type != box2d.BodyType.Dynamic)
            control.fail("Mouse joints require a valid dynamic Box2D body.");
        if (!anchor)
            control.fail("Mouse joints require an anchor on the Box2D body.");

        const localAnchor = body.localAnchor(anchor);
        const snapshot = body.nativeBody.getState();
        const anchorX = pointX(snapshot, localAnchor[0], localAnchor[1]);
        const anchorY = pointY(snapshot, localAnchor[0], localAnchor[1]);
        const targetX = sprite.x / PIXELS_PER_METER;
        const targetY = sprite.y / PIXELS_PER_METER;
        const follower = owner.world.createBody(box2d.BodyType.Static, targetX, targetY, 0);
        const nativeJoint = follower.createMouseJoint(
            body.nativeBody,
            anchorX,
            anchorY,
            maxForce,
            stiffness,
            damping
        );
        nativeJoint.setTarget(targetX, targetY);
        return owner.addMouseJoint(new MouseJoint(nativeJoint, sprite, body, follower, owner));
    }

    //% blockId=box2d_blocks_destroy_mouse_joint
    //% block="destroy $joint"
    //% joint.shadow=variables_get joint.defl=mouseJoint
    //% group="Joints" weight=70
    export function destroyMouseJoint(joint: MouseJoint): void {
        if (joint) joint.destroy();
    }

    /**
     * Run when two bodies begin touching.
     */
    //% blockId=box2d_blocks_on_collision
    //% block="on $body of kind $kind=box2d_blocks_body_kind collides with $otherBody of kind $otherKind=box2d_blocks_body_kind"
    //% draggableParameters="reporter"
    //% blockAllowMultiple=1
    //% group="Collisions" weight=100
    export function onCollision(kind: number, otherKind: number, handler: (body: Body, otherBody: Body) => void): void {
        if (!handler) return;
        state().handlers.push(new CollisionHandler(kind, otherKind, handler));
    }

    //% blockId=box2d_blocks_body_kind_of
    //% block="kind of $body"
    //% body.shadow=variables_get body.defl=body
    //% group="Collisions" weight=90
    export function kindOf(body: Body): number {
        return body.kind;
    }

    //% blockId=box2d_blocks_set_body_kind
    //% block="set $body kind $kind=box2d_blocks_body_kind"
    //% body.shadow=variables_get body.defl=body
    //% group="Collisions" weight=85
    export function setBodyKind(body: Body, kind: number): void {
        body.kind = kind;
    }

    //% blockId=box2d_blocks_is_valid
    //% block="$body is valid"
    //% body.shadow=variables_get body.defl=body
    //% group="Lifecycle" weight=100
    export function isValid(body: Body): boolean {
        return !!body && !body.destroyed && body.nativeBody.valid;
    }

    //% blockId=box2d_blocks_destroy_body
    //% block="destroy $body"
    //% body.shadow=variables_get body.defl=body
    //% group="Lifecycle" weight=95
    export function destroyBody(body: Body): void {
        if (body) body.destroy();
    }

    //% blockId=box2d_blocks_destroy_shape
    //% block="destroy unused $shape"
    //% shape.shadow=variables_get shape.defl=shape
    //% group="Lifecycle" weight=90 advanced=true
    export function destroyShape(shape: PhysicsShape): void {
        if (shape) shape.destroy();
    }
}
