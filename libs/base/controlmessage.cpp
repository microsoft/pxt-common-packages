namespace pxt {
    void registerMessageHandler(const char* channel, void (*handler)(const void *data, unsigned len)) {

    }

    void sendMessage(const char* channel, const void *data, unsigned len) {
        // TODO
    }

    //% 
    String peekMessageChannel() {
        return NULL; // TODO
    }

    //% 
    Buffer readMessageData() {
        return NULL; // TODO
    }
}