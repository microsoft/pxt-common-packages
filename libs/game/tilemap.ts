enum TileScale {
    //% block="8x8"
    Eight = 3,
    //% block="16x16"
    Sixteen = 4,
    //% block="32x32"
    ThirtyTwo = 5
}
namespace tiles {

    // class TileSet {
    //     obstacle: boolean;
    //     private map: TileMap;
    //     private originalImage: Image;
    //     private cachedImage: Image;

    //     constructor(image: Image, collisions: boolean, map: TileMap) {
    //         this.originalImage = image;
    //         this.obstacle = collisions;
    //         this.map = map;
    //     }

    //     get image(): Image {
    //         const size = 1 << this.map.scale;
    //         if (!this.cachedImage || this.cachedImage.width != size || this.cachedImage.height != size) {
    //             if (this.originalImage.width == size && this.originalImage.height == size) {
    //                 this.cachedImage = this.originalImage;
    //             } else {
    //                 this.cachedImage = image.create(size, size);
    //                 this.cachedImage.drawImage(this.originalImage, 0, 0);
    //             }
    //         }
    //         return this.cachedImage;
    //     }
    // }

    /**
     * A (col, row) location in the tilemap
     **/
    //% blockNamespace=scene color="#401255" blockGap=8
    export class Location {
        protected _row: number;
        protected _col: number;
        protected tileMap: TileMap;

        constructor(col: number, row: number, map: TileMap) {
            this._col = col;
            this._row = row;
            this.tileMap = map;
        }

        get x(): number {
            const scale = this.tileMap.scale;
            return (this._col << scale) + (1 << (scale - 1));
        }

        get y(): number {
            const scale = this.tileMap.scale;
            return (this._row << scale) + (1 << (scale - 1));
        }

        get tileSet(): number {
            return this.tileMap.data.getTile(this._col, this._row);
        }

        /**
         * Center the given sprite on this tile
         * @param sprite
         */
        //% blockId=gameplaceontile block="on top of %tile(myTile) place %sprite=variables_get(mySprite)"
        //% blockNamespace="scene" group="Tiles"
        //% weight=25
        //% help=tiles/place
        //% deprecated=1
        place(mySprite: Sprite): void {
            if (!mySprite) return;
            mySprite.setPosition(this.x, this.y);
        }
    }

    /**
     * DEPRECATED: a tile in the tilemap
     **/
    //% blockNamespace=scene color="#401255" blockGap=8
    export class Tile {
        protected _row: number;
        protected _col: number;
        protected tileMap: TileMap;

        constructor(col: number, row: number, map: TileMap) {
            this._col = col;
            this._row = row;
            this.tileMap = map;
        }

        get x(): number {
            const scale = this.tileMap.scale;
            return (this._col << scale) + (1 << (scale - 1));
        }

        get y(): number {
            const scale = this.tileMap.scale;
            return (this._row << scale) + (1 << (scale - 1));
        }

        get tileSet(): number {
            return this.tileMap.data.getTile(this._col, this._row);
        }

        /**
         * Center the given sprite on this tile
         * @param sprite
         */
        //% blockId=gameplaceontile block="on top of %tile(myTile) place %sprite=variables_get(mySprite)"
        //% blockNamespace="scene" group="Tiles"
        //% weight=25
        //% help=tiles/place
        //% deprecated=1
        place(mySprite: Sprite): void {
            if (!mySprite) return;
            mySprite.setPosition(this.x, this.y);
        }
    }

    const TM_DATA_PREFIX_LENGTH = 4;
    const TM_WALL = 2;

    export class TileMapData {
        // The tile data for the map (indices into tileset)
        protected data: Buffer;

        // The metadata layers for the map. Currently only 1 is used for walls
        protected layers: Image;

        protected tileset: Image[];

        protected _width: number;
        protected _height: number;

        // ## LEGACY: DO NOT USE ##
        protected _walls: boolean[];

        constructor(data: Buffer, layers: Image, tileset: Image[], scale: TileScale) {
            this.data = data;
            this.layers = layers;
            this.tileset = tileset;

            this._width = data.getNumber(NumberFormat.UInt16LE, 0);
            this._height = data.getNumber(NumberFormat.UInt16LE, 2);

            // ## LEGACY: DO NOT USE ##
            this._walls = tileset.map(t => false);
        }

        get width(): number {
            return this._width;
        }

        get height(): number {
            return this._height;
        }

        getTile(col: number, row: number) {
            if (this.isOutsideMap(col, row)) return 0;

            return this.data.getUint8(TM_DATA_PREFIX_LENGTH + (col | 0) + (row | 0) * this.width);
        }

        setTile(col: number, row: number, tile: number) {
            if (this.isOutsideMap(col, row)) return;

            this.data.setUint8(TM_DATA_PREFIX_LENGTH + (col | 0) + (row | 0) * this.width, tile);
        }

        getTileset() {
            return this.tileset;
        }

        getTileImage(index: number) {
            return this.tileset[index];
        }

        setWall(col: number, row: number, on: boolean) {
            return this.layers.setPixel(col, row, on ? TM_WALL : 0);
        }

        isWall(col: number, row: number) {
            return this.layers.getPixel(col, row) === TM_WALL;
        }

        isOutsideMap(col: number, row: number) {
            return col < 0 || col >= this.width || row < 0 || row >= this.height;
        }

        /*
         *  ##########################################
         *  ##         LEGACY: DO NOT USE           ##
         *  ##    Functions below are to support    ##
         *  ##        old tilemap blocks only       ##
         *  ##########################################
         */
        _setTileImage(index: number, img: Image, collisions: boolean) {
            this.tileset[index] = img;
            this._walls[index] = collisions;
            for (let col = 0; col < this.width; ++col) {
                for (let row = 0; row < this.height; ++row) {
                    let currTile = this.getTile(col, row);
                    if (currTile === index) {
                        this.layers.setPixel(col, row, collisions ? TM_WALL : 0);
                    }
                }
            }
        }

        _setWall(index: number, collisions: boolean) {
            this._walls[index] = collisions;
        }

        _isWall(index: number) {
            return this._walls[index];
        }

        _setMap(data: Buffer, layers: Image) {
            this.data = data;
            this.layers = layers;

            this._width = data.getNumber(NumberFormat.UInt16LE, 0);
            this._height = data.getNumber(NumberFormat.UInt16LE, 2);
        }
    }

    export class TileMap {
        scale: number

        protected _layer: number;
        protected _map: TileMapData;

        constructor(scale: TileScale = TileScale.Sixteen) {
            this._layer = 1;
            this.scale = scale;

            scene.createRenderable(
                scene.TILE_MAP_Z,
                (t, c) => this.draw(t, c)
            );
        }

        // ## LEGACY: DO NOT USE ##
        _legacyInit() {
            let buffer = control.createBuffer(TM_DATA_PREFIX_LENGTH);
            let layer = image.create(2, 2);
            let tiles = [];
            for (let i = 0; i < 16; ++i) {
                tiles.push(mkColorTile(i, this.scale))
            }

            this._map = new TileMapData(buffer, layer, tiles, this.scale);
        }

        get data(): TileMapData {
            return this._map;
        }

        offsetX(value: number) {
            return Math.clamp(0, Math.max(this.areaWidth() - screen.width, 0), value);
        }

        offsetY(value: number) {
            return Math.clamp(0, Math.max(this.areaHeight() - screen.height, 0), value);
        }

        areaWidth() {
            return this._map ? (this._map.width << this.scale) : 0;
        }

        areaHeight() {
            return this._map ? (this._map.height << this.scale) : 0;
        }

        get layer(): number {
            return this._layer;
        }

        set layer(value: number) {
            if (this._layer != value) {
                this._layer = value;
            }
        }

        get enabled(): boolean {
            return !!this._map;
        }

        // ## LEGACY: DO NOT USE ##
        setTile(index: number, img: Image, collisions?: boolean) {
            this._map._setTileImage(index, img, collisions);
        }

        // ## LEGACY: DO NOT USE ##
        setMap(map: Image) {
            let buffer = control.createBuffer(TM_DATA_PREFIX_LENGTH + (map.width * map.height));
            let layer = image.create(map.width, map.height);

            buffer.setNumber(NumberFormat.UInt16LE, 0, map.width);
            buffer.setNumber(NumberFormat.UInt16LE, TM_DATA_PREFIX_LENGTH / 2, map.height);
            for (let i = 0; i < map.width; i++) {
                for (let j = 0; j < map.height; j++) {
                    let p = map.getPixel(i, j);
                    if (this._map._isWall(p)) layer.setPixel(i, j, TM_WALL);
                    buffer.setUint8(TM_DATA_PREFIX_LENGTH + (i | 0) + (j | 0) * map.width, p);
                }
            }

            this._map._setMap(buffer, layer);
        }

        setData(map: TileMapData) {
            this._map = map;
        }

        public getTile(col: number, row: number): Location {
            return new Location(col, row, this);
        }

        public setTileAt(col: number, row: number, index: number): void {
            if (!this._map.isOutsideMap(col, row) && !this.isInvalidIndex(index))
                this._map.setTile(col, row, index);
        }

        public getImageType(im: Image): number {
            const tileset = this._map.getTileset();
            for (let i = 0; i < tileset.length; i++)
                if (tileset[i].equals(im)) return i;
            return -1;
        }

        public setWallAt(col: number, row: number, on: boolean): void {
            if (!this._map.isOutsideMap(col, row))
                this._map.setWall(col, row, on);
        }

        public getTilesByType(index: number): Location[] {
            if (this.isInvalidIndex(index) || !this.enabled) return [];

            let output: Location[] = [];
            for (let col = 0; col < this._map.width; ++col) {
                for (let row = 0; row < this._map.height; ++row) {
                    let currTile = this._map.getTile(col, row);
                    if (currTile === index) {
                        output.push(new Location(col, row, this));
                    }
                }
            }
            return output;
        }

        protected isInvalidIndex(index: number): boolean {
            return index < 0 || index > 0xff;
        }

        protected draw(target: Image, camera: scene.Camera) {
            if (!this.enabled) return;

            // render tile map
            const bitmask = (0x1 << this.scale) - 1;
            const offsetX = camera.drawOffsetX & bitmask;
            const offsetY = camera.drawOffsetY & bitmask;

            const x0 = Math.max(0, camera.drawOffsetX >> this.scale);
            const xn = Math.min(this._map.width, ((camera.drawOffsetX + target.width) >> this.scale) + 1);
            const y0 = Math.max(0, camera.drawOffsetY >> this.scale);
            const yn = Math.min(this._map.height, ((camera.drawOffsetY + target.height) >> this.scale) + 1);

            for (let x = x0; x <= xn; ++x) {
                for (let y = y0; y <= yn; ++y) {
                    const index = this._map.getTile(x, y);
                    const tile = this._map.getTileImage(index);
                    if (tile) {
                        target.drawTransparentImage(
                            tile,
                            ((x - x0) << this.scale) - offsetX,
                            ((y - y0) << this.scale) - offsetY
                        );
                    }
                }
            }

            if (game.debug) {
                // render debug grid overlay
                for (let x = x0; x <= xn; ++x) {
                    const xLine = ((x - x0) << this.scale) - offsetX;
                    if (xLine >= 0 && xLine <= screen.width) {
                        target.drawLine(
                            xLine,
                            0,
                            xLine,
                            target.height,
                            1
                        );
                    }
                }

                for (let y = y0; y <= yn; ++y) {
                    const yLine = ((y - y0) << this.scale) - offsetY;
                    if (yLine >= 0 && yLine <= screen.height) {
                        target.drawLine(
                            0,
                            yLine,
                            target.width,
                            yLine,
                            1
                        );
                    }
                }
            }
        }

        public isObstacle(col: number, row: number) {
            if (!this.enabled) return false;
            if (this._map.isOutsideMap(col, row)) return true;

            return this._map.isWall(col, row);
        }

        public getObstacle(col: number, row: number) {
            const index = this._map.isOutsideMap(col, row) ? 0 : this._map.getTile(col, row);
            const tile = this._map.getTileImage(index);
            return new sprites.StaticObstacle(
                tile,
                row << this.scale,
                col << this.scale,
                this.layer,
                index
            );
        }

        public isOnWall(s: Sprite) {
            const hbox = s._hitbox

            const left = Fx.toIntShifted(hbox.left, this.scale);
            const right = Fx.toIntShifted(hbox.right, this.scale);
            const top = Fx.toIntShifted(hbox.top, this.scale);
            const bottom = Fx.toIntShifted(hbox.bottom, this.scale);

            for (let col = left; col <= right; ++col) {
                for (let row = top; row <= bottom; ++row) {
                    if (this.isObstacle(col, row)) {
                        return true;
                    }
                }
            }

            return false;
        }
    }

    function mkColorTile(index: number, scale: TileScale): Image {
        const size = 1 << scale

        const i = image.create(size, size);
        i.fill(index);
        return i;
    }

    export function mkTile(image: Image, id: number, tags: string[]) {
        return image;
    }

    export function createTilemap(data: Buffer, layer: Image, tiles: Image[], scale: TileScale): Buffer {
        scene.setTileMapLevel(new TileMapData(data, layer, tiles, scale))
        return null;
    }

    // tiles.mkTilemap(hex``, img``, TileScale.Eight, [tiles.mkTile(img``, 1, ["tile"])])

    //% blockId=tilemap_editor block="set tile map to %tilemap"
    //% weight=200 shim=TD_ID
    //% tilemap.fieldEditor="tilemap"
    //% tilemap.fieldOptions.decompileArgumentAsString="true"
    //% tilemap.fieldOptions.filter="tile"
    //% blockNamespace="scene" group="Tiles" duplicateShadowOnDrag
    //% help=tiles/set-tile-map
    export function setTilemap(tilemap: TileMapData) {
        scene.setTileMapLevel(tilemap);
    }

    /**
     * Set a location in the map (column, row) to a tile
     * @param loc
     * @param tile
     */
    //% blockId=mapsettileat block="set %loc=mapgettile to %tile=tile_image_picker"
    //% blockNamespace="scene" group="Tiles"
    //% help=tiles/set-tile-at
    export function setTileAt(loc: Location, tile: Image): void {
        const scene = game.currentScene();
        if (!loc || !tile || !scene.tileMap) return null;
        const scale = scene.tileMap.scale;
        const index = scene.tileMap.getImageType(tile);
        scene.tileMap.setTileAt(loc.x >> scale, loc.y >> scale, index);
    }

    /**
     * Set or unset a wall at a location in the map (column, row)
     * @param loc
     * @param on
     */
    //% blockId=mapsetwallat block="set wall $on at $loc"
    //% on.shadow=toggleOnOff loc.shadow=mapgettile
    //% blockNamespace="scene" group="Tiles"
    //% help=tiles/set-wall-at
    export function setWallAt(loc: Location, on: boolean): void {
        const scene = game.currentScene();
        if (!loc || !scene.tileMap) return null;
        const scale = scene.tileMap.scale;
        scene.tileMap.setWallAt(loc.x >> scale, loc.y >> scale, on);
    }

    /**
     * Get the tile position given a column and row in the tile map
     * @param col
     * @param row
     */
    //% blockId=mapgettile block="map col %col row %row"
    //% blockNamespace="scene" group="Tiles"
    //% weight=25
    //% help=tiles/get-tile
    export function getTile(col: number, row: number): Location {
        const scene = game.currentScene();
        if (col == undefined || row == undefined || !scene.tileMap) return null;
        return scene.tileMap.getTile(col, row);
    }

    /**
     * Get the image of a tile, given a location in the tilemap
     * @param loc
     */
    export function getTileImage(loc: Location): Image {
        const scene = game.currentScene();
        if (!loc || !scene.tileMap) return img``;
        return scene.tileMap.data.getTileImage(loc.tileSet);
    }

    /**
     * Get all tiles in the tile map with the given type (image).
     * @param tile
     */
    //% blockId=mapgettilestype block="array of all %tile=tile_image_picker locations"
    //% blockNamespace="scene" group="Tiles" blockSetVariable="location list"
    //% help=tiles/get-tiles-by-type
    export function getTilesByType(tile: Image): Location[] {
        const scene = game.currentScene();
        if (!tile || !scene.tileMap) return [];
        const index = scene.tileMap.getImageType(tile);
        return scene.tileMap.getTilesByType(index);
    }

    /**
     * Center the given sprite on a given location
     * @param sprite
     * @param loc
     */
    //% blockId=mapplaceontile block="place $sprite=variables_get(mySprite) on top of $loc"
    //% loc.shadow=mapgettile
    //% blockNamespace="scene" group="Tiles"
    //% help=tiles/place
    export function placeOnTile(sprite: Sprite, loc: Location): void {
        if (!sprite || !loc || !game.currentScene().tileMap) return;
        loc.place(sprite);
    }

    /**
     * Center the given sprite on a random location that is the given type (image)
     * @param sprite
     * @param tile
     */
    //% blockId=mapplaceonrandomtile block="place %sprite=variables_get(mySprite) on top of random tile %tile=tile_image_picker"
    //% blockNamespace="scene" group="Tiles"
    //% help=tiles/place-on-random-tile
    export function placeOnRandomTile(sprite: Sprite, tile: Image): void {
        if (!sprite || !game.currentScene().tileMap) return;
        const tiles = getTilesByType(tile);
        if (tiles.length > 0)
            Math.pickRandom(tiles).place(sprite);
    }
}
