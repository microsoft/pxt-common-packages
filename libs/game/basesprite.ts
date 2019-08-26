interface SpriteLike {
    z: number;
    id: number;
    flags?: number;

    __update(camera: scene.Camera, dt: number): void;
    __draw(camera: scene.Camera): void;
    __serialize(offset: number): Buffer;
}

namespace sprites {
    export class BaseSprite implements SpriteLike {
        protected _z: number;
        id: number;

        constructor(z: number) {
            this.z = z;

            // this assigns the sprite an id as a side effect
            game.currentScene().addSprite(this);
        }

        __visible(): boolean {
            return true;
        }

        get z(): number {
            return this._z;
        }

        set z(v: number) {
            if (this._z !== v) {
                this._z = v;
                game.currentScene().flags |= scene.Flag.NeedsSorting;
            }
        }

        __draw(camera: scene.Camera) {
            if (this.__visible()) {
                this.__drawCore(camera);
            }
        }

        __drawCore(camera: scene.Camera) { }

        __update(camera: scene.Camera, dt: number) { }

        __serialize(offset: number): Buffer { return undefined }
    }
}