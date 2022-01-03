# Scene

Set scene backgrounds and view perspective. Handle interactions between tiles and sprites.

## Screen Settings

```cards
scene.screenWidth()
scene.screenHeight()
scene.setBackgroundColor(0)
scene.setBackgroundImage(null)
scene.backgroundColor()
scene.backgroundImage()
```

## Tiles and Tilemaps

```cards
tiles.setTilemap(null)
tiles.setTileAt(tiles.getTileLocation(0, 0), null)
tiles.setWallAt(tiles.getTileLocation(0, 0), false)
tiles.getTileLocation(0, 0)
tiles.getTilesByType(null)
tiles.placeOnTile(null, tiles.getTileLocation(0, 0))
tiles.placeOnRandomTile(null, null)
scene.onOverlapTile(SpriteKind.Player, null, function (sprite, location) {})
scene.onHitWall(SpriteKind.Player, function (sprite, location) { })
tiles.tileAtLocationEquals(tiles.getTileLocation(0, 0), null)
sprites.create(null).isHittingTile(CollisionDirection.Right)
sprites.create(null).tileKindAt(TileDirection.Right, null)
```

## Screen Effects

```cards
effects.confetti.startScreenEffect()
effects.confetti.endScreenEffect()
```

## Camera View

```cards
scene.cameraFollowSprite(null)
scene.centerCameraAt(0, 0)
scene.cameraShake(4,500)
```

## See also

[screen width](/reference/scene/screen-width),
[screen height](/reference/scene/screen-height),
[set background color](/reference/scene/set-background-color),
[set background image](/reference/scene/set-background-image),
[background color](/reference/scene/background-color),
[background image](/reference/scene/background-image),
[set tilemap](/reference/scene/set-tilemap),
[set tile at](/reference/scene/set-tile-at),
[set wall at](/reference/scene/set-wall-at),
[get tile location](/reference/scene/get-tile-location),
[get tiles by type](/reference/scene/get-tiles-by-type),
[place on tile](/reference/scene/place-on-tile,)
[place on random tile](/reference/scene/place-on-random-tile),
[on overlap tile](/reference/scene/on-overlap-tile),
[on hit wall](/reference/scene/on-hit-wall),
[tile at location equals](/reference/scene/tile-at-location-equals),
[is hitting tile](/reference/sprites/sprite-is-hittint-tile),
[tile kind at](/reference/sprites/sprite/tile-kind-at),
[start screen effect](/reference/scene/start-screen-effect),
[end screen effect](/reference/scene/end-screen-effect),
[camera follow sprite](/reference/scene/camera-follow-sprite),
[center camera at](/reference/scene/center-camera-at),
[camera shake](/reference/scene/camera-shake)
