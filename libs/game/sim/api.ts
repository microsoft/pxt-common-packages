namespace pxsim.hud {
    export function updateHighScore(score: number): number {
        const b = board();
        const id = b.runOptions.version || "local";
        if (!id || !window.localStorage) return 0;

        try {
            const key = "highscore-" + id;
            let hs = parseFloat(window.localStorage[key]) || 0;
            if (score > hs) {
                hs = score;
                window.localStorage[key] = hs;
            }
            return hs;
        } catch (e) { }

        return score;
    }
}