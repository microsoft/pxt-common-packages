namespace sprites {
    export class RotatedBoundingBox {
        protected _x: number;
        protected _y: number;
        protected _rotation: number;

        protected points: number[];
        protected cornerDistance: number;
        protected cornerAngle: number;

        public get cx() {
            return this._x;
        }

        public set cx(value: number) {
            this.setPosition(value, this._y);
        }

        public get cy() {
            return this._y;
        }

        public set cy(value: number) {
            this.setPosition(this._x, value);
        }

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

        constructor(
            x: number,
            y: number,
            width: number,
            height: number
        ) {
            this._x = x;
            this._y = y;
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
            this.points[0] = this._x + Math.cos(this.cornerAngle + angle) * this.cornerDistance;
            this.points[1] = this._y + Math.sin(this.cornerAngle + angle) * this.cornerDistance;
            this.points[2] = this._x + Math.cos(Math.PI - this.cornerAngle + angle) * this.cornerDistance;
            this.points[3] = this._y + Math.sin(Math.PI - this.cornerAngle + angle) * this.cornerDistance;
            this.points[4] = this._x + Math.cos(Math.PI + this.cornerAngle + angle) * this.cornerDistance;
            this.points[5] = this._y + Math.sin(Math.PI + this.cornerAngle + angle) * this.cornerDistance;
            this.points[6] = this._x + Math.cos(-this.cornerAngle + angle) * this.cornerDistance;
            this.points[7] = this._y + Math.sin(-this.cornerAngle + angle) * this.cornerDistance
        }

        setPosition(x: number, y: number) {
            const dx = x - this._x;
            const dy = y - this._y;
            for (let i = 0; i < 8; i += 2) {
                this.points[i] += dx;
                this.points[i + 1] += dy;
            }
            this._x = x;
            this._y = y;
        }

        overlaps(other: RotatedBoundingBox): boolean {
            return doRectanglesIntersect(this.points, other.points);
        }

        overlapsAABB(left: number, top: number, right: number, bottom: number) {
            return doRectanglesIntersect(
                this.points,
                [
                    left, top,
                    right, top,
                    right, bottom,
                    left, bottom
                ]
            );
        }

        drawTexture(dest: Image, texture: Image, drawOffsetX: number, drawOffsetY: number) {
            gpu.drawTexturedQuad(
                dest,
                texture,
                this.x0 - drawOffsetX,
                this.y0 - drawOffsetY,
                0,
                1,
                this.x1 - drawOffsetX,
                this.y1 - drawOffsetY,
                1,
                1,
                this.x2 - drawOffsetX,
                this.y2 - drawOffsetY,
                1,
                0,
                this.x3 - drawOffsetX,
                this.y3 - drawOffsetY,
                0,
                0,
            );
        }
    }

    // adapted from https://stackoverflow.com/questions/10962379/how-to-check-intersection-between-2-rotated-rectangles
    // but optimized for rectangles
    function doRectanglesIntersect(a: number[], b: number[]) {
        const rects = [a, b];

        for (const rect of rects) {
            // we only need to check the first two sides because the
            // normals are the same for the other two
            for (let pointIndex = 0; pointIndex < 4; pointIndex += 2) {
                const normalX = rect[pointIndex + 3] - rect[pointIndex + 1];
                const normalY = rect[pointIndex] - rect[pointIndex + 2];

                let minA: number = undefined;
                let maxA: number = undefined;
                let minB: number = undefined;
                let maxB: number = undefined;

                for (let i = 0; i < 8; i += 2) {
                    const projected = normalX * a[i] + normalY * a[i + 1];

                    if (minA === undefined || projected < minA) {
                        minA = projected;
                    }
                    if (maxA == undefined || projected > maxA) {
                        maxA = projected;
                    }
                }

                for (let i = 0; i < 8; i += 2) {
                    const projected = normalX * b[i] + normalY * b[i + 1];

                    if (minB === undefined || projected < minB) {
                        minB = projected;
                    }
                    if (maxB == undefined || projected > maxB) {
                        maxB = projected;
                    }
                }

                if (maxA < minB || maxB < minA) {
                    return false;
                }
            }
        }
        return true;
    }
}