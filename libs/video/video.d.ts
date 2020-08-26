declare namespace video {
    //% shim=video::getCurrentFrame
    function getCurrentFrame(stream: int32): Image;

    //% shim=video::getStreamCount
    function getStreamCount(): int32;
}