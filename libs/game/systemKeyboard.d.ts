
/**
 * These shims are for enabling system keyboard support in text/number prompts.
 */
declare namespace helpers {
    //% shim=Keyboard::promptForText
    function _promptForText(maxLength: number, numbersOnly: boolean): void;

    //% shim=Keyboard::cancelTextPrompt
    function _cancelTextPrompt(): void;

    //% shim=Keyboard::getTextPromptString
    function _getTextPromptString(): string;

    //% shim=Keyboard::getLocalizedInstructions
    function _getLocalizedInstructions(): string;

    //% shim=Keyboard::getTextPromptSelectionStart
    function _getTextPromptSelectionStart(): number;

    //% shim=Keyboard::getTextPromptSelectionEnd
    function _getTextPromptSelectionEnd(): number;

    //% shim=Keyboard::isSystemKeyboardSupported
    function _isSystemKeyboardSupported(): boolean;
}