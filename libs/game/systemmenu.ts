namespace scene.systemMenu {
    let instance: PauseMenu;
    let customMenuOptions: MenuOption[];

    export enum CardState {
        Selected,
        Active,
        None
    }

    export interface MenuTheme {
        cardSpacing: number;
        cardWidth: number;
        cardsPerRow: number;
        padding: number;
        cardsTop: number;
        infoTop: number;

        // "PAUSED"
        headerText: string;

        headerFont: image.Font;
        infoFont: image.Font;

        selectedCard: Image;
        activeCard: Image;
        basicCard: Image;
    }

    export class MenuOption {
        protected card: Sprite;
        protected icon: Sprite;

        protected top: number;
        protected state: CardState;

        protected theme: MenuTheme;

        constructor(protected iconImage: Image, public getText: () => string, public action: () => void) {
        }

        show() {
            this.card = sprites.create(this.theme ? this.theme.basicCard : CARD_NORMAL);
            this.card.z = 1;

            this.icon = sprites.create(this.iconImage);
            this.icon.z = 2;

            this.state = CardState.None;
        }

        position(left: number, top: number) {
            this.top = top;

            this.card.left = left;
            this.card.top = top;

            this.icon.x = this.card.x;
            this.icon.y = this.card.y;
        }

        setOffset(offset: number) {
            this.card.top = this.top + offset;
            this.icon.y = this.card.y;
        }

        setTheme(theme: MenuTheme) {
            this.theme = theme;
            this.updateCard();
        }

        setState(state: CardState) {
            if (this.state === state) return;
            this.state = state;
            this.updateCard();
        }

        dispose() {
            if (this.card) {
                this.card.destroy();
                this.icon.destroy();
                this.card = undefined;
                this.icon = undefined;
            }
        }

        protected updateCard() {
            if (!this.theme) return;
            switch (this.state) {
                case CardState.None: this.card.setImage(this.theme.basicCard); break;
                case CardState.Selected: this.card.setImage(this.theme.selectedCard); break;
                case CardState.Active: this.card.setImage(this.theme.activeCard); break;
            }

            // Center the icon
            this.icon.x = this.card.x;
            this.icon.y = this.card.y;
        }
    }

    export class PauseMenu {
        protected options: MenuOption[];
        protected theme: MenuTheme;

        // Index of selected card
        protected selection: number;

        // The row that is currently at the top of the screen
        protected scrollRow: number;

        // The pixel offset for the scrollRow
        protected scrollTarget: number;

        // The current pixel offset of the scroll (might be animating)
        protected scrollOffset: number;

        constructor(protected generator: () => MenuOption[], theme?: MenuTheme) {
            this.theme = theme || buildMenuTheme(CARD_NORMAL.width, 3);
            this.scrollRow = 0;
            this.scrollOffset = 0;
            this.scrollTarget = 0;
        }

        show() {
            this.options = this.generator();
            this.selection = 0;

            let current: MenuOption;
            for (let i = 0; i < this.options.length; i++) {
                current = this.options[i];
                current.show();
                current.setTheme(this.theme);
                current.position(
                    this.theme.padding + (i % this.theme.cardsPerRow) * (this.theme.cardWidth + this.theme.cardSpacing),
                    this.theme.cardsTop + (Math.idiv(i, this.theme.cardsPerRow) * (this.theme.cardWidth + this.theme.cardSpacing))
                );
            }

            controller._setUserEventsEnabled(false);

            controller.A.onEvent(SYSTEM_KEY_DOWN, () => {
                if (!this.options || !this.options[this.selection]) return;
                this.options[this.selection].setState(CardState.Active);
            });

            controller.A.onEvent(SYSTEM_KEY_UP, () => {
                if (!this.options || !this.options[this.selection]) return;
                this.options[this.selection].setState(CardState.Selected);
                control.runInParallel(this.options[this.selection].action)
            });

            controller.B.onEvent(SYSTEM_KEY_DOWN, () => {
                closeMenu();
            });

            controller.menu.onEvent(SYSTEM_KEY_DOWN, () => {
                closeMenu();
            });

            controller.up.onEvent(SYSTEM_KEY_DOWN, () => {
                this.setSelection(Math.max(0, this.selection - this.theme.cardsPerRow));
            });

            controller.left.onEvent(SYSTEM_KEY_DOWN, () => {
                this.setSelection(Math.max(0, this.selection - 1));
            });

            controller.down.onEvent(SYSTEM_KEY_DOWN, () => {
                this.setSelection(Math.min(this.options.length - 1, this.selection + this.theme.cardsPerRow));
            });

            controller.right.onEvent(SYSTEM_KEY_DOWN, () => {
                this.setSelection(Math.min(this.options.length - 1, this.selection + 1));
            });

            game.onShade(() => {
                this.onUpdate();
                this.drawText();
            });

            this.setSelection(0);
        }

        onUpdate() {
            // Should probably factor out this animation
            let t = control.millis() / 250;
            for (let i = 0; i < this.options.length; i++) {
                this.options[i].setOffset(2 * Math.sin(t - (i % this.theme.cardsPerRow) * (Math.PI / 2)))
            }

            const dt = game.currentScene().eventContext.deltaTime;
            if (this.scrollOffset < this.scrollTarget) {
                this.scrollOffset += dt * 100;
            }
            else if (this.scrollOffset > this.scrollTarget) {
                this.scrollOffset -= dt * 100;
            }
            else {
                return;
            }

            if (Math.abs(this.scrollOffset - this.scrollTarget) < 2) {
                this.scrollOffset = this.scrollTarget;
            }

            game.currentScene().camera.offsetY = this.scrollOffset;
        }

        setSelection(selection: number) {
            if (!this.options) return;

            if (this.options[this.selection]) {
                this.options[this.selection].setState(CardState.None);
            }

            this.selection = selection;

            if (this.options[this.selection]) {
                this.options[this.selection].setState(controller.A.isPressed() ? CardState.Active : CardState.Selected);
            }

            this.updateScrollTarget();
        }

        drawText() {
            if (!this.options) return;

            // Black bar to draw the header on
            screen.fillRect(0, 0, screen.width, this.theme.cardsTop - 2, 15);

            // Header text
            screen.printCenter(this.theme.headerText, 2, 1, this.theme.headerFont);

            // Black bar for the info box to draw on
            screen.fillRect(0, this.theme.infoTop - 3, screen.width, screen.height - this.theme.infoTop + 6, 15);

            // White info box
            screen.fillRect(this.theme.padding, this.theme.infoTop, screen.width - (this.theme.padding << 1), this.theme.infoFont.charHeight + 1, 1);

            // Info text
            screen.printCenter(this.options[this.selection].getText(), this.theme.infoTop + 1, 15, this.theme.infoFont);
        }

        dispose() {
            if (this.options) {
                this.options.forEach(o => o.dispose());
                this.options = undefined;
            }
        }

        protected updateScrollTarget() {
            const row = Math.idiv(this.selection, this.theme.cardsPerRow);

            // FIXME: Assumes that there are always two rows on screen
            if (row === this.scrollRow || row - 1 === this.scrollRow) return;

            if (row > this.scrollRow) this.scrollRow++;
            else this.scrollRow--;

            this.scrollTarget = this.scrollRow * (this.theme.cardSpacing + this.theme.cardWidth);
        }
    }

    // we intentionally only save volume when the user explicitly adjusts it
    // we don't want to save it when adjusted programatically, because it could for example changing in a loop
    function setVolume(newVolume: number) {
        music.setVolume(newVolume);
        music.playTone(440, 500);
        settings.writeNumber("#volume", newVolume)
    }

    function volumeUp() {
        const v = music.volume();
        const remainder = v % 32;
        const newVolume = v + 32 - remainder;
        setVolume(newVolume);
    }

    function volumeDown() {
        const v = music.volume();
        const remainder = v % 32;
        const newVolume = v - (remainder ? remainder : 32);
        setVolume(newVolume);
    }

    function brightnessUp() {
        screen.setBrightness(screen.brightness() + 10);
    }

    function brightnessDown() {
        screen.setBrightness(screen.brightness() - 10);
    }

    function toggleStats() {
        game.stats = !game.stats;
    }

    function toggleConsole() {
        if (game.consoleOverlay.isVisible())
            game.consoleOverlay.setVisible(false);
        else {
            game.consoleOverlay.setVisible(true);
            console.log("console");
        }
    }

    function sleep() {
        power.deepSleep();
    }

    export function closeMenu() {
        if (instance) {
            instance.dispose();
            instance = undefined;
            controller._setUserEventsEnabled(true);
            game.popScene();
        }
    }

    //% shim=pxt::setScreenBrightnessSupported
    function setScreenBrightnessSupported() {
        return 0 // default to no, in simulator
    }

    export function buildOptionList(): MenuOption[] {
        let options: MenuOption[] = [];

        options.push(new MenuOption(VOLUME_DOWN_ICON, () => `VOLUME DOWN (${music.volume()})`, volumeDown));
        options.push(new MenuOption(VOLUME_UP_ICON, () => `VOLUME UP (${music.volume()})`, volumeUp));
        if (setScreenBrightnessSupported()) {
            options.push(new MenuOption(BRIGHTNESS_DOWN_ICON, () => `BRIGHTNESS DOWN (${screen.brightness()})`, brightnessDown));
            options.push(new MenuOption(BRIGHTNESS_UP_ICON, () => `BRIGHTNESS UP (${screen.brightness()})`, brightnessUp));
        }
        options.push(new MenuOption(STATS_ICON, () => game.stats ? "HIDE STATS" : "SHOW STATS", toggleStats));
        options.push(new MenuOption(CONSOLE_ICON, () => game.consoleOverlay.isVisible() ? "HIDE CONSOLE" : "SHOW CONSOLE", toggleConsole));
        options.push(new MenuOption(SLEEP_ICON, () => "SLEEP", sleep));

        if (customMenuOptions) {
            options = options.concat(customMenuOptions);
        }

        options.push(new MenuOption(CLOSE_MENU_ICON, () => "CLOSE", closeMenu));

        return options;
    }

    export function buildMenuTheme(cardWidth: number, cardSpacing: number, infoFont?: image.Font, headerFont?: image.Font): MenuTheme {
        const cardsPerRow = Math.idiv(screen.width, cardWidth + cardSpacing);
        infoFont = infoFont || image.font8;
        headerFont = headerFont || image.doubledFont(infoFont);

        return {
            cardSpacing: cardSpacing,
            cardWidth: cardWidth,
            cardsPerRow: cardsPerRow,
            padding: (screen.width - (cardsPerRow * cardWidth + (cardsPerRow - 1) * cardSpacing)) >> 1,
            infoFont: infoFont,
            headerFont: headerFont,
            cardsTop: headerFont.charHeight + 2 + cardSpacing,
            infoTop: screen.height - infoFont.charHeight - 2,
            headerText: "PAUSED",
            selectedCard: CARD_SELECTED,
            activeCard: CARD_ACTIVE,
            basicCard: CARD_NORMAL
        };
    }

    export function addEntry(name: () => string, clickHandler: () => void, icon: Image) {
        if (!customMenuOptions) customMenuOptions = [];
        customMenuOptions.push(new MenuOption(icon, name, clickHandler));
    }

    export function register() {
        if (instance) return; // don't show system menu, while in system menu

        controller.menu.onEvent(ControllerButtonEvent.Pressed, showSystemMenu);
    }

    export function showSystemMenu() {
        if (instance) return;
        game.pushScene();
        instance = new PauseMenu(buildOptionList);
        instance.show();
    }

    export function isVisible() {
        return !!instance;
    }

    function initVolume() {
        const vol = settings.readNumber("#volume")
        if (vol != null)
            music.setVolume(vol)
    }

    initVolume()
    scene.Scene.initializers.push(register);
}
