// Auto-generated. Do not edit.
declare namespace ir {

    /**
     * Send data over IR.
     */
    //% shim=ir::send
    function send(buf: Buffer): void;

    /**
     * Get most recent packet received over IR.
     */
    //% shim=ir::currentPacket
    function currentPacket(): Buffer;

    /**
     * Run action after a packet is recieved over IR.
     */
    //% shim=ir::onPacket
    function onPacket(body: () => void): void;

    /**
     * Run action after there's an error reciving packet over IR.
     */
    //% shim=ir::onError
    function onError(body: () => void): void;
}

// Auto-generated. Do not edit. Really.
