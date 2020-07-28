declare namespace multiplayer {
    //% shim=multiplayer::postImage
    function postImage(im: Image, goal: string): void;

    //% shim=multiplayer::setIsClient
    function setIsClient(on: boolean): void;
}