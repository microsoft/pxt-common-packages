namespace display {
    /**
     * Show an image on the screen
     * @param image image to draw
     */
    //% blockId=displayshowimage block="show image %image=image_picker"
    //% weight=100 group="Screen" blockGap=8
    //% help=display/show-image
    export function showImage(image: Image) {
        if (!image) return;
        screen.drawImage(image, 0, 0)
    }
}