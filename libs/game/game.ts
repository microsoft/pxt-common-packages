namespace game {
    let isOver = false
    let _score: number = null
    let _waitAnyKey: () => void

    export function setWaitAnyKey(f: () => void) {
        _waitAnyKey = f
    }

    export function waitAnyKey() {
        if (_waitAnyKey) _waitAnyKey()
        else loops.pause(2000)
    }

    export function freeze() {
        sprite.setBackgroundCallback(() => { })
        loops.frame(() => { })
        sprite.reset()
    }

    export function meltScreen() {
        freeze()
        for (let i = 0; i < 10; ++i) {
            for (let j = 0; j < 1000; ++j) {
                let x = Math.randomRange(0, screen.width - 1)
                let y = Math.randomRange(0, screen.height - 3)
                let c = screen.get(x, y)
                screen.set(x, y + 1, c)
                screen.set(x, y + 2, c)
            }
            loops.pause(100)
        }
    }

    export function over(effect?: () => void) {
        if (isOver) return
        isOver = true
        control.clearHandlers()
        control.runInBackground(() => {
            if (effect) effect()
            let top = 40
            screen.fillRect(0, top, screen.width, 44, 4)
            screen.printCenter("GAME OVER!", top + 8, 5, image.font8)
            screen.printCenter("Score: " + game.score(), top + 23, 2, image.font5)
            if (!effect)
                loops.pause(1000) // wait for users to stop pressing keys
            waitAnyKey()
            meltScreen()
            control.reset()
        })
    }

    export function score() {
        return _score
    }

    function initScore() {
        if (_score !== null) return
        let font = image.font8
        let color = 15
        let maxW = 8
        control.addFrameHandler(95, () => {
            let s = _score + ""
            while (s.length < maxW) s = " " + s
            screen.print(s, screen.width - font.charWidth * maxW - 10, font.charHeight, color, font)
        })
    }

    export function setScore(score: number) {
        initScore()
        _score = score | 0
    }

    export function addToScore(points: number) {
        setScore(_score + points)
    }
}
