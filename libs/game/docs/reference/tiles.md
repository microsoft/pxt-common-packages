# Tiles

Place tiles and change their settings.

```cards
tiles.getTileLocation(0, 0)
tiles.getTilesByType(0)
scene.onHitWall(0, 0, function (sprite) {
	
})
scene.onOverlapTile(0, 0, function (sprite) {
	
})
tiles.getTileLocation(0, 0).place(null)
tiles.setTileAt(null, 0)
tiles.setWallAt(null, false)
tiles.placeOnRandomTile(null, 0)
```

## See also

[set tile at](/reference/tiles/set-tile-at),
[set wall at](/reference/tiles/set-wall-at),
[get tile location](/reference/tiles/get-tile-locatioin),
[get tiles by type](/reference/tiles/get-tiles-by-type),
[place](/reference/tiles/place),
[place on random tile](/reference/tiles/place-on-random-tile),
[on hit wall](/reference/scene/on-hit-wall),
[on overlap tile](/reference/scene/on-overlap-tile)
