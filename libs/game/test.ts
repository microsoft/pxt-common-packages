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

// showLongText wrapping: text must not be lost or overflow a row, also in the
// shorter rows next to the cursor (left/right layouts are narrow)
function checkDialogWrapping() {
    const dialog = new game.Dialog(Math.idiv(screen.width, 3) + 5, screen.height);
    const textWidth = dialog.image.width - ((dialog.innerLeft + Math.min(dialog.unit, 12)) << 1) - 2;
    const maxRowLength = Math.idiv(textWidth, dialog.font.charWidth);
    let seed = 7;
    for (let n = 0; n < 200; n++) {
        let text = "";
        const length = 30 + n;
        for (let i = 0; i < length; i++) {
            seed = (seed * 75 + 74) % 65537;
            text += seed % 6 == 0 ? " " : "x";
        }

        let lines = "";
        for (const page of dialog.chunkText(text)) {
            for (const line of page) {
                if (line.length > maxRowLength) return false;
                lines += line;
            }
        }

        let expected = "";
        for (let i = 0; i < text.length; i++) {
            if (text.charAt(i) != " ") expected += text.charAt(i);
        }
        let actual = "";
        for (let i = 0; i < lines.length; i++) {
            if (lines.charAt(i) != " ") actual += lines.charAt(i);
        }
        if (actual != expected) return false;
    }
    return true;
}

control.assert(checkDialogWrapping(), 0x202);
