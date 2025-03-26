namespace sprites {
    let aabbPoints: number[];

    export class RotatedBoundingBox {
        protected _rotation: number;
        protected _width: number;
        protected _height: number;

        protected points: number[];
        protected cornerDistance: number;
        protected cornerAngle: number;

        public get x0(): number {
            return this.points[0];
        }

        public get y0(): number {
            return this.points[1];
        }

        public get x1(): number {
            return this.points[2];
        }

        public get y1(): number {
            return this.points[3];
        }

        public get x2(): number {
            return this.points[4];
        }

        public get y2(): number {
            return this.points[5];
        }

        public get x3(): number {
            return this.points[6];
        }

        public get y3(): number {
            return this.points[7];
        }

        public get rotation() {
            return this._rotation;
        }

        public set rotation(value: number) {
            this.setRotation(value);
        }

        public get width() {
            return this._width;
        }

        public get height() {
            return this._height;
        }

        constructor(
            public anchor: Sprite,
            width: number,
            height: number
        ) {
            this.points = [];
            this._rotation = 0;
            this.setDimensions(width, height);
        }

        setDimensions(width: number, height: number) {
            width /= 2;
            height /= 2;

            this.cornerDistance = Math.sqrt(
                width * width + height * height
            );
            this.cornerAngle = Math.atan2(height, width);
            this.setRotation(this._rotation);
        }

        setRotation(angle: number) {
            this._rotation = angle;
            this.points[0] = Math.cos(this.cornerAngle + angle) * this.cornerDistance;
            this.points[1] = Math.sin(this.cornerAngle + angle) * this.cornerDistance;
            this.points[2] = Math.cos(Math.PI - this.cornerAngle + angle) * this.cornerDistance;
            this.points[3] = Math.sin(Math.PI - this.cornerAngle + angle) * this.cornerDistance;
            this.points[4] = Math.cos(Math.PI + this.cornerAngle + angle) * this.cornerDistance;
            this.points[5] = Math.sin(Math.PI + this.cornerAngle + angle) * this.cornerDistance;
            this.points[6] = Math.cos(angle - this.cornerAngle) * this.cornerDistance;
            this.points[7] = Math.sin(angle - this.cornerAngle) * this.cornerDistance;
            this.updateWidthHeight();
        }

        overlaps(other: RotatedBoundingBox): boolean {
            return doRectanglesIntersect(
                this.points,
                this.anchor.x,
                this.anchor.y,
                other.points,
                other.anchor.x,
                other.anchor.y
            );
        }

        overlapsAABB(left: number, top: number, right: number, bottom: number) {
            if (!aabbPoints) {
                aabbPoints = [];
            }

            aabbPoints[0] = left;
            aabbPoints[1] = top;
            aabbPoints[2] = right;
            aabbPoints[3] = top;
            aabbPoints[4] = right;
            aabbPoints[5] = bottom;
            aabbPoints[6] = left;
            aabbPoints[7] = bottom;
            return doRectanglesIntersect(
                this.points,
                this.anchor.x,
                this.anchor.y,
                aabbPoints,
                0,
                0
            );
        }

        protected updateWidthHeight() {
            let minX = this.points[0];
            let maxX = minX;
            let minY = this.points[1];
            let maxY = minY;

            for (let i = 2; i < 8; i += 2) {
                minX = Math.min(minX, this.points[i]);
                maxX = Math.max(maxX, this.points[i]);
                minY = Math.min(minY, this.points[i + 1]);
                maxY = Math.max(maxY, this.points[i + 1]);
            }

            this._width = maxX - minX;
            this._height = maxY - minY;
        }
    }

    // adapted from https://stackoverflow.com/questions/10962379/how-to-check-intersection-between-2-rotated-rectangles
    // but optimized for rectangles
    function doRectanglesIntersect(a: number[], ax: number, ay: number, b: number[], bx: number, by: number) {
        return !(checkForNonIntersection(a, ax, ay, b, bx, by) || checkForNonIntersection(b, bx, by, a, ax, ay));
    }

    function checkForNonIntersection(a: number[], ax: number, ay: number, b: number[], bx: number, by: number) {
        // we only need to check the first two sides because the
        // normals are the same for the other two
        for (let pointIndex = 0; pointIndex < 4; pointIndex += 2) {
            const normalX = a[pointIndex + 3] - a[pointIndex + 1];
            const normalY = a[pointIndex] - a[pointIndex + 2];

            let minA: number = undefined;
            let maxA: number = undefined;
            let minB: number = undefined;
            let maxB: number = undefined;

            for (let i = 0; i < 8; i += 2) {
                const projected = normalX * (a[i] + ax) + normalY * (a[i + 1] + ay);

                if (minA === undefined || projected < minA) {
                    minA = projected;
                }
                if (maxA == undefined || projected > maxA) {
                    maxA = projected;
                }
            }

            for (let i = 0; i < 8; i += 2) {
                const projected = normalX * (b[i] + bx) + normalY * (b[i + 1] + by);

                if (minB === undefined || projected < minB) {
                    minB = projected;
                }
                if (maxB == undefined || projected > maxB) {
                    maxB = projected;
                }
            }

            if (maxA < minB || maxB < minA) {
                return true;
            }
        }

        return false;
    }
}