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
        game.eventContext(); // initialize the game
        control.pushEventContext();
        game.showDialog(title, subtitle, "A = OK, B = CANCEL");
        let answer: boolean = null;
        // short pause so that players don't skip through prompt
        pause(500);

        controller.A.onEvent(ControllerButtonEvent.Pressed, () => answer = true);
        controller.B.onEvent(ControllerButtonEvent.Pressed, () => answer = false);
        pauseUntil(() => answer !== null);
        control.popEventContext();
        return answer;
    }
}