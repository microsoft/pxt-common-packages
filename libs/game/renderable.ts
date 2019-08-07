namespace scene {
    export class Renderable implements SpriteLike {
        protected _z: number;
        public id: number

        public constructor(
            protected handler: (target: Image, camera: Camera) => void,
            protected shouldBeVisible: () => boolean,
            z: number,
        ) {
            this.z = z;

            game.currentScene().addSprite(this);
        }

        get z(): number {
            return this._z;
        }

        set z(v: number) {
            if (this._z !== v) {
                this._z = v;
                game.currentScene().flags |= Flag.NeedsSorting;
            }
        }

        get flags(): number {
            return this.shouldBeVisible() ? sprites.Flag.None : sprites.Flag.Invisible;
        }

        __draw(camera: scene.Camera) {
            this.handler(screen, camera);
        }

        __update() { }

        __serialize(): Buffer { return undefined }

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