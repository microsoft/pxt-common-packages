namespace sprites {
    export class BaseSpriteSayRenderer {
        constructor(public text: string, public fgColor: number, public bgColor: number) {
        }

        draw(screen: Image, camera: scene.Camera, owner: Sprite) {

        }

        update(dt: number, camera: scene.Camera, owner: Sprite) {

        }

        destroy() {

        }
    }

    export class SpriteSayRenderer extends BaseSpriteSayRenderer {
        static drawSayFrame(textLeft: number, textTop: number, textWidth: number, textHeight: number, speakerX: number, speakerY: number, color: number, canvas: Image) {
            if (textLeft + textWidth < 0 || textTop + textHeight < 0 || textLeft > canvas.width || textTop > canvas.height) return;

            if (textHeight) {
                // Draw main rectangle
                canvas.fillRect(
                    textLeft,
                    textTop,
                    textWidth,
                    textHeight,
                    color
                );

                // Draw lines around the rectangle to give it a bubble shape
                canvas.fillRect(
                    textLeft - 1,
                    textTop + 1,
                    1,
                    textHeight - 2,
                    color
                );
                canvas.fillRect(
                    textLeft + textWidth,
                    textTop + 1,
                    1,
                    textHeight - 2,
                    color
                );
                canvas.fillRect(
                    textLeft + 1,
                    textTop - 1,
                    textWidth - 2,
                    1,
                    color
                );
                canvas.fillRect(
                    textLeft + 1,
                    textTop + textHeight,
                    textWidth - 2,
                    1,
                    color
                );

                // If the speaker location is within the bubble, don't draw an arrow
                if (speakerX > textLeft && speakerX < textLeft + textWidth && speakerY > textTop && speakerY < textTop + textHeight) return;

                const xDiff = Math.max(
                    Math.abs(speakerX - textLeft),
                    Math.abs(speakerX - (textLeft + textWidth))
                );

                const yDiff = Math.max(
                    Math.abs(speakerY - textHeight),
                    Math.abs(speakerY - (textHeight + textHeight))
                );

                // Draw the arrow
                if (xDiff > yDiff) {
                    if (speakerX > textLeft + textWidth) {
                        const anchorY = Math.max(Math.min(speakerY, textTop + textHeight - 4), textTop + 5);
                        canvas.fillRect(
                            textLeft + textWidth + 1,
                            anchorY - 2,
                            1,
                            3,
                            color
                        );
                        canvas.fillRect(
                            textLeft + textWidth + 2,
                            anchorY - 1,
                            1,
                            1,
                            color
                        );
                    }
                    else if (speakerX < textLeft) {
                        const anchorY = Math.max(Math.min(speakerY, textTop + textHeight - 4), textTop + 5);
                        canvas.fillRect(
                            textLeft - 2,
                            anchorY - 2,
                            1,
                            3,
                            color
                        );
                        canvas.fillRect(
                            textLeft - 3,
                            anchorY - 1,
                            1,
                            1,
                            color
                        );
                    }
                    else if (speakerY > textTop + textHeight) {
                        const anchorX = Math.max(Math.min(speakerX, textLeft + textWidth - 4), textLeft + 5);
                        canvas.fillRect(
                            anchorX - 2,
                            textTop + textHeight + 1,
                            3,
                            1,
                            color
                        );
                        canvas.fillRect(
                            anchorX - 1,
                            textTop + textHeight + 2,
                            1,
                            1,
                            color
                        );
                    }
                    else if (speakerY < textTop) {
                        const anchorX = Math.max(Math.min(speakerX, textLeft + textWidth - 4), textLeft + 5);
                        canvas.fillRect(
                            anchorX - 2,
                            textTop - 2,
                            3,
                            1,
                            color
                        );
                        canvas.fillRect(
                            anchorX - 1,
                            textTop - 3,
                            1,
                            1,
                            color
                        );
                    }
                }
                else {
                    if (speakerY > textTop + textHeight) {
                        const anchorX = Math.max(Math.min(speakerX, textLeft + textWidth - 4), textLeft + 5);
                        canvas.fillRect(
                            anchorX - 2,
                            textTop + textHeight + 1,
                            3,
                            1,
                            color
                        );
                        canvas.fillRect(
                            anchorX - 1,
                            textTop + textHeight + 2,
                            1,
                            1,
                            color
                        );
                    }
                    else if (speakerY < textTop) {
                        const anchorX = Math.max(Math.min(speakerX, textLeft + textWidth - 4), textLeft + 5);
                        canvas.fillRect(
                            anchorX - 2,
                            textTop - 2,
                            3,
                            1,
                            color
                        );
                        canvas.fillRect(
                            anchorX - 1,
                            textTop - 3,
                            1,
                            1,
                            color
                        );
                    }
                    else if (speakerX > textLeft + textWidth) {
                        const anchorY = Math.max(Math.min(speakerY, textTop + textHeight - 4), textTop + 5);
                        canvas.fillRect(
                            textLeft + textWidth + 1,
                            anchorY - 2,
                            1,
                            3,
                            color
                        );
                        canvas.fillRect(
                            textLeft + textWidth + 2,
                            anchorY - 1,
                            1,
                            1,
                            color
                        );
                    }
                    else if (speakerX < textLeft) {
                        const anchorY = Math.max(Math.min(speakerY, textTop + textHeight - 4), textTop + 5);
                        canvas.fillRect(
                            textLeft - 2,
                            anchorY - 2,
                            1,
                            3,
                            color
                        );
                        canvas.fillRect(
                            textLeft - 3,
                            anchorY - 1,
                            1,
                            1,
                            color
                        );
                    }
                }
            }
        }

        protected renderText: RenderText;
        protected animation: RenderTextAnimation;

        constructor(text: string, fg: number, bg: number, animated: boolean, timeOnScreen: number) {
            super(text, fg, bg);

            this.renderText = new sprites.RenderText(text, 100);
            if (animated) {
                this.animation = new sprites.RenderTextAnimation(this.renderText, 40);
                if (timeOnScreen >= 0) {
                    const numberOfPauses = this.animation.numPages() + 1;
                    const pauseTime = Math.min((timeOnScreen / (2 * numberOfPauses)) | 0, 1000);
                    this.animation.setPauseLength(pauseTime);
                    this.animation.setTextSpeed(this.renderText.printableCharacters() * 1000 / (timeOnScreen - pauseTime * numberOfPauses))
                }

                this.animation.start();
            }
        }

        draw(screen: Image, camera: scene.Camera, owner: Sprite) {
            const ox = (owner.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetX;
            const oy = (owner.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetY;

            const l = Math.floor(owner.left - ox);
            const t = Math.floor(owner.top - oy);

            const height = this.animation ? this.animation.currentHeight() : this.renderText.height;
            const width = this.animation ? this.animation.currentWidth() : this.renderText.width;
            const sayLeft = l + (owner.width >> 1) - (width >> 1);
            const sayTop =  t - height - 4;

            if (sayLeft + width < 0 || sayTop + height < 0 || sayLeft > screen.width || sayTop > screen.height) return;

            SpriteSayRenderer.drawSayFrame(sayLeft, sayTop, width, height, owner.x, owner.y, this.bgColor, screen);

            if (height) {
                if (this.animation) {
                    this.animation.draw(screen, sayLeft, sayTop, this.fgColor);
                }
                else {
                    this.renderText.draw(screen, sayLeft, sayTop, this.fgColor);
                }
            }
        }
    }

    export class LegacySpriteSayRenderer extends BaseSpriteSayRenderer {
        protected sayBubbleSprite: Sprite;
        protected updateSay: (dt: number, camera: scene.Camera) => void;

        constructor(text: string, timeOnScreen: number, owner: Sprite, fg: number, bg: number) {
            super(text, fg, bg);

            const textToDisplay = console.inspect(text).split("\n").join(" ");

            let pixelsOffset = 0;
            let holdTextSeconds = 1.5;
            let bubblePadding = 4;
            let maxTextWidth = 100;
            let font = image.getFontForText(textToDisplay);
            let startX = 2;
            let startY = 2;
            let bubbleWidth = textToDisplay.length * font.charWidth + bubblePadding;
            let maxOffset = textToDisplay.length * font.charWidth - maxTextWidth;
            let bubbleOffset: number = Fx.toInt(owner._hitbox.oy);
            let needsRedraw = true;

            // sets the default scroll speed in pixels per second
            let speed = 45;
            const currentScene = game.currentScene();

            // Calculates the speed of the scroll if scrolling is needed and a time is specified
            if (timeOnScreen && maxOffset > 0) {
                speed = (maxOffset + (2 * maxTextWidth)) / (timeOnScreen / 1000);
                speed = Math.max(speed, 45);
                holdTextSeconds = maxTextWidth / speed;
                holdTextSeconds = Math.min(holdTextSeconds, 1.5);
            }

            if (timeOnScreen) {
                timeOnScreen = timeOnScreen + currentScene.millis();
            }

            if (bubbleWidth > maxTextWidth + bubblePadding) {
                bubbleWidth = maxTextWidth + bubblePadding;
            } else {
                maxOffset = -1;
            }

            // reuse previous sprite if possible
            const imgh = font.charHeight + bubblePadding;
            if (!this.sayBubbleSprite
                || this.sayBubbleSprite.width != bubbleWidth
                || this.sayBubbleSprite.height != imgh) {
                const sayImg = image.create(bubbleWidth, imgh);
                if (this.sayBubbleSprite) // sprite with same image size, we can reuse it
                    this.sayBubbleSprite.setImage(sayImg);
                else { // needs a new sprite
                    this.sayBubbleSprite = sprites.create(sayImg, -1);
                    this.sayBubbleSprite.setFlag(SpriteFlag.Ghost, true);
                    this.sayBubbleSprite.setFlag(SpriteFlag.RelativeToCamera, !!(owner.flags & sprites.Flag.RelativeToCamera))
                }
            }
            this.updateSay = (dt, camera) => {
                // The minus 2 is how much transparent padding there is under the sayBubbleSprite
                this.sayBubbleSprite.y = owner.top + bubbleOffset - ((font.charHeight + bubblePadding) >> 1) - 2;
                this.sayBubbleSprite.x = owner.x;
                this.sayBubbleSprite.z = owner.z + 1;

                // Update box stuff as long as timeOnScreen doesn't exist or it can still be on the screen
                if (!timeOnScreen || timeOnScreen > currentScene.millis()) {
                    // move bubble
                    if (!owner.isOutOfScreen(camera)) {
                        const ox = camera.offsetX;
                        const oy = camera.offsetY;

                        if (this.sayBubbleSprite.left - ox < 0) {
                            this.sayBubbleSprite.left = 0;
                        }

                        if (this.sayBubbleSprite.right - ox > screen.width) {
                            this.sayBubbleSprite.right = screen.width;
                        }

                        // If sprite bubble above the sprite gets cut off on top, place the bubble below the sprite
                        if (this.sayBubbleSprite.top - oy < 0) {
                            this.sayBubbleSprite.y = (this.sayBubbleSprite.y - 2 * owner.y) * -1;
                        }
                    }

                    // Pauses at beginning of text for holdTextSeconds length
                    if (holdTextSeconds > 0) {
                        holdTextSeconds -= game.eventContext().deltaTime;
                        // If scrolling has reached the end, start back at the beginning
                        if (holdTextSeconds <= 0 && pixelsOffset > 0) {
                            pixelsOffset = 0;
                            holdTextSeconds = maxTextWidth / speed;
                            needsRedraw = true;
                        }
                    } else {
                        pixelsOffset += dt * speed;
                        needsRedraw = true;

                        // Pause at end of text for holdTextSeconds length
                        if (pixelsOffset >= maxOffset) {
                            pixelsOffset = maxOffset;
                            holdTextSeconds = maxTextWidth / speed;
                        }
                    }

                    if (needsRedraw) {
                        needsRedraw = false;
                        this.sayBubbleSprite.image.fill(this.bgColor);
                        // If maxOffset is negative it won't scroll
                        if (maxOffset < 0) {
                            this.sayBubbleSprite.image.print(textToDisplay, startX, startY, this.fgColor, font);

                        } else {
                            this.sayBubbleSprite.image.print(textToDisplay, startX - pixelsOffset, startY, this.fgColor, font);
                        }

                        // Left side padding
                        this.sayBubbleSprite.image.fillRect(0, 0, bubblePadding >> 1, font.charHeight + bubblePadding, this.bgColor);
                        // Right side padding
                        this.sayBubbleSprite.image.fillRect(bubbleWidth - (bubblePadding >> 1), 0, bubblePadding >> 1, font.charHeight + bubblePadding, this.bgColor);
                        // Corners removed
                        this.sayBubbleSprite.image.setPixel(0, 0, 0);
                        this.sayBubbleSprite.image.setPixel(bubbleWidth - 1, 0, 0);
                        this.sayBubbleSprite.image.setPixel(0, font.charHeight + bubblePadding - 1, 0);
                        this.sayBubbleSprite.image.setPixel(bubbleWidth - 1, font.charHeight + bubblePadding - 1, 0);
                    }
                } else {
                    // If can't update because of timeOnScreen then destroy the sayBubbleSprite and reset updateSay
                    this.updateSay = undefined;
                    this.sayBubbleSprite.destroy();
                    this.sayBubbleSprite = undefined;
                }
            }
            this.updateSay(0, currentScene.camera);
        }

        update(dt: number, camera: scene.Camera, owner: Sprite) {
            if (!this.sayBubbleSprite) return;
            this.updateSay(dt, camera);
            if (!this.sayBubbleSprite) return;

            this.sayBubbleSprite.setFlag(SpriteFlag.RelativeToCamera, !!(owner.flags & SpriteFlag.RelativeToCamera));

            if (owner.flags && Flag.Destroyed) this.destroy();
        }

        destroy() {
            if (this.sayBubbleSprite) this.sayBubbleSprite.destroy();
            this.sayBubbleSprite = undefined;
        }
    }
}