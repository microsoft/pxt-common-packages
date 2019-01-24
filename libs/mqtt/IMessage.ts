namespace mqtt {
/**
 * A message received in a Publish packet.
 */
export interface IMessage {
    pid?: number;
    topic: string;
    content: string;
    qos: number;
    retain: number;
    next?: number;
}

}