namespace mqtt {
/**
 * Connect flags
 * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc385349229
 */
export const enum ConnectFlags {
    UserName = 128,
    Password = 64,
    WillRetain = 32,
    WillQoS2 = 16,
    WillQoS1 = 8,
    Will = 4,
    CleanSession = 2
}

}