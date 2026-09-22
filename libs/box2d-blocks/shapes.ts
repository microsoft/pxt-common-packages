namespace box2dblocks {
    export enum TriangleType {
        //% block="isosceles"
        Isosceles,
        //% block="right"
        Right
    }

    export class PhysicsPoint {
        constructor(
            public x: number,
            public y: number
        ) {}
    }

    export class PhysicsShape {
        fillColor: number;
        outlineColor: number;

        constructor(
            public type: ShapeType,
            public values: number[],
            public loop: boolean,
            fill = 0,
            outline = 1
        ) {
            this.fillColor = fill;
            this.outlineColor = outline;
        }

        shiftValues(dx: number, dy: number, angle: number) {
            switch (this.type) {
                case ShapeType.Circle:
                    this.values[0] += dx;
                    this.values[1] += dy;
                    break;
                case ShapeType.Box:
                    this.values[0] += dx;
                    this.values[1] += dy;
                    this.values[2] += angle;
                    break;
                case ShapeType.Polygon:
                case ShapeType.Edge:
                case ShapeType.Chain:
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    for (let i = 0; i < this.values.length; i += 2) {
                        this.values[i] = this.values[i] * cos - this.values[i + 1] * sin + dx;
                        this.values[i + 1] = this.values[i] * sin + this.values[i + 1] * cos + dy;
                    }
                    break;
            }
        }

        clone(): PhysicsShape {
            return new PhysicsShape(this.type, this.values.slice(), this.loop);
        }

        shifted(dx: number, dy: number, angle: number): PhysicsShape {
            const clone = this.clone();
            clone.shiftValues(dx, dy, angle);
            return clone;
        }

        toNativeShape(): box2d.Shape {
            switch (this.type) {
                case ShapeType.Circle:
                    return box2d.Shape.circle(this.values[0], this.values[1], this.values[2]);
                case ShapeType.Box:
                    return box2d.Shape.box(this.values[0], this.values[1], this.values[2]);
                case ShapeType.Polygon:
                    return box2d.Shape.polygon(this.values);
                case ShapeType.Edge:
                    return box2d.Shape.edge(this.values[0], this.values[1], this.values[2], this.values[3]);
                case ShapeType.Chain:
                    return box2d.Shape.chain(this.values, this.loop);
                default:
                    throw "Unsupported shape type";
            }
        }
    }


    /**
     * Attach a shape to a body at a specified position and angle.
     */
    //% blockId=box2d_blocks_attach_shape
    //% block="add $shape to $body at $point angle $angle||density $density friction $friction restitution $restitution sensor $sensor"
    //% shape.shadow=box2d_blocks_circle_shape
    //% body.shadow=variables_get body.defl=myBody
    //% point.shadow=box2d_blocks_xy_point
    //% density.min=0 density.defl=1 friction.min=0 friction.defl=0.2 restitution.min=0
    //% sensor.shadow=toggleOnOff
    //% expandableArgumentMode=toggle
    //% inlineInputMode="inline"
    //% group="Shapes" weight=100
    export function addShape(body: Body, shape: PhysicsShape, point: PhysicsPoint | Sprite | tiles.Location | Body, angle: number, density: number = 1, friction: number = 0.2, restitution: number = 0, sensor: boolean = false): void {
        const owner = _state();
        if (!body || body.destroyed || !body.belongsTo(owner) || !shape)
            throw "Cannot attach a shape to this Box2D body.";

        if (point.x || point.y || angle) {
            shape = shape.shifted(point.x / PIXELS_PER_METER, point.y / PIXELS_PER_METER, angle);
        }

        const nativeShape = shape.toNativeShape();

        const fixture = body.nativeBody.createFixture(nativeShape, density, friction, restitution, sensor);
        body.fixtures.push(new _FixtureDrawing(fixture, shape));
        nativeShape.destroy();
    }

    /**
     * Creates a circle shape with the given radius. The circle will be anchored at its center.
     */
    //% blockId=box2d_blocks_circle_shape
    //% block="circle radius $radius||fill $fill outline $outline"
    //% radius.min=1 radius.defl=5
    //% fill.shadow=colorindexpicker
    //% fill.defl=0
    //% outline.shadow=colorindexpicker
    //% outline.defl=1
    //% expandableArgumentMode=toggle
    //% inlineInputMode="inline"
    //% group="Shapes" weight=95
    export function circle(radius: number, fill = 0, outline = 1): PhysicsShape {
        return new PhysicsShape(
            ShapeType.Circle,
            [radius / PIXELS_PER_METER, 0, 0],
            false,
            fill,
            outline
        );
    }

    /**
     * Creates a rectangle shape with the given width and height. The rectangle will be
     * anchored at its center.
     */
    //% blockId=box2d_blocks_box_shape
    //% block="box width $width height $height||fill $fill outline $outline"
    //% width.min=1 width.defl=10 height.min=1 height.defl=10
    //% fill.shadow=colorindexpicker
    //% fill.defl=0
    //% outline.shadow=colorindexpicker
    //% outline.defl=1
    //% expandableArgumentMode=toggle
    //% inlineInputMode="inline"
    //% group="Shapes" weight=90
    export function box(width: number, height: number, fill = 0, outline = 1): PhysicsShape {
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        return new PhysicsShape(
            ShapeType.Box,
            [
                halfWidth / PIXELS_PER_METER, halfHeight / PIXELS_PER_METER,
                0, 0, 0
            ],
            false,
            fill,
            outline
        );
    }

    /**
     * Creates a regular polygon (e.g. equilateral triangle, square, pentagon, etc.) with the given number of sides and side length.
     * The polygon will be anchored at its center.
     */
    //% blockId=box2d_blocks_regular_polygon
    //% block="polygon with $sides sides of length $sideLength||fill $fill outline $outline"
    //% sides.defl=3
    //% sides.min=3
    //% sides.max=8
    //% sideLength.defl=10
    //% fill.shadow=colorindexpicker
    //% fill.defl=0
    //% outline.shadow=colorindexpicker
    //% outline.defl=1
    //% inlineInputMode="inline"
    //% group="Shapes" weight=85
    export function regularPolygon(sides: number, sideLength: number, fill = 0, outline = 1): PhysicsShape {
        if (sides < 3) {
            throw "A regular polygon must have at least 3 sides.";
        }

        if (sides > 8) {
            throw "Box2d polygons can have at most 8 sides.";
        }

        if (sideLength <= 0) {
            throw "Side length must be a positive number.";
        }

        const vertices: PhysicsPoint[] = [];
        const angleSlice = (2 * Math.PI) / sides;

        const radius = sideLength / (2 * Math.sin(Math.PI / sides));

        for (let i = 0; i < sides; i++) {
            const angle = i * angleSlice;
            vertices.push(new PhysicsPoint(
                radius * Math.cos(angle),
                radius * Math.sin(angle)
            ));
        }
        return polygon(vertices, fill, outline);
    }

    /**
     * Creates a half circle shape with the given radius. The flat side of the half circle will be
     * anchored at the origin.
     */
    //% blockId=box2d_blocks_half_circle
    //% block="half circle with radius $radius||fill $fill outline $outline"
    //% radius.defl=10
    //% fill.shadow=colorindexpicker
    //% fill.defl=0
    //% outline.shadow=colorindexpicker
    //% outline.defl=1
    //% inlineInputMode="inline"
    //% group="Shapes" weight=80
    export function halfCircle(radius: number, fill = 0, outline = 1): PhysicsShape {
        const vertices: PhysicsPoint[] = [];
        const angleSlice = Math.PI / 7;

        for (let i = 0; i < 8; i++) {
            const angle = i * angleSlice;
            vertices.push(new PhysicsPoint(
                radius * Math.cos(angle),
                radius * Math.sin(angle)
            ));
        }
        return polygon(vertices, fill, outline);
    }

    /**
     * Creates a triangle shape with the given base and height. If the triangle is isosceles, it
     * will be anchored at the midpoint of the base. If it is a right triangle, it will be anchored
     * at the right angle corner.
     */
    //% blockId=box2d_blocks_triangle
    //% block="$type triangle with base $base height $height||fill $fill outline $outline"
    //% base.defl=10
    //% height.defl=10
    //% fill.shadow=colorindexpicker
    //% fill.defl=0
    //% outline.shadow=colorindexpicker
    //% outline.defl=1
    //% inlineInputMode="inline"
    //% group="Shapes" weight=75
    export function triangle(type: TriangleType, base: number, height: number, fill = 0, outline = 1): PhysicsShape {
        if (base <= 0 || height <= 0)
            throw "Base and height must be positive numbers.";

        if (type === TriangleType.Isosceles) {
            const vertices: PhysicsPoint[] = [
                new PhysicsPoint(-base / 2, 0),
                new PhysicsPoint(base / 2, 0),
                new PhysicsPoint(0, height)
            ];
            return polygon(vertices, fill, outline);
        }
        else if (type === TriangleType.Right) {
            const vertices: PhysicsPoint[] = [
                new PhysicsPoint(0, 0),
                new PhysicsPoint(base, 0),
                new PhysicsPoint(0, height)
            ];
            return polygon(vertices, fill, outline);
        }

        throw "Unsupported triangle type.";
    }

    /**
     * Creates an edge shape from pointA to pointB. An edge is a line segment.
     */
    //% blockId=box2d_blocks_edge
    //% block="line segment from $pointA to $pointB||color $outline"
    //% pointA.shadow=box2d_blocks_xy_point
    //% pointB.shadow=box2d_blocks_xy_point
    //% outline.shadow=colorindexpicker
    //% outline.defl=1
    //% inlineInputMode="inline"
    //% group="Shapes" weight=65
    export function edge(pointA: PhysicsPoint | Sprite | tiles.Location | Body, pointB: PhysicsPoint | Sprite | tiles.Location | Body, outline = 1): PhysicsShape {
        const values = [
            pointA.x / PIXELS_PER_METER, pointA.y / PIXELS_PER_METER,
            pointB.x / PIXELS_PER_METER, pointB.y / PIXELS_PER_METER
        ];
        return new PhysicsShape(
            ShapeType.Edge,
            values,
            false,
            0,
            outline
        );
    }

    /**
     * Creates a polygon shape with the given vertices. The vertices need to be for a
     * convex polygon and listed in clockwise order.
     */
    //% blockId=box2d_blocks_polygon
    //% block="polygon with vertices $vertices||fill $fill outline $outline"
    //% vertices.shadow=lists_create_with
    //% vertices.defl=box2d_blocks_xy_point
    //% fill.shadow=colorindexpicker
    //% fill.defl=0
    //% outline.shadow=colorindexpicker
    //% outline.defl=1
    //% inlineInputMode="inline"
    //% blockGap=8
    //% group="Shapes" weight=60
    export function polygon(vertices: (PhysicsPoint | Sprite | tiles.Location | Body)[], fill = 0, outline = 1): PhysicsShape {
        if (!vertices || vertices.length < 3)
            throw "Polygon shapes need at least three vertices.";

        if (vertices.length > 8)
            throw "Polygon shapes cannot have more than eight vertices.";

        const meters: number[] = [];
        for (let i = 0; i < vertices.length; ++i) {
            if (!vertices[i])
                throw "Polygon vertices cannot be empty.";
            meters.push(vertices[i].x / PIXELS_PER_METER);
            meters.push(vertices[i].y / PIXELS_PER_METER);
        }
        return new PhysicsShape(ShapeType.Polygon, meters, false, fill, outline);
    }

    /**
     * Creates a chain shape with the given vertices. A chain is like multiple edges connected together with
     * no gaps. Perfect for terrain!
     */
    //% blockId=box2d_blocks_chain
    //% block="polyline with vertices $vertices||closed loop $loop color $outline"
    //% vertices.shadow=lists_create_with
    //% vertices.defl=box2d_blocks_xy_point
    //% loop.shadow=toggleOnOff
    //% outline.shadow=colorindexpicker
    //% outline.defl=1
    //% expandableArgumentMode=toggle
    //% inlineInputMode="inline"
    //% group="Shapes" weight=55
    export function chain(vertices: (PhysicsPoint | Sprite | tiles.Location | Body)[], loop: boolean = false, outline = 1): PhysicsShape {
        if (!vertices || vertices.length < 2)
            throw "Chain shapes need at least two vertices.";

        const meters: number[] = [];
        for (let i = 0; i < vertices.length; ++i) {
            if (!vertices[i])
                throw "Chain shape vertices cannot be empty.";
            meters.push(vertices[i].x / PIXELS_PER_METER);
            meters.push(vertices[i].y / PIXELS_PER_METER);
        }
        return new PhysicsShape(ShapeType.Chain, meters, loop, 0, outline);
    }

    //% blockId=box2d_blocks_shift_shape
    //% block="translate $shape by dx $dx dy $dy angle $angle"
    //% shape.shadow=variables_get
    //% shape.defl=myShape
    //% dx.defl=0
    //% dy.defl=0
    //% angle.defl=0
    //% inlineInputMode="inline"
    //% group="Shapes" weight=50
    export function shiftShape(shape: PhysicsShape, dx: number, dy: number, angle: number): PhysicsShape {
        return shape.shifted(dx / PIXELS_PER_METER, dy / PIXELS_PER_METER, angle);
    }

    //% blockId=box2d_blocks_set_shape_color
    //% block="set shape $shape fill $fill outline $outline"
    //% shape.shadow=variables_get
    //% shape.defl=myShape
    //% fill.shadow=colorindexpicker
    //% fill.defl=0
    //% outline.shadow=colorindexpicker
    //% outline.defl=1
    //% group="Shapes" weight=45
    export function setShapeColor(shape: PhysicsShape, fill: number, outline: number): void {
        shape.fillColor = fill;
        shape.outlineColor = outline;
    }
}