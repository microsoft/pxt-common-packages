namespace images {
    //% blockId=screen_image_picker block="%img"
    //% shim=TD_ID
    //% img.fieldEditor="sprite"
    //% img.fieldOptions.taggedTemplate="img"
    //% weight=100
    export function _spriteImage(img: Image) {
        return img
    }

    /**
     * An image
     * @param image the image
     */
    //% blockId=image_picker block="%image" shim=TD_ID
    //% image.fieldEditor="images"
    //% image.fieldOptions.columns=6
    //% image.fieldOptions.width=600
    //% weight=0
    export function _image(image: Image): Image {
        return image;
    }
}