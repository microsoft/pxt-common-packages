namespace box2dblocks {
    //% blockId=box2d_blocks_set_position
    //% block="set $body position $point"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% point.shadow=box2d_blocks_xy_point
    //% group="Physics" weight=100
    //% blockGap=8
    export function setPosition(body: Body, point: PhysicsPoint | Sprite | tiles.Location | Body): void {
        body.nativeBody.setTransform(point.x / PIXELS_PER_METER, point.y / PIXELS_PER_METER, body.angle);
    }

    //% blockId=box2d_blocks_set_velocity
    //% block="set $body velocity vx $vx vy $vy"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% group="Physics" weight=95
    export function setVelocity(body: Body, vx: number, vy: number): void {
        body.nativeBody.setLinearVelocity(vx / PIXELS_PER_METER, vy / PIXELS_PER_METER);
    }

    //% blockId=box2d_blocks_apply_force_center
    //% block="apply force x $x y $y to center of $body"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% group="Physics" weight=40
    //% blockGap=8
    export function applyForceToCenter(body: Body, x: number, y: number): void {
        body.nativeBody.applyForceToCenter(x, y);
    }

    //% blockId=box2d_blocks_apply_impulse_center
    //% block="apply impulse x $x y $y to center of $body"
    //% body.shadow=variables_get
    //% body.defl=myBody
    //% group="Physics" weight=35
    export function applyLinearImpulseToCenter(body: Body, x: number, y: number): void {
        body.nativeBody.applyLinearImpulseToCenter(x, y);
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
    //% block="set $body damping linear $linear angular $angular"
    //% body.shadow=variables_get body.defl=myBody linear.min=0 angular.min=0
    //% group="Physics" weight=20
    //% blockGap=8
    export function setDamping(body: Body, linear: number, angular: number): void {
        body.nativeBody.setDamping(linear, angular);
    }

    //% blockId=box2d_blocks_set_gravity_scale
    //% block="set $body gravity scale $scale"
    //% body.shadow=variables_get body.defl=myBody scale.defl=1
    //% group="Physics" weight=15
    export function setGravityScale(body: Body, scale: number): void {
        body.nativeBody.setGravityScale(scale);
    }
}