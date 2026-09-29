namespace box2dblocks {
    //% blockId=box2d_blocks_set_position
    //% block="set $body position to $point"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% point.shadow=box2d_blocks_xy_point
    //% blockNamespace=box2dphysics group="Motion" weight=100
    //% blockGap=8
    export function setPosition(body: Body, point: PhysicsPoint | Sprite | tiles.Location | Body): void {
        body.nativeBody.setTransform(point.x / PIXELS_PER_METER, point.y / PIXELS_PER_METER, body.angle);
    }

    //% blockId=box2d_blocks_set_velocity
    //% block="set $body velocity to vx $vx vy $vy"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% blockNamespace=box2dphysics group="Motion" weight=95
    export function setVelocity(body: Body, vx: number, vy: number): void {
        body.nativeBody.setLinearVelocity(vx / PIXELS_PER_METER, vy / PIXELS_PER_METER);
    }

    function applicationPoint(body: Body, anchor: JointAnchor): number[] {
        if (!anchor)
            anchor = new JointAnchor(BodyAnchor.Center, 0, 0);
        const localAnchor = body.localAnchor(anchor);
        const snapshot = body.nativeBody.getState();
        return [
            pointX(snapshot, localAnchor[0], localAnchor[1]),
            pointY(snapshot, localAnchor[0], localAnchor[1])
        ];
    }

    //% blockId=box2d_blocks_apply_force_center
    //% block="apply force x $x y $y to $body||at $anchor"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% anchor.shadow=box2d_blocks_body_anchor
    //% expandableArgumentMode=toggle
    //% inlineInputMode="inline"
    //% blockNamespace=box2dphysics group="Forces & Impulses" weight=100
    //% blockGap=8
    export function applyForce(body: Body, x: number, y: number, anchor: JointAnchor = null): void {
        const point = applicationPoint(body, anchor);
        body.nativeBody.applyForce(x, y, point[0], point[1]);
    }

    //% blockId=box2d_blocks_apply_force_angle
    //% block="apply force magnitude $magnitude angle $angle to $body||at $anchor"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% anchor.shadow=box2d_blocks_body_anchor
    //% magnitude.min=0 angle.defl=0
    //% expandableArgumentMode=toggle
    //% inlineInputMode="inline"
    //% blockNamespace=box2dphysics group="Forces & Impulses" weight=95
    export function applyForceAtAngle(body: Body, magnitude: number, angle: number, anchor: JointAnchor = null): void {
        applyForce(
            body,
            magnitude * Math.cos(angle),
            magnitude * Math.sin(angle),
            anchor
        );
    }

    //% blockId=box2d_blocks_apply_impulse_center
    //% block="apply impulse x $x y $y to $body||at $anchor"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% anchor.shadow=box2d_blocks_body_anchor
    //% expandableArgumentMode=toggle
    //% inlineInputMode="inline"
    //% blockNamespace=box2dphysics group="Forces & Impulses" weight=90
    //% blockGap=8
    export function applyLinearImpulse(body: Body, x: number, y: number, anchor: JointAnchor = null): void {
        const point = applicationPoint(body, anchor);
        body.nativeBody.applyLinearImpulse(x, y, point[0], point[1]);
    }

    //% blockId=box2d_blocks_apply_impulse_angle
    //% block="apply impulse magnitude $magnitude angle $angle to $body||at $anchor"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% anchor.shadow=box2d_blocks_body_anchor
    //% magnitude.min=0 angle.defl=0
    //% expandableArgumentMode=toggle
    //% inlineInputMode="inline"
    //% blockNamespace=box2dphysics group="Forces & Impulses" weight=85
    export function applyLinearImpulseAtAngle(body: Body, magnitude: number, angle: number, anchor: JointAnchor = null): void {
        applyLinearImpulse(
            body,
            magnitude * Math.cos(angle),
            magnitude * Math.sin(angle),
            anchor
        );
    }

    //% blockId=box2d_blocks_apply_torque
    //% block="apply torque $torque to $body"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% blockNamespace=box2dphysics group="Forces & Impulses" weight=80
    //% blockGap=8
    export function applyTorque(body: Body, torque: number): void {
        body.nativeBody.applyTorque(torque);
    }

    //% blockId=box2d_blocks_apply_angular_impulse
    //% block="apply angular impulse $impulse to $body"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% blockNamespace=box2dphysics group="Forces & Impulses" weight=75
    export function applyAngularImpulse(body: Body, impulse: number): void {
        body.nativeBody.applyAngularImpulse(impulse);
    }

    //% blockId=box2d_blocks_set_damping
    //% block="set $body damping to linear $linear angular $angular"
    //% body.shadow=variables_get body.defl=myBody linear.min=0 angular.min=0
    //% blockNamespace=box2dphysics group="Body Configuration" weight=100
    //% blockGap=8
    export function setDamping(body: Body, linear: number, angular: number): void {
        body.nativeBody.setDamping(linear, angular);
    }

    //% blockId=box2d_blocks_set_gravity_scale
    //% block="set $body gravity scale to $scale"
    //% body.shadow=variables_get body.defl=myBody scale.defl=1
    //% blockNamespace=box2dphysics group="Body Configuration" weight=95
    export function setGravityScale(body: Body, scale: number): void {
        body.nativeBody.setGravityScale(scale);
    }

    /**
     * Override fixture material values for this body. Omitted density and
     * restitution values retain their existing settings.
     */
    //% blockId=box2d_blocks_set_body_material
    //% block="set $body friction $friction||density $density restitution $restitution"
    //% body.shadow=variables_get body.defl=myBody
    //% friction.min=0 friction.defl=0.2 density.min=0 density.defl=1 restitution.min=0 restitution.defl=0
    //% expandableArgumentMode=toggle
    //% inlineInputMode="inline"
    //% blockNamespace=box2dphysics group="Body Configuration" weight=90
    export function setBodyMaterial(body: Body, friction: number, density?: number, restitution?: number): void {
        const owner = _state();
        if (!body || body.destroyed || !body.belongsTo(owner) || !body.nativeBody.valid)
            throw "This Box2D body is invalid.";
        validateMaterialValue(friction);
        if (density !== undefined)
            validateMaterialValue(density);
        if (restitution !== undefined)
            validateMaterialValue(restitution);

        for (let i = 0; i < body.fixtures.length; ++i) {
            const fixture = body.fixtures[i].fixture;
            fixture.setFriction(friction);
            if (density !== undefined)
                fixture.setDensity(density);
            if (restitution !== undefined)
                fixture.setRestitution(restitution);
        }
    }

    function validateMaterialValue(value: number): void {
        if (value < 0 || value > 1000000 || value != value)
            throw "Fixture material values must be nonnegative finite numbers.";
    }
}