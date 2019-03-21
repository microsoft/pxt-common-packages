namespace game {
    export class Hitbox {
        parent: Sprite;
        ox: number;
        oy: number;
        width: number;
        height: number;

        constructor(parent: Sprite, width: number, height: number, ox: number, oy: number) {
            this.width = width;
            this.height = height;
            this.parent = parent;
            this.ox = ox;
            this.oy = oy;
        }

        get left() {
            return Fx.iadd(this.ox, this.parent._x)
        }

        get top() {
            return Fx.iadd(this.oy, this.parent._y)
        }

        get right() {
            return Fx.iadd(this.width - 1, this.left)
        }

        get bottom() {
            return Fx.iadd(this.height - 1, this.top)
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