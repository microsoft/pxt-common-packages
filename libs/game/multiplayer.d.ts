declare namespace multiplayer {
    //% shim=multiplayer::postImage
    function postImage(im: Image, goal: string): void;

    //% shim=multiplayer::getCurrentImage
    function getCurrentImage(): Image;

    //% shim=multiplayer::setOrigin
    function setOrigin(origin: string): void;

    //% shim=multiplayer::getOrigin
    function getOrigin(): string;
}