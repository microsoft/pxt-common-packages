namespace pxsim.box2dNative {
    type WasmFunction = (...args: number[]) => number;

    interface Box2DExports {
        memory: WebAssembly.Memory;
        [name: string]: WebAssembly.Memory | WasmFunction;
    }

    let instance: Box2DExports;

    function wasm(): Box2DExports {
        if (!instance) {
            const text = box2dWasm.base64;
            const binary = atob(text);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; ++i)
                bytes[i] = binary.charCodeAt(i);
            const imports = {
                env: {
                    box2d_panic: (code: number) => {
                        throw U.userError(`Box2D panic ${code}`);
                    },
                    emscripten_notify_memory_growth: (_index: number) => {}
                },
                wasi_snapshot_preview1: {
                    fd_write: () => 8,
                    fd_close: () => 8,
                    fd_seek: () => 8,
                    proc_exit: (code: number) => {
                        throw U.userError(`Box2D exited with code ${code}`);
                    }
                }
            };
            instance = new WebAssembly.Instance(
                new WebAssembly.Module(bytes), imports
            ).exports as Box2DExports;
            (instance["_initialize"] as WasmFunction)();
        }
        return instance;
    }

    function fn(name: string): WasmFunction {
        return wasm()[name] as WasmFunction;
    }

    function invoke(name: string, args: number[]): number {
        return fn(name).apply(undefined, args);
    }

    function toNumbers(values: RefCollection): number[] {
        const result: number[] = [];
        for (let i = 0; i < values.getLength(); ++i)
            result.push(values.getAt(i));
        return result;
    }

    function allocate(values: RefCollection): number {
        const length = values.getLength();
        const pointer = invoke("malloc", [Math.max(8, length * 8)]);
        if (!pointer)
            throw U.userError("Box2D ran out of simulator memory");
        new Float64Array(wasm().memory.buffer, pointer, length).set(toNumbers(values));
        return pointer;
    }

    function release(pointer: number): void {
        invoke("free", [pointer]);
    }

    function withInput(name: string, values: RefCollection, suffix: number[] = []): number {
        const pointer = allocate(values);
        try {
            return invoke(name, [pointer, values.getLength()].concat(suffix));
        }
        finally {
            release(pointer);
        }
    }

    function arrayResult(name: string, args: number[]): RefCollection {
        const length = invoke(name, args);
        const pointer = invoke("bx_result", []);
        const values = new Float64Array(wasm().memory.buffer, pointer, length);
        const result = new RefCollection();
        for (let i = 0; i < length; ++i)
            result.push(values[i]);
        return result;
    }

    export function createWorld(gravityX: number, gravityY: number): number {
        return invoke("bx_createWorld", [gravityX, gravityY]);
    }

    export function destroyWorld(world: number): void {
        invoke("bx_destroyWorld", [world]);
    }

    export function isValid(handle: number): boolean {
        return !!invoke("bx_isValid", [handle]);
    }

    export function setGravity(world: number, x: number, y: number): void {
        invoke("bx_setGravity", [world, x, y]);
    }

    export function step(world: number, seconds: number, velocityIterations: number, positionIterations: number): void {
        invoke("bx_step", [world, seconds, velocityIterations, positionIterations]);
    }

    export function setWorldSleepingAllowed(world: number, allowed: boolean): void {
        invoke("bx_setWorldSleepingAllowed", [world, allowed ? 1 : 0]);
    }

    export function destroyBody(body: number): void {
        invoke("bx_destroyBody", [body]);
    }

    export function getBodyState(body: number): RefCollection {
        return arrayResult("bx_getBodyState", [body]);
    }

    export function readBodyTransform(body: number, output: RefCollection): void {
        const pointer = allocate(output);
        try {
            const length = output.getLength();
            invoke("bx_readBodyTransform", [body, pointer, length]);
            const values = new Float64Array(wasm().memory.buffer, pointer, length);
            for (let i = 0; i < length; ++i)
                output.setAt(i, values[i]);
        }
        finally {
            release(pointer);
        }
    }

    export function readBodyBoxVertices(body: number, box: RefCollection, view: RefCollection, output: RefCollection): void {
        const boxPointer = allocate(box);
        const viewPointer = allocate(view);
        const outputPointer = allocate(output);
        try {
            invoke("bx_readBodyBoxVertices", [
                body, boxPointer, box.getLength(), viewPointer, view.getLength(),
                outputPointer, output.getLength()
            ]);
            const values = new Float64Array(wasm().memory.buffer, outputPointer, output.getLength());
            for (let i = 0; i < output.getLength(); ++i)
                output.setAt(i, values[i]);
        }
        finally {
            release(outputPointer);
            release(viewPointer);
            release(boxPointer);
        }
    }

    export function setTransform(body: number, x: number, y: number, angle: number): void {
        invoke("bx_setTransform", [body, x, y, angle]);
    }

    export function setLinearVelocity(body: number, x: number, y: number): void {
        invoke("bx_setLinearVelocity", [body, x, y]);
    }

    export function setAngularVelocity(body: number, velocity: number): void {
        invoke("bx_setAngularVelocity", [body, velocity]);
    }

    export function setBodyType(body: number, type: number): void {
        invoke("bx_setBodyType", [body, type]);
    }

    export function setDamping(body: number, linear: number, angular: number): void {
        invoke("bx_setDamping", [body, linear, angular]);
    }

    export function setGravityScale(body: number, scale: number): void {
        invoke("bx_setGravityScale", [body, scale]);
    }

    export function setBodyFlag(body: number, flag: number, enabled: boolean): void {
        invoke("bx_setBodyFlag", [body, flag, enabled ? 1 : 0]);
    }

    export function getBodyFlag(body: number, flag: number): boolean {
        return !!invoke("bx_getBodyFlag", [body, flag]);
    }

    export function applyForceToCenter(body: number, x: number, y: number, wake: boolean): void {
        invoke("bx_applyForceToCenter", [body, x, y, wake ? 1 : 0]);
    }

    export function applyLinearImpulseToCenter(body: number, x: number, y: number, wake: boolean): void {
        invoke("bx_applyLinearImpulseToCenter", [body, x, y, wake ? 1 : 0]);
    }

    export function applyTorque(body: number, torque: number, wake: boolean): void {
        invoke("bx_applyTorque", [body, torque, wake ? 1 : 0]);
    }

    export function applyAngularImpulse(body: number, impulse: number, wake: boolean): void {
        invoke("bx_applyAngularImpulse", [body, impulse, wake ? 1 : 0]);
    }

    export function getWorldPoint(body: number, x: number, y: number): RefCollection {
        return arrayResult("bx_getWorldPoint", [body, x, y]);
    }

    export function getLocalPoint(body: number, x: number, y: number): RefCollection {
        return arrayResult("bx_getLocalPoint", [body, x, y]);
    }

    export function createCircleShape(radius: number, centerX: number, centerY: number): number {
        return invoke("bx_createCircleShape", [radius, centerX, centerY]);
    }

    export function createPolygonShape(vertices: RefCollection): number {
        return withInput("bx_createPolygonShape", vertices);
    }

    export function createEdgeShape(x1: number, y1: number, x2: number, y2: number): number {
        return invoke("bx_createEdgeShape", [x1, y1, x2, y2]);
    }

    export function createChainShape(vertices: RefCollection, loop: boolean): number {
        return withInput("bx_createChainShape", vertices, [loop ? 1 : 0]);
    }

    export function destroyShape(shape: number): void {
        invoke("bx_destroyShape", [shape]);
    }

    export function destroyFixture(fixture: number): void {
        invoke("bx_destroyFixture", [fixture]);
    }

    export function getFixtureBody(fixture: number): number {
        return invoke("bx_getFixtureBody", [fixture]);
    }

    export function setFixtureMaterial(fixture: number, density: number, friction: number, restitution: number): void {
        invoke("bx_setFixtureMaterial", [fixture, density, friction, restitution]);
    }

    export function setFixtureSensor(fixture: number, sensor: boolean): void {
        invoke("bx_setFixtureSensor", [fixture, sensor ? 1 : 0]);
    }

    export function setFixtureFilter(fixture: number, categoryBits: number, maskBits: number, groupIndex: number): void {
        invoke("bx_setFixtureFilter", [fixture, categoryBits, maskBits, groupIndex]);
    }

    export function testPoint(fixture: number, x: number, y: number): boolean {
        return !!invoke("bx_testPoint", [fixture, x, y]);
    }

    export function setRevoluteJointMotor(joint: number, enabled: boolean, speed: number, maxTorque: number): void {
        invoke("bx_setRevoluteJointMotor", [joint, enabled ? 1 : 0, speed, maxTorque]);
    }

    export function setRevoluteJointLimits(joint: number, enabled: boolean, lower: number, upper: number): void {
        invoke("bx_setRevoluteJointLimits", [joint, enabled ? 1 : 0, lower, upper]);
    }

    export function setWheelJointMotor(joint: number, enabled: boolean, speed: number, maxTorque: number): void {
        invoke("bx_setWheelJointMotor", [joint, enabled ? 1 : 0, speed, maxTorque]);
    }

    export function setWheelJointLimits(joint: number, enabled: boolean, lower: number, upper: number): void {
        invoke("bx_setWheelJointLimits", [joint, enabled ? 1 : 0, lower, upper]);
    }

    export function setWheelJointSuspension(joint: number, stiffness: number, damping: number): void {
        invoke("bx_setWheelJointSuspension", [joint, stiffness, damping]);
    }

    export function setMouseJointTarget(joint: number, x: number, y: number): void {
        invoke("bx_setMouseJointTarget", [joint, x, y]);
    }

    export function getJointAnchors(joint: number): RefCollection {
        return arrayResult("bx_getJointAnchors", [joint]);
    }

    export function destroyJoint(joint: number): void {
        invoke("bx_destroyJoint", [joint]);
    }

    export function getContacts(world: number): RefCollection {
        return arrayResult("bx_getContacts", [world]);
    }

    export function createBody(args: RefCollection): number {
        return invoke("bx_createBody", toNumbers(args));
    }

    export function applyForce(args: RefCollection): void {
        invoke("bx_applyForce", toNumbers(args));
    }

    export function applyLinearImpulse(args: RefCollection): void {
        invoke("bx_applyLinearImpulse", toNumbers(args));
    }

    export function createBoxShape(args: RefCollection): number {
        return invoke("bx_createBoxShape", toNumbers(args));
    }

    export function createFixture(args: RefCollection): number {
        return invoke("bx_createFixture", toNumbers(args));
    }

    export function createDistanceJoint(args: RefCollection): number {
        return invoke("bx_createDistanceJoint", toNumbers(args));
    }

    export function setDistanceJoint(args: RefCollection): void {
        invoke("bx_setDistanceJoint", toNumbers(args));
    }

    export function createRevoluteJoint(args: RefCollection): number {
        return invoke("bx_createRevoluteJoint", toNumbers(args));
    }

    export function createWheelJoint(args: RefCollection): number {
        return invoke("bx_createWheelJoint", toNumbers(args));
    }

    export function createMouseJoint(args: RefCollection): number {
        return invoke("bx_createMouseJoint", toNumbers(args));
    }

    export function queryAABB(args: RefCollection): RefCollection {
        return arrayResult("bx_queryAABB", toNumbers(args));
    }

    export function rayCast(args: RefCollection): RefCollection {
        return arrayResult("bx_rayCast", toNumbers(args));
    }
}
