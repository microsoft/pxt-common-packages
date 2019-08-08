namespace scene {
    export class Renderable extends sprite.BaseSprite {
        public constructor(
            protected handler: (target: Image, camera: Camera) => void,
            protected shouldBeVisible: () => boolean,
            z: number,
        ) {
            super(z);
        }

        get flags(): number {
            return this.shouldBeVisible() ? sprites.Flag.None : sprites.Flag.Invisible;
        }

        destroy() {
            const s = game.currentScene();
            s.allSprites.removeElement(this);
        }
    }

    export function createRenderable(
        z: number,
        handler: (target: Image, camera: Camera) => void,
        shouldBeVisible?: () => boolean
    ): Renderable {
        const renderable = new Renderable(
            handler,
            shouldBeVisible || (() => true),
            z,
        );

        return renderable;
    }
}