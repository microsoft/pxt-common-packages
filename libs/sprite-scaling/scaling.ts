//% color="#95078E" weight=99 icon="\u2195" block="Sprite Scaling"
namespace scaling {
    //% blockId=sprite_scale_to_percent_ex
    //% block="set $sprite=variables_get(mySprite) scale to $value percent $direction anchor $anchor"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% value.defl=150
    //% direction.defl=ScaleDirection.Uniformly
    //% anchor.defl=ScaleAnchor.Middle
    //% help=sprites/sprite-scaling/scale
    export function scaleToPercent(sprite: Sprite, value: number, direction?: ScaleDirection, anchor?: ScaleAnchor): void {
        value /= 100;
        direction = direction || ScaleDirection.Uniformly;
        anchor = anchor || ScaleAnchor.Middle;

        let sx: number;
        let sy: number;

        if (direction & ScaleDirection.Horizontally) sx = value;
        if (direction & ScaleDirection.Vertically) sy = value;

        sprite.setScaleCore(sx, sy, anchor);
    }

    //% blockId=sprite_scale_by_percent_ex
    //% block="change $sprite=variables_get(mySprite) scale by $value percent $direction anchor $anchor"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% value.defl=50
    //% direction.defl=ScaleDirection.Uniformly
    //% anchor.defl=ScaleAnchor.Middle
    //% help=sprites/sprite-scaling/scale
    export function scaleByPercent(sprite: Sprite, value: number, direction?: ScaleDirection, anchor?: ScaleAnchor): void {
        value /= 100;
        direction = direction || ScaleDirection.Uniformly;
        anchor = anchor || ScaleAnchor.Middle;

        let sx: number;
        let sy: number;

        if (direction & ScaleDirection.Horizontally) sx = sprite.sx + value;
        if (direction & ScaleDirection.Vertically) sy = sprite.sy + value;

        sprite.setScaleCore(sx, sy, anchor);
    }

    //% blockId=sprite_scale_to_pixels_ex
    //% block="set $sprite=variables_get(mySprite) scale to $value pixels $direction anchor $anchor || proportional $proportional"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% value.defl=32
    //% direction.defl=ScaleDirection.Horizontally
    //% anchor.defl=ScaleAnchor.Middle
    //% proportional.defl=0
    //% help=sprites/sprite-scaling/scale
    export function scaleToPixels(sprite: Sprite, value: number, direction?: ScaleDirection, anchor?: ScaleAnchor, proportional?: boolean): void {
        direction = direction || ScaleDirection.Horizontally;
        anchor = anchor || ScaleAnchor.Middle;

        if (proportional == null) proportional = direction === ScaleDirection.Uniformly;

        let sx: number;
        let sy: number;

        if (direction & ScaleDirection.Horizontally) {
            const imgW = sprite.image.width;
            const newW = value;
            sx = newW / imgW;
        }

        if (direction & ScaleDirection.Vertically) {
            const imgH = sprite.image.height;
            const newH = value;
            sy = newH / imgH;
        }

        sprite.setScaleCore(sx, sy, anchor, proportional);
    }

    //% blockId=sprite_scale_by_pixels_ex
    //% block="change $sprite=variables_get(mySprite) scale by $value pixels $direction anchor $anchor || proportional $proportional"
    //% expandableArgumentMode=enabled
    //% inlineInputMode=inline
    //% value.defl=10
    //% direction.defl=ScaleDirection.Horizontally
    //% anchor.defl=ScaleAnchor.Middle
    //% proportional.defl=0
    //% help=sprites/sprite-scaling/scale
    export function scaleByPixels(sprite: Sprite, value: number, direction?: ScaleDirection, anchor?: ScaleAnchor, proportional?: boolean): void {
        direction = direction || ScaleDirection.Horizontally;
        anchor = anchor || ScaleAnchor.Middle;

        if (proportional == null) proportional = direction === ScaleDirection.Uniformly;

        let sx: number;
        let sy: number;

        if (direction & ScaleDirection.Horizontally) {
            const imgW = sprite.image.width;
            const newW = sprite.width + value;
            sx = newW / imgW;
        }

        if (direction & ScaleDirection.Vertically) {
            const imgH = sprite.image.height;
            const newH = sprite.height + value;
            sy = newH / imgH;
        }

        sprite.setScaleCore(sx, sy, anchor, proportional);
    }
}