namespace game {
    /**
     * Prompts the user for a boolean question
     * @param title
     * @param subtitle
     */
    //% group="Gameplay"
    //% weight=89 help=game/ask
    //% blockId=gameask block="ask %title||%subtitle"
    //% group="Prompt"
    export function ask(title: string, subtitle?: string): boolean {
        controller._setUserEventsEnabled(false);
        game.eventContext(); // initialize the game
        control.pushEventContext();
        game.showDialog(title, subtitle, "A = OK, B = CANCEL");
        // short pause so that players don't skip through prompt
        pause(500);

        let answer: boolean = null;
        let aNotHeld = false;
        let bNotHeld = false;
        pauseUntil(() => {
            aNotHeld = aNotHeld || !controller.A.isPressed();
            bNotHeld = bNotHeld || !controller.B.isPressed();

            if (aNotHeld && controller.A.isPressed()) {
                answer = true;
            } else if (bNotHeld && controller.B.isPressed()) {
                answer = false;
            }
            return answer !== null;
        });

        control.popEventContext();
        controller._setUserEventsEnabled(true);
        return answer;
    }
}