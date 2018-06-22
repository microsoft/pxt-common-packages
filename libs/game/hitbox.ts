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
            return this.parent.left + this.ox;
        }

        get top() {
            return this.parent.top + this.oy;
        }

        get right() {
            return this.left + this.width - 1;
        }

        get bottom() {
            return this.top + this.height - 1;
        }
    }


    export function calculateHitBoxes(s: Sprite): Hitbox[] {
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
        if (width <= 0 || height <= 0) {
            return [];
        }
        else if (width < 16 && height < 16) {
            return [new Hitbox(s, width, height, minX, minY)]
        }

        const rows = Math.idiv(height, 15) + 1;
        const columns = Math.idiv(width, 15) + 1;
        const boxes: Hitbox[] = [];
        for (let c = 0; c < columns; c++) {
            let boxWidth = 15;
            if (c === columns - 1) {
                boxWidth = width % 15;
            }

            for (let r = 0; r < rows; r++) {
                let boxHeight = 15;
                if (r === rows - 1) {
                    boxHeight = height % 15;
                }
                if (boxWidth > 0 && boxHeight > 0)
                    boxes.push(new Hitbox(s, boxWidth, boxHeight, minX + c * 15, minY + r * 15));
            }
        }
        return boxes;
    }
}