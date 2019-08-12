namespace pxsim.info {
    export function updateHighScore(score: number): number {
        const b = board();
        const id = b.runOptions.version || "local";

        try {
            if (!id || !window.localStorage) return 0;
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