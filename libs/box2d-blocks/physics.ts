namespace box2dblocks {
    //% blockId=box2d_blocks_set_position
    //% block="set $body position to $point"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% point.shadow=box2d_blocks_xy_point
    //% group="Physics" weight=100
    //% blockGap=8
    export function setPosition(body: Body, point: PhysicsPoint | Sprite | tiles.Location | Body): void {
        body.nativeBody.setTransform(point.x / PIXELS_PER_METER, point.y / PIXELS_PER_METER, body.angle);
    }

    //% blockId=box2d_blocks_set_velocity
    //% block="set $body velocity to vx $vx vy $vy"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% group="Physics" weight=95
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
    //% group="Physics" weight=40
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
    //% group="Physics" weight=38
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
    //% group="Physics" weight=35
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
    //% group="Physics" weight=33
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
    //% group="Physics" weight=30
    //% blockGap=8
    export function applyTorque(body: Body, torque: number): void {
        body.nativeBody.applyTorque(torque);
    }

    //% blockId=box2d_blocks_apply_angular_impulse
    //% block="apply angular impulse $impulse to $body"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% group="Physics" weight=25
    export function applyAngularImpulse(body: Body, impulse: number): void {
        body.nativeBody.applyAngularImpulse(impulse);
    }

    //% blockId=box2d_blocks_set_damping
    //% block="set $body damping to linear $linear angular $angular"
    //% body.shadow=variables_get body.defl=myBody linear.min=0 angular.min=0
    //% group="Physics" weight=20
    //% blockGap=8
    export function setDamping(body: Body, linear: number, angular: number): void {
        body.nativeBody.setDamping(linear, angular);
    }

    //% blockId=box2d_blocks_set_gravity_scale
    //% block="set $body gravity scale to $scale"
    //% body.shadow=variables_get body.defl=myBody scale.defl=1
    //% group="Physics" weight=15
    export function setGravityScale(body: Body, scale: number): void {
        body.nativeBody.setGravityScale(scale);
    }
}