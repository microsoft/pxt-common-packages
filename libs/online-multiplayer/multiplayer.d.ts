declare namespace multiplayer {
    //% shim=multiplayer::postImage
    function postImage(im: Image, goal: string): void;

    function setImage(im: Image): void;

    //% shim=multiplayer::setIsClient
    function setIsClient(on: boolean): void;
}