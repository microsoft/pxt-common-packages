namespace storyboard {
    function loader(done: () => void) {
        const font = image.font8;
        let m = 40;
        let w = screen.width - 2 * m;
        let c = 2;
        let y = screen.height / 2 - c;
        let x = 0;
        game.onPaint(function() {
            screen.printCenter("MakeCode Arcade", y - font.charHeight - c, 1, font);
            screen.drawRect(m, y, w, 2 * c, 1)
            screen.fillRect(m, y + 1, x, 2 * c - 2, 3);

            x++;
            if (x == w) done();
        })
    }

    /**
     * Default boot sequence
     */
    //% block="loader" fixedInstance whenUsed
    export const loaderBootSequence = new BootSequence(loader, 0);
}