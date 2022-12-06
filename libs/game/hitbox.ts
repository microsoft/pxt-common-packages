namespace game {
    export class Hitbox {
        hash: number;
        parent: Sprite;
        ox: Fx8;
        oy: Fx8;
        width: Fx8;
        height: Fx8;

        constructor(parent: Sprite, width: Fx8, height: Fx8, ox: Fx8, oy: Fx8) {
            this.hash = parent.calcDimensionalHash();
            this.parent = parent;
            this.width = width;
            this.height = height;
            this.ox = ox;
            this.oy = oy;
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

        isValid() {
            return this.hash === this.parent.calcDimensionalHash();
        }

        contains(x: Fx8, y: Fx8): boolean {
            return (x >= this.left) && (x <= this.right) && (y >= this.top) && (y <= this.bottom);
        }

        updateIfInvalid() {
            if (this.isValid())
                return;

            const newHitBox = game.calculateHitBox(this.parent);

            const oMinX = this.ox;
            const oMinY = this.oy;
            const oMaxX = Fx.add(oMinX, this.width);
            const oMaxY = Fx.add(oMinY, this.height);

            const nMinX = newHitBox.ox;
            const nMinY = newHitBox.oy;
            const nMaxX = Fx.add(nMinX, newHitBox.width);
            const nMaxY = Fx.add(nMinY, newHitBox.height);

            // total diff in x / y corners between the two hitboxes
            const xDiff = Fx.add(
                Fx.abs(Fx.sub(oMinX, nMinX)),
                Fx.abs(Fx.sub(oMaxX, nMaxX))
            );
            const yDiff = Fx.add(
                Fx.abs(Fx.sub(oMinY, nMinY)),
                Fx.abs(Fx.sub(oMaxY, nMaxY))
            );

            // If it's just a small change to the hitbox on one axis,
            // don't change the dimensions to avoid random clipping
            if (xDiff > Fx.twoFx8) {
                this.ox = nMinX;
                this.width = newHitBox.width;
            }
            if (yDiff > Fx.twoFx8) {
                this.oy = nMinY;
                this.height = newHitBox.height;
            }
            this.hash = newHitBox.hash;
        }

        overlapsWith(other: Hitbox): boolean {
            this.updateIfInvalid();
            other.updateIfInvalid();
            if (this.contains(other.left, other.top)) return true;
            if (this.contains(other.left, other.bottom)) return true;
            if (this.contains(other.right, other.top)) return true;
            if (this.contains(other.right, other.bottom)) return true;
            if (other.contains(this.left, this.top)) return true;
            if (other.contains(this.left, this.bottom)) return true;
            if (other.contains(this.right, this.top)) return true;
            if (other.contains(this.right, this.bottom)) return true;
            return false;
        }
    }


    export function calculateHitBox(s: Sprite): Hitbox {
        if (s._hitbox && s._hitbox.isValid())
            return s._hitbox;

        const i = s.image;
        let minX = Fx8(i.width);
        let minY = Fx8(i.height);
        let maxX = Fx.zeroFx8;
        let maxY = Fx.zeroFx8;

        for (let c = 0, fxc = Fx.zeroFx8; c < i.width; c++, fxc = Fx.add(fxc, Fx.oneFx8)) {
            for (let r = 0, fxr = Fx.zeroFx8; r < i.height; r++, fxr = Fx.add(fxr, Fx.oneFx8)) {
                if (i.getPixel(c, r)) {
                    minX = Fx.min(minX, fxc);
                    minY = Fx.min(minY, fxr);
                    maxX = Fx.max(maxX, fxc);
                    maxY = Fx.max(maxY, fxr);
                }
            }
        }

        minX = Fx.mul(minX, s._sx);
        minY = Fx.mul(minY, s._sy);
        maxX = Fx.mul(maxX, s._sx);
        maxY = Fx.mul(maxY, s._sy);
        const width  = Fx.add(Fx.sub(maxX, minX), s._sx);
        const height = Fx.add(Fx.sub(maxY, minY), s._sy);

        return new Hitbox(s, width, height, Fx.floor(minX), Fx.floor(minY));
    }
}