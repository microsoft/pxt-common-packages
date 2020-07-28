declare namespace multiplayer {
    //% shim=multiplayer::postImage
    function postImage(im: Image, goal: string): void;

    //% shim=multiplayer::getCurrentIMage
    function getCurrentImage(): Image;

    //% shim=multiplayer::setIsClient
    function setIsClient(on: boolean): void;

    //% shim=multiplayer::getOrigin
    function getOrigin(): string;
}