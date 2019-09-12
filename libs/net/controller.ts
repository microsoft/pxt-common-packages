namespace net {
    export class Controller {
        constructor() { }

        public scanNetworks(): net.AccessPoint[] {
            return [];
        }

        public socket(): number {
            return -1;
        }

        public socketConnect(socket_num: number, dest: string | Buffer, port: number, conn_mode = TCP_MODE): boolean {
            return false;
        }

        public socketWrite(socket_num: number, buffer: Buffer): void {
        }

        public socketAvailable(socket_num: number): number {
            return -1;
        }

        public socketRead(socket_num: number, size: number): Buffer {
            return undefined;
        }

        public socketClose(socket_num: number): void {
        }

        public hostbyName(hostname: string): Buffer {
            return undefined;
        }
        get isIdle(): boolean { return false; }
        get isConnected(): boolean { return false; }
        connect(): void { }
        get ssid(): string { return undefined; }
        get MACaddress(): Buffer { return undefined; }
        public ping(dest: string, ttl: number = 250): number { return -1; }
    }
}