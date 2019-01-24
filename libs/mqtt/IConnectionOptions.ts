namespace mqtt {
/**
 * The options used to connect to the MQTT broker.
 */
export interface IConnectionOptions {
    host: string;
    port?: number;
    username?: string;
    password?: string;
    clientId: string;
    will?: IConnectionOptionsWill;
}

export interface IConnectionOptionsWill {
    topic: string;
    message: string;
    qos?: number;
    retain?: boolean;
}

}