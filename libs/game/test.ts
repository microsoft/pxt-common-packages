namespace SpriteKind {
    export const TestPlayer = SpriteKind.create();
}

const overlapTile = img`
    1
`;
const neutralTile = img`
    2
`;
const dangerTile = img`
    3
`;
const emptyTile = img`
    .
`;

const baseLayer = img`
    . .
    . .
`;

const beforeSwap = tiles.createTilemap(
    hex`0200020001020202`,
    baseLayer,
    [emptyTile, overlapTile, neutralTile, dangerTile],
    TileScale.Eight
);

const afterSwap = tiles.createTilemap(
    hex`0200020002030202`,
    baseLayer,
    [emptyTile, overlapTile, neutralTile, dangerTile],
    TileScale.Eight
);

let overlapSwapped = 0;
let dangerHits = 0;

scene.onOverlapTile(SpriteKind.TestPlayer, overlapTile, function (sprite: Sprite, location: tiles.Location) {
    overlapSwapped++;
    tiles.setCurrentTilemap(afterSwap);
    sprite.setPosition(100, 100);
});

scene.onOverlapTile(SpriteKind.TestPlayer, dangerTile, function (sprite: Sprite, location: tiles.Location) {
    dangerHits++;
});

tiles.setCurrentTilemap(beforeSwap);

const spriteImage = image.create(16, 16);
spriteImage.fill(1);
const sprite = sprites.create(spriteImage, SpriteKind.TestPlayer);
sprite.setPosition(8, 8);

pause(100);

control.assert(overlapSwapped == 1, 0x200);
control.assert(dangerHits == 0, 0x201);
