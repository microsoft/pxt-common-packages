namespace game {
    export class Hitbox {
        parent: Sprite;
        ox: Fx8;
        oy: Fx8;
        width: Fx8;
        height: Fx8;

        constructor(parent: Sprite, width: number, height: number, ox: number, oy: number) {
            this.parent = parent;
            this.width = Fx8(width);
            this.height = Fx8(height);
            this.ox = Fx8(ox);
            this.oy = Fx8(oy);
        }

        get left() {
            return Fx.add(this.ox, this.parent._x);
        }

        get top() {
            return Fx.add(this.oy, this.parent._y);
        }

        get right() {
            return Fx.sub(
                Fx.add(this.width, this.left),
                Fx.oneFx8
            );
        }

        get bottom() {
            return Fx.sub(
                Fx.add(this.height, this.top),
                Fx.oneFx8
            );
        }
    }


    export function calculateHitBox(s: Sprite): Hitbox {
        const i = s.image;
        let minX = i.width;
        let minY = i.height;
        let maxX = 0;
        let maxY = 0;

        for (let c = 0; c < i.width; c++) {
            for (let r = 0; r < i.height; r++) {
                if (i.getPixel(c, r)) {
                    minX = Math.min(minX, c);
                    minY = Math.min(minY, r);
                    maxX = Math.max(maxX, c);
                    maxY = Math.max(maxY, r);
                }
            }
        }

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        return new Hitbox(s, width, height, minX, minY);
    }
}