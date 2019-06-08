namespace jacdac {
    export class JDDiagnostics
    {
        bus_state: number;
        bus_lo_error: number;
        bus_uart_error: number;
        bus_timeout_error: number;
        packets_sent: number;
        packets_received: number;
        packets_dropped: number;
        bus_status: string;

        constructor(buf: Buffer)
        {
            if (!buf || buf.length == 0) {
                this.bus_lo_error = 0
                this.bus_uart_error = 0
                this.bus_timeout_error = 0
                this.packets_sent = 0
                this.packets_received = 0
                this.packets_dropped = 0
                this.bus_state = 0
                this.bus_status = "";
            } else {
                this.bus_state = buf.getNumber(NumberFormat.UInt32LE,0);

                if (this.bus_state == 0)
                    this.bus_status = "connected";
                else
                    this.bus_status = "error";

                this.bus_lo_error = buf.getNumber(NumberFormat.UInt32LE,4);
                this.bus_uart_error = buf.getNumber(NumberFormat.UInt32LE,8);
                this.bus_timeout_error = buf.getNumber(NumberFormat.UInt32LE,12);
                this.packets_sent = buf.getNumber(NumberFormat.UInt32LE,16);
                this.packets_received = buf.getNumber(NumberFormat.UInt32LE,20);
                this.packets_dropped = buf.getNumber(NumberFormat.UInt32LE,24);
            }
        }
    }
}