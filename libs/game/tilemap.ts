enum TileScale {
    //% block="8x8"
    Eight = 3,
    //% block="16x16"
    Sixteen = 4,
    //% block="32x32"
    ThirtyTwo = 5
}

namespace tiles {

    /**
     * A (col, row) location in the tilemap
     **/
    //% blockNamespace=scene color="#401255"
    export class Location {
        protected _row: number;
        protected _col: number;

        constructor(col: number, row: number, map: TileMap) {
            this._col = col;
            this._row = row;
        }

        get tileMap() {
            return game.currentScene().tileMap;
        }

        //% group="Locations" blockSetVariable="location"
        //% blockCombine block="column"
        //% weight=100
        get column() {
            return this._col;
        }

        //% group="Locations" blockSetVariable="location"
        //% blockCombine block="row"
        //% weight=100
        get row() {
            return this._row;
        }

        //% group="Locations" blockSetVariable="location"
        //% blockCombine block="x"
        //% weight=100
        get x(): number {
            const scale = this.tileMap.scale;
            return (this._col << scale) + (1 << (scale - 1));
        }

        //% group="Locations" blockSetVariable="location"
        //% blockCombine block="y"
        //% weight=100
        get y(): number {
            const scale = this.tileMap.scale;
            return (this._row << scale) + (1 << (scale - 1));
        }

        //% group="Locations" blockSetVariable="location"
        //% blockCombine block="left"
        //% weight=100
        get left(): number {
            return (this._col << this.tileMap.scale);
        }

        //% group="Locations" blockSetVariable="location"
        //% blockCombine block="top"
        //% weight=100
        get top(): number {
            return (this._row << this.tileMap.scale);
        }

        //% group="Locations" blockSetVariable="location"
        //% blockCombine block="right"
        //% weight=100
        get right(): number {
            return this.left + (1 << this.tileMap.scale);
        }

        //% group="Locations" blockSetVariable="location"
        //% blockCombine block="bottom"
        //% weight=100
        get bottom(): number {
            return this.top + (1 << this.tileMap.scale);
        }

        get tileSet(): number {
            return this.tileMap.getTileIndex(this._col, this._row);
        }

        // deprecated
        get col() {
            return this.column;
        }

        public isWall(): boolean {
            return this.tileMap.isObstacle(this._col, this._row);
        }

        public getImage(): Image {
            return this.tileMap.getTileImage(this.tileSet);
        }

        /**
         * Returns the neighboring location in a specifc direction from a location in a tilemap
         * @param direction The direction to fetch the location in
         */
        //% blockId=tiles_location_get_neighboring_location
        //% block="tilemap location $direction of $this"
        //% this.defl=location
        //% this.shadow=variables_get
        //% group="Locations" blockGap=8
        //% weight=10 help=tiles/get-neighboring-location
        public getNeighboringLocation(direction: CollisionDirection): Location {
            switch (direction) {
                case CollisionDirection.Top:
                    return this.tileMap.getTile(this._col, this._row - 1);
                case CollisionDirection.Right:
                    return this.tileMap.getTile(this._col + 1, this._row);
                case CollisionDirection.Bottom:
                    return this.tileMap.getTile(this._col, this._row + 1);
                case CollisionDirection.Left:
                    return this.tileMap.getTile(this._col - 1, this._row);
            }
        }

        /**
         * Center the given sprite on this tile
         * @param sprite
         */
        place(mySprite: Sprite): void {
            if (!mySprite) return;
            mySprite.setPosition(this.x, this.y);
        }

        // ## LEGACY: DO NOT USE ##
        _toTile(): Tile {
            return new Tile(this._col, this._row, this.tileMap);
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
            return this.tileMap.getTileIndex(this._col, this._row);
        }

        /**
         * Center the given sprite on this tile
         * @param sprite
         */
        //% blockId=gameplaceontile block="on top of %tile(myTile) place %sprite=variables_get(mySprite)"
        //% blockNamespace="scene" group="Tilemap Operations"
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

    //% snippet='tilemap` `'
    //% pySnippet='tilemap(""" """)'
    export class TileMapData {
        // The tile data for the map (indices into tileset)
        protected data: Buffer;

        // The metadata layers for the map. Currently only 1 is used for walls
        protected layers: Image;

        protected tileset: Image[];
        protected cachedTileView: Image[];

        protected _scale: TileScale;
        protected _width: number;
        protected _height: number;

        constructor(data: Buffer, layers: Image, tileset: Image[], scale: TileScale) {
            this.data = data;
            this.layers = layers;
            this.tileset = tileset;
            this.scale = scale;

            this._width = data.getNumber(NumberFormat.UInt16LE, 0);
            this._height = data.getNumber(NumberFormat.UInt16LE, 2);
        }

        get width(): number {
            return this._width;
        }

        get height(): number {
            return this._height;
        }

        get scale(): TileScale {
            return this._scale;
        }

        set scale(s: TileScale) {
            this._scale = s;
            this.cachedTileView = [];
        }

        getTile(col: number, row: number) {
            if (this.isOutsideMap(col, row)) return 0;

            return this.data.getUint8(TM_DATA_PREFIX_LENGTH + (col | 0) + (row | 0) * this.width);
        }

        setTile(col: number, row: number, tile: number) {
            if (this.isOutsideMap(col, row)) return;

            if (this.data.isReadOnly()) {
                this.data = this.data.slice();
            }

            this.data.setUint8(TM_DATA_PREFIX_LENGTH + (col | 0) + (row | 0) * this.width, tile);
        }

        getTileset() {
            return this.tileset;
        }

        getTileImage(index: number) {
            const size = 1 << this.scale;
            let cachedImage = this.cachedTileView[index];
            if (!cachedImage) {
                const originalImage = this.tileset[index];

                if (originalImage) {
                    if (originalImage.width <= size && originalImage.height <= size) {
                        cachedImage = originalImage;
                    } else {
                        cachedImage = image.create(size, size);
                        cachedImage.drawImage(originalImage, 0, 0);
                    }
                    this.cachedTileView[index] = cachedImage;
                }
            }
            return cachedImage;
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
    }

    export enum TileMapEvent {
        Loaded,
        Unloaded
    }

    export class TileMapEventHandler {
        constructor(public event: TileMapEvent, public callback: (data: TileMapData) => void) {}
    }

    export class TileMap {
        protected _scale: TileScale;

        protected _layer: number;
        protected _map: TileMapData;
        renderable: scene.Renderable;
        protected handlerState: TileMapEventHandler[];

        constructor(scale: TileScale = TileScale.Sixteen) {
            this._layer = 1;
            this.scale = scale;

            this.renderable = scene.createRenderable(
                scene.TILE_MAP_Z,
                (t, c) => this.draw(t, c)
            );
        }

        get scale() {
            return this._scale;
        }

        set scale(s: TileScale) {
            this._scale = s;
            if (this._map) {
                this._map.scale = s;
            }
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

        setData(map: TileMapData) {
            const previous = this._map;

            if (this.handlerState && previous !== map && previous) {
                for (const eventHandler of this.handlerState) {
                    if (eventHandler.event === TileMapEvent.Unloaded) {
                        eventHandler.callback(previous);
                    }
                }
            }

            this._map = map;
            if (map) {
                this._scale = map.scale;
            }

            if (this.handlerState && previous !== map && map) {
                for (const eventHandler of this.handlerState) {
                    if (eventHandler.event === TileMapEvent.Loaded) {
                        eventHandler.callback(map);
                    }
                }
            }
        }

        public getTile(col: number, row: number): Location {
            return new Location(col, row, this);
        }

        public getTileIndex(col: number, row: number) {
            return this.data.getTile(col, row);
        }

        public setTileAt(col: number, row: number, index: number): void {
            if (!this._map.isOutsideMap(col, row) && !this.isInvalidIndex(index))
                this._map.setTile(col, row, index);
        }

        public getImageType(im: Image): number {
            const tileset = this._map.getTileset();
            for (let i = 0; i < tileset.length; i++)
                if (tileset[i].equals(im)) return i;

            // not found; append to the tileset if there are spots left.
            const newIndex = tileset.length;
            if (!this.isInvalidIndex(newIndex)) {
                tileset.push(im);
                return newIndex;
            }

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

        public sampleTilesByType(index: number, maxCount: number): Location[] {
            if (this.isInvalidIndex(index) || !this.enabled || maxCount <= 0) return [];

            let count = 0;
            const reservoir: Location[] = [];
            for (let col = 0; col < this._map.width; ++col) {
                for (let row = 0; row < this._map.height; ++row) {
                    let currTile = this._map.getTile(col, row);
                    if (currTile === index) {
                        // first **maxCount** elements just enqueue
                        if (count < maxCount) {
                            reservoir.push(new Location(col, row, this));
                        } else {
                            const potentialIndex = randint(0, count);
                            if (potentialIndex < maxCount) {
                                reservoir[potentialIndex] = new Location(col, row, this);
                            }
                        }
                        ++count;
                    }
                }
            }

            return reservoir;
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
            const hbox = s._hitbox;

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

        public getTileImage(index: number) {
            return this.data.getTileImage(index);
        }

        public addEventListener(event: TileMapEvent, handler: (data: TileMapData) => void) {
            if (!this.handlerState) this.handlerState = [];

            for (const eventHandler of this.handlerState) {
                if (eventHandler.event === event && eventHandler.callback === handler) return;
            }
            this.handlerState.push(new TileMapEventHandler(event, handler));
        }

        public removeEventListener(event: TileMapEvent, handler: (data: TileMapData) => void) {
            if (!this.handlerState) return;

            for (let i = 0; i < this.handlerState.length; i++) {
                if (this.handlerState[i].event === event && this.handlerState[i].callback === handler) {
                    this.handlerState.splice(i, 1)
                    return;
                }
            }
        }
    }

    function mkColorTile(index: number, scale: TileScale): Image {
        const size = 1 << scale

        const i = image.create(size, size);
        i.fill(index);
        return i;
    }

    //% scale.defl="TileScale.Sixteen"
    export function createTilemap(data: Buffer, layer: Image, tiles: Image[], scale: TileScale): TileMapData {
        return new TileMapData(data, layer, tiles, scale)
    }

    //% blockId=tilemap_editor block="set tilemap to $tilemap"
    //% weight=200 blockGap=8
    //% tilemap.fieldEditor="tilemap"
    //% tilemap.fieldOptions.decompileArgumentAsString="true"
    //% tilemap.fieldOptions.filter="tile"
    //% tilemap.fieldOptions.taggedTemplate="tilemap"
    //% blockNamespace="scene" duplicateShadowOnDrag
    //% help=tiles/set-tilemap
    //% deprecated=1
    export function setTilemap(tilemap: TileMapData) {
        setCurrentTilemap(tilemap);
    }

    /**
     * Sets the given tilemap to be the current active tilemap in the game
     *
     * @param tilemap The tilemap to set as the current tilemap
     */
    //% blockId=set_current_tilemap block="set tilemap to $tilemap"
    //% weight=201 blockGap=8
    //% tilemap.shadow=tiles_tilemap_editor
    //% blockNamespace="scene" group="Tilemaps" duplicateShadowOnDrag
    //% help=tiles/set-current-tilemap
    export function setCurrentTilemap(tilemap: TileMapData) {
        scene.setTileMapLevel(tilemap);
    }

    /**
     * Set a location in the map (column, row) to a tile
     * @param loc
     * @param tile
     */
    //% blockId=mapsettileat block="set $tile at $loc=mapgettile"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% blockNamespace="scene" group="Tilemap Operations" blockGap=8
    //% help=tiles/set-tile-at
    //% weight=70
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
    //% blockNamespace="scene" group="Tilemap Operations"
    //% help=tiles/set-wall-at
    //% weight=60
    export function setWallAt(loc: Location, on: boolean): void {
        const scene = game.currentScene();
        if (!loc || !scene.tileMap) return null;
        const scale = scene.tileMap.scale;
        scene.tileMap.setWallAt(loc.x >> scale, loc.y >> scale, on);
    }

    /**
     * Get the tile position given a column and row in the tilemap
     * @param col
     * @param row
     */
    //% blockId=mapgettile block="tilemap col $col row $row"
    //% blockNamespace="scene" group="Locations"
    //% weight=100 blockGap=8
    //% help=tiles/get-tile-location
    export function getTileLocation(col: number, row: number): Location {
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
        return scene.tileMap.getTileImage(loc.tileSet);
    }

    /**
     * Get the image of a tile, given a (column, row) in the tilemap
     * @param loc
     */
    export function getTileAt(col: number, row: number): Image {
        const scene = game.currentScene();
        if (col == undefined || row == undefined || !scene.tileMap) return img``;
        return scene.tileMap.getTileImage(tiles.getTileLocation(col, row).tileSet);
    }

    /**
     * Returns true if the tile at the given location is the same as the given tile;
     * otherwise returns false
     * @param location
     * @param tile
     */
    //% blockId=maplocationistile block="tile at $location is $tile"
    //% location.shadow=mapgettile
    //% tile.shadow=tileset_tile_picker tile.decompileIndirectFixedInstances=true
    //% blockNamespace="scene" group="Locations" blockGap=8
    //% weight=40 help=tiles/tile-at-location-equals
    export function tileAtLocationEquals(location: Location, tile: Image): boolean {
        const scene = game.currentScene();
        if (!location || !tile || !scene.tileMap) return false;
        return location.tileSet === scene.tileMap.getImageType(tile);
    }

    /**
     * Returns true if the tile at the given location is a wall in the current tilemap;
     * otherwise returns false
     * @param location The location to check for a wall
     */
    //% blockId=tiles_tile_at_location_is_wall
    //% block="tile at $location is wall"
    //% location.shadow=mapgettile
    //% blockNamespace="scene" group="Locations" blockGap=8
    //% weight=30 help=tiles/tile-at-location-is-wall
    export function tileAtLocationIsWall(location: Location): boolean {
        if (!location || !location.tileMap) return false;
        return location.isWall();
    }

    /**
     * Returns the image of the tile at the given location in the current tilemap
     *
     * @param location The location of the image to fetch
     */
    //% blockId=tiles_image_at_location
    //% block="tile image at $location"
    //% location.shadow=mapgettile
    //% weight=0 help=tiles/tile-image-at-location
    //% blockNamespace="scene" group="Locations"
    export function tileImageAtLocation(location: Location): Image {
        const scene = game.currentScene();
        if (!location || !scene.tileMap) return img``;
        return location.getImage();
    }

    /**
     * Center the given sprite on a given location
     * @param sprite
     * @param loc
     */
    //% blockId=mapplaceontile block="place $sprite=variables_get(mySprite) on top of $loc"
    //% loc.shadow=mapgettile
    //% blockNamespace="scene" group="Tilemap Operations" blockGap=8
    //% help=tiles/place-on-tile
    //% weight=100
    export function placeOnTile(sprite: Sprite, loc: Location): void {
        if (!sprite || !loc || !loc.tileMap) return;
        loc.place(sprite);
    }

    /**
     * Center the given sprite on a random location that is the given type (image)
     * @param sprite
     * @param tile
     */
    //% blockId=mapplaceonrandomtile block="place $sprite=variables_get(mySprite) on top of random $tile"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% blockNamespace="scene" group="Tilemap Operations"
    //% help=tiles/place-on-random-tile
    //% weight=90
    export function placeOnRandomTile(sprite: Sprite, tile: Image): void {
        if (!sprite || !game.currentScene().tileMap) return;
        const loc = getRandomTileByType(tile);
        if (loc)
            loc.place(sprite);
    }

    /**
     * Get all tiles in the tilemap with the given type (image).
     * @param tile
     */
    //% blockId=mapgettilestype block="array of all $tile locations"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% blockNamespace="scene" group="Locations" blockGap=8
    //% help=tiles/get-tiles-by-type
    //% weight=10
    export function getTilesByType(tile: Image): Location[] {
        const scene = game.currentScene();
        if (!tile || !scene.tileMap) return [];
        const index = scene.tileMap.getImageType(tile);
        return scene.tileMap.getTilesByType(index);
    }

    /**
     * Get a random tile of the given type
     * @param tile the type of tile to get a random selection of
     */
    export function getRandomTileByType(tile: Image): Location {
        const scene = game.currentScene();
        if (!tile || !scene.tileMap)
            return undefined;
        const index = scene.tileMap.getImageType(tile);
        const sample = scene.tileMap.sampleTilesByType(index, 1);
        return sample[0];
    }

    /**
     * A tilemap
     */
    //% blockId=tiles_tilemap_editor shim=TD_ID
    //% weight=200 blockGap=8
    //% block="tilemap $tilemap"
    //% tilemap.fieldEditor="tilemap"
    //% tilemap.fieldOptions.decompileArgumentAsString="true"
    //% tilemap.fieldOptions.filter="tile"
    //% tilemap.fieldOptions.taggedTemplate="tilemap"
    //% blockNamespace="scene" group="Tilemaps" duplicateShadowOnDrag
    //% help=tiles/tilemap
    export function _tilemapEditor(tilemap: TileMapData): TileMapData {
        return tilemap;
    }

    /**
     * Adds an event handler that will fire whenever the specified event
     * is triggered. Unloaded tilemap events will fire before the new tilemap
     * is set and loaded events will fire afterwards. The same handler can
     * not be added for the same event more than once.
     *
     * @param event     The event to subscribe to
     * @param handler   The code to run when the event triggers
     */
    export function addEventListener(event: TileMapEvent, callback: (data: TileMapData) => void) {
        const scene = game.currentScene();

        if (!scene.tileMap) {
            scene.tileMap = new TileMap();
        }

        scene.tileMap.addEventListener(event, callback);
    }


    /**
     * Removes an event handler registered with addEventListener.
     *
     * @param event     The event that the handler was registered for
     * @param handler   The handler to remove
     */
    export function removeEventListener(event: TileMapEvent, callback: (data: TileMapData) => void) {
        const scene = game.currentScene();

        if (!scene.tileMap) return;

        scene.tileMap.removeEventListener(event, callback);
    }
}
