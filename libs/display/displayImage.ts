namespace display {
    /**
     * Show an image on the screen
     * @param image image to draw
     */
    //% blockId=displayshowimage block="show image %image=displayimagepicker"
    //% weight=100 group="Screen" blockGap=8
    //% help=display/show-image
    export function showImage(image: Image) {
        if (!image) return;
        screen.drawImage(image, 0, 0)
    }

    /**
     * An image
     * @param image the image
     */
    //% blockId=displayimagepicker block="%image" shim=TD_ID
    //% image.fieldEditor="images"
    //% image.fieldOptions.columns=6
    //% image.fieldOptions.width=600
    //% weight=0 blockHidden=1
    export function __imagePicker(image: Image): Image {
        return image;
    }
}