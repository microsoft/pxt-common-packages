namespace sprites {
    //% blockId=sprite_set_scale_ex
    //% block="set %sprite=variables_get(mySprite) scale to $value || $direction anchor $anchor"
    //% advanced=true
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% value.defl=1
    //% direction.defl=ScaleDirection.Uniformly
    //% anchor.defl=ScaleAnchor.Middle
    //% help=sprites/sprite-scaling/set-scale
    //% group="Scale" weight=90
    export function setScale(sprite: Sprite, value: number, direction?: ScaleDirection, anchor?: ScaleAnchor): void {
        direction = direction || ScaleDirection.Uniformly;
        anchor = anchor || ScaleAnchor.Middle;

        let sx: number;
        let sy: number;

        if (direction & ScaleDirection.Horizontally) sx = value;
        if (direction & ScaleDirection.Vertically) sy = value;

        sprite.setScaleCore(sx, sy, anchor);
    }

    //% blockId=sprite_grow_by_percent_ex
    //% block="grow %sprite=variables_get(mySprite) by $amount percent || $direction anchor $anchor"
    //% advanced=true
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% amount.defl=10
    //% direction.defl=ScaleDirection.Uniformly
    //% anchor.defl=ScaleAnchor.Middle
    //% help=sprites/sprite-scaling/grow-by-amount
    //% group="Scale" weight=80
    export function growByPercent(sprite: Sprite, amount: number, direction?: ScaleDirection, anchor?: ScaleAnchor): void {
        amount /= 100;
        direction = direction || ScaleDirection.Uniformly;
        anchor = anchor || ScaleAnchor.Middle;

        let sx: number;
        let sy: number;

        if (direction & ScaleDirection.Horizontally) sx = sprite.sx + amount;
        if (direction & ScaleDirection.Vertically) sy = sprite.sy + amount;

        sprite.setScaleCore(sx, sy, anchor);
    }

    //% blockId=sprite_shrink_by_percent_ex
    //% block="shrink %sprite=variables_get(mySprite) by $amount percent || $direction anchor $anchor"
    //% advanced=true
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% amount.defl=10
    //% direction.defl=ScaleDirection.Uniformly
    //% anchor.defl=ScaleAnchor.Middle
    //% help=sprites/sprite-scaling/shrink-by-percent
    //% group="Scale" weight=70
    export function shrinkByPercent(sprite: Sprite, amount: number, direction?: ScaleDirection, anchor?: ScaleAnchor): void {
        growByPercent(sprite, -amount, direction, anchor);
    }

    //% blockId=sprite_grow_by_pixels_ex
    //% block="grow %sprite=variables_get(mySprite) by $amount pixels $direction || anchor $anchor proportional $proportional"
    //% advanced=true
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% amount.defl=10
    //% direction.defl=ScaleDirection.Horizontally
    //% anchor.defl=ScaleAnchor.Middle
    //% proportional.defl=0
    //% help=sprites/sprite-scaling/grow-by-pixels
    //% group="Scale" weight=60
    export function growByPixels(sprite: Sprite, amount: number, direction?: ScaleDirection, anchor?: ScaleAnchor, proportional?: boolean): void {
        direction = direction || ScaleDirection.Horizontally;
        anchor = anchor || ScaleAnchor.Middle;
        if (typeof proportional !== 'boolean') proportional = direction === ScaleDirection.Uniformly;

        let sx: number;
        let sy: number;

        if (direction & ScaleDirection.Horizontally) {
            const imgW = sprite._image.width;
            const newW = sprite.width + amount;
            sx = newW / imgW;
        }

        if (direction & ScaleDirection.Vertically) {
            const imgH = sprite._image.height;
            const newH = sprite.height + amount;
            sy = newH / imgH;
        }

        sprite.setScaleCore(sx, sy, anchor, proportional);
    }

    //% blockId=sprite_shrink_by_pixels
    //% block="shrink %sprite=variables_get(mySprite) by $amount pixels $direction || anchor $anchor proportional $proportional"
    //% advanced=true
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% amount.defl=10
    //% direction.defl=ScaleDirection.Horizontally
    //% anchor.defl=ScaleAnchor.Middle
    //% proportional.defl=0
    //% help=sprites/sprite-scaling/grow-by-pixels
    //% group="Scale" weight=50
    export function shrinkByPixels(sprite: Sprite, amount: number, direction?: ScaleDirection, anchor?: ScaleAnchor, proportional?: boolean): void {
        growByPixels(sprite, -amount, direction, anchor, proportional);
    }
}