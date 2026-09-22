namespace box2dblocks {
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
        //% block="distance"
        Distance,
        //% block="revolute"
        Revolute,
        //% block="wheel"
        Wheel
    }

    export enum JointPoint {
        //% block="start"
        Start,
        //% block="center"
        Center,
        //% block="end"
        End
    }

    export class JointAnchor {
        constructor(
            public anchor: BodyAnchor,
            public dx: number,
            public dy: number
        ) {}
    }

    export class Joint extends Destroyable {
        constructor(
            public nativeJoint: box2d.Joint
        ) {
            super();
        }

        destroy(): void {
            this.nativeJoint.destroy();
        }
    }

    export class MouseJoint extends Joint {
        public destroyed = false;

        constructor(
            nativeJoint: box2d.MouseJoint,
            public sprite: Sprite,
            public body: Body,
            private follower: box2d.Body,
            private owner: _SceneState
        ) {
            super(nativeJoint);
        }

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
            (this.nativeJoint as box2d.MouseJoint).setTarget(x, y);
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

    export function _attachAtAnchors(bodyA: Body, anchorA: JointAnchor, bodyB: Body, anchorB: JointAnchor): number[] {
        const owner = _state();
        if (!bodyA || bodyA.destroyed || !bodyA.belongsTo(owner) ||
            !bodyB || bodyB.destroyed || !bodyB.belongsTo(owner) || bodyA == bodyB)
            throw "Cannot attach these Box2D bodies.";

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
                throw "These Box2D bodies are already attached and cannot be aligned.";
        } else if (!aligned && bodyB.type != box2d.BodyType.Static) {
            moveBodies(componentB, offsetX, offsetY);
        } else if (!aligned && bodyA.type != box2d.BodyType.Static) {
            moveBodies(componentA, -offsetX, -offsetY);
            return [anchorX - offsetX, anchorY - offsetY];
        } else if (!aligned) {
            throw "Static Box2D bodies cannot be moved to align this attachment.";
        }
        return [anchorX, anchorY];
    }

    export function _connectBodies(bodyA: Body, bodyB: Body): void {
        if (bodyA.connectedBodies.indexOf(bodyB) < 0)
            bodyA.connectedBodies.push(bodyB);
        if (bodyB.connectedBodies.indexOf(bodyA) < 0)
            bodyB.connectedBodies.push(bodyA);
    }

    export function _createDistanceJoint(bodyA: Body, anchorA: JointAnchor, bodyB: Body, anchorB: JointAnchor): Joint {
        const owner = _state();
        if (!bodyA || bodyA.destroyed || !bodyA.belongsTo(owner) ||
            !bodyB || bodyB.destroyed || !bodyB.belongsTo(owner) || bodyA == bodyB)
            throw "Cannot connect these Box2D bodies.";
        if (!anchorA || !anchorB)
            throw "Distance joints require an anchor on each Box2D body.";

        const localA = bodyA.localAnchor(anchorA);
        const localB = bodyB.localAnchor(anchorB);
        const stateA = bodyA.nativeBody.getState();
        const stateB = bodyB.nativeBody.getState();
        return new Joint(bodyA.nativeBody.createDistanceJoint(
            bodyB.nativeBody,
            pointX(stateA, localA[0], localA[1]),
            pointY(stateA, localA[0], localA[1]),
            pointX(stateB, localB[0], localB[1]),
            pointY(stateB, localB[0], localB[1])
        ));
    }

    //% blockId=box2d_blocks_attach_bodies
    //% block="attach $anchorA of $bodyA to $anchorB of $bodyB with $jointType joint"
    //% anchorA.shadow=box2d_blocks_body_anchor
    //% anchorB.shadow=box2d_blocks_body_anchor
    //% bodyA.shadow=variables_get
    //% bodyA.defl=body
    //% bodyB.shadow=variables_get
    //% bodyB.defl=otherBody
    //% jointType.defl=AttachmentJointType.Revolute
    //% blockSetVariable=myJoint
    //% group="Joints" weight=100
    export function attachBodies(bodyA: Body, anchorA: JointAnchor, bodyB: Body, anchorB: JointAnchor, jointType: AttachmentJointType = AttachmentJointType.Revolute): Joint {
        if (jointType === AttachmentJointType.Distance) {
            return _createDistanceJoint(bodyA, anchorA, bodyB, anchorB);
        }

        const worldAnchor = _attachAtAnchors(bodyA, anchorA, bodyB, anchorB);
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
        _connectBodies(bodyA, bodyB);
        return new Joint(nativeJoint);
    }

    //% blockId=box2d_blocks_configure_distance_joint
    //% block="set distance joint $joint length $length min $minLength max $maxLength||stiffness $stiffness damping $damping"
    //% joint.shadow=variables_get joint.defl=myJoint
    //% expandableArgumentMode=toggle
    //% group="Joints" weight=95
    //% inlineInputMode="inline"
    export function configureDistanceJoint(joint: Joint, length: number, minLength: number, maxLength: number, stiffness: number = 0, damping: number = 0): void {
        if (!joint || !joint.nativeJoint || !joint.nativeJoint.valid || !(joint.nativeJoint instanceof box2d.DistanceJoint)) {
            throw "This Box2D joint is not a distance joint.";
        }

        joint.nativeJoint.configure(
            length / PIXELS_PER_METER,
            minLength / PIXELS_PER_METER,
            maxLength / PIXELS_PER_METER,
            stiffness,
            damping
        );
    }

    //% blockId=box2d_blocks_joint_motor
    //% block="set $joint motor $enabled speed $speed max torque $maxTorque"
    //% joint.shadow=variables_get joint.defl=myJoint enabled.shadow=toggleOnOff
    //% group="Joints" weight=85
    //% inlineInputMode="inline"
    export function setJointMotor(joint: Joint, enabled: boolean, speed: number, maxTorque: number): void {
        if (!joint || !joint.nativeJoint || !joint.nativeJoint.valid) {
            throw "This Box2D joint is invalid.";
        }

        if (joint.nativeJoint instanceof box2d.WheelJoint) {
            joint.nativeJoint.setMotor(enabled, speed, maxTorque);
        }
        else if (joint.nativeJoint instanceof box2d.RevoluteJoint) {
            joint.nativeJoint.setMotor(enabled, speed, maxTorque);
        }
        else {
            throw "This Box2D joint does not support motors.";
        }
    }

    //% blockId=box2d_blocks_joint_limits
    //% block="set $joint limits $enabled lower $lower upper $upper"
    //% joint.shadow=variables_get joint.defl=myJoint enabled.shadow=toggleOnOff
    //% group="Joints" weight=80
    //% inlineInputMode="inline"
    export function setJointLimits(joint: Joint, enabled: boolean, lower: number, upper: number): void {
        if (!joint || !joint.nativeJoint || !joint.nativeJoint.valid) {
            throw "This Box2D joint is invalid.";
        }

        if (joint.nativeJoint instanceof box2d.WheelJoint) {
            joint.nativeJoint.setLimits(
                enabled,
                lower / PIXELS_PER_METER,
                upper / PIXELS_PER_METER
            );
        }
        else if (joint.nativeJoint instanceof box2d.RevoluteJoint) {
            joint.nativeJoint.setLimits(enabled, lower, upper);
        }
        else {
            throw "This Box2D joint does not support limits.";
        }
    }

    //% blockId=box2d_blocks_wheel_suspension
    //% block="set wheel $joint stiffness $stiffness damping $damping"
    //% joint.shadow=variables_get joint.defl=myJoint
    //% group="Joints" weight=60
    export function setWheelSuspension(joint: Joint, stiffness: number, damping: number): void {
        if (!joint || !joint.nativeJoint || !(joint.nativeJoint instanceof box2d.WheelJoint))
            throw "This Box2D joint is not a wheel joint.";
        if (!joint.nativeJoint.valid)
            throw "This Box2D joint is invalid.";
        (joint.nativeJoint as box2d.WheelJoint).setSuspension(stiffness, damping);
    }

    //% blockId=box2d_blocks_joint_point
    //% block="$point of $joint"
    //% joint.shadow=variables_get joint.defl=myJoint
    //% point.defl=JointPoint.Start
    //% group="Joints" weight=55
    export function jointPoint(joint: Joint, point: JointPoint = JointPoint.Start): PhysicsPoint {
        if (!joint || !joint.nativeJoint || !joint.nativeJoint.valid)
            throw "This Box2D joint is invalid.";

        const anchors = joint.nativeJoint.getAnchors();
        let x: number;
        let y: number;
        if (point == JointPoint.Start) {
            x = anchors[0];
            y = anchors[1];
        }
        else if (point == JointPoint.End) {
            x = anchors[2];
            y = anchors[3];
        }
        else if (point == JointPoint.Center) {
            x = (anchors[0] + anchors[2]) / 2;
            y = (anchors[1] + anchors[3]) / 2;
        }
        else {
            throw "Unknown Box2D joint point.";
        }
        return new PhysicsPoint(x * PIXELS_PER_METER, y * PIXELS_PER_METER);
    }

    //% blockId=box2d_blocks_mouse_joint
    //% block="drag $anchor of $body with $sprite||max force $maxForce stiffness $stiffness damping $damping"
    //% anchor.shadow=box2d_blocks_body_anchor
    //% body.shadow=variables_get body.defl=body sprite.shadow=variables_get sprite.defl=mySprite
    //% maxForce.min=0 maxForce.defl=1000 stiffness.min=0 stiffness.defl=100 damping.min=0 damping.defl=10
    //% expandableArgumentMode=toggle
    //% blockSetVariable=mouseJoint
    //% inlineInputMode="inline"
    //% group="Joints" weight=75
    export function createMouseJoint(sprite: Sprite, body: Body, anchor: JointAnchor, maxForce: number = 1000, stiffness: number = 100, damping: number = 10): Joint {
        const owner = _state();
        if (!sprite || (sprite.flags & sprites.Flag.Destroyed))
            throw "Cannot create a mouse joint for this sprite.";
        if (!body || body.destroyed || !body.belongsTo(owner) || body.type != box2d.BodyType.Dynamic)
            throw "Mouse joints require a valid dynamic Box2D body.";
        if (!anchor)
            throw "Mouse joints require an anchor on the Box2D body.";

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

    //% blockId=box2d_blocks_destroy_joint
    //% block="destroy $joint"
    //% joint.shadow=variables_get joint.defl=myJoint
    //% group="Joints" weight=70
    export function destroyJoint(joint: Joint): void {
        if (joint) joint.destroy();
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
}