namespace pxsim.video {
    export function getCurrentFrame(stream: number): RefImage {
        return pxsim.getCurrentFrame(stream);
    }

    export function setPaletteFromStream(stream: number): void {
        return pxsim.setPaletteFromStream(stream);
    }

    export function getStreamCount(): number {
        return pxsim.getStreamCount();
    }

    export function getStreamName(stream: number): string {
        return pxsim.getStreamName(stream);
    }

    export function getDeviceId(stream: number): string {
        return pxsim.getDeviceId(stream);
    }
}

namespace pxsim {
    let lastSetPalette: string;

    export interface VideoBoard extends pxsim.EventBusBoard {
        videoState: VideoState;
    }

    export function videoBoard(): VideoBoard {
        return pxsim.board() as pxsim.EventBusBoard as pxsim.VideoBoard;
    }

    export function getCurrentFrame(stream: number): pxsim.RefImage {
        const b = videoBoard();
        return b ? b.videoState.getCurrentFrame(stream) : null;
    }

    export function setPaletteFromStream(stream: number): void {
        const b = videoBoard();
        if (b) {
            b.videoState.setPaletteFromStream(stream);
        }
    }

    export function getStreamCount() {
        const b = videoBoard();
        return b ? b.videoState.getStreamCount() : 0;
    }

    export function getStreamName(stream: number): string {
        const b = videoBoard();
        return b ? b.videoState.getStreamName(stream) : null;
    }

    export function getDeviceId(stream: number): string {
        const b = videoBoard();
        return b ? b.videoState.getDeviceId(stream) : null;
    }

    export interface VideoMessage extends pxsim.SimulatorMessage {
        type: 'video';
        subtype: string;
    }

    export interface VideoFrameMessage extends VideoMessage {
        subtype: 'video-frame';
        deviceId: string;
        name: string;
        width: number;
        height: number;
        pixels: number[];
        palette: number[];
        paletteName: string;
    }

    export type VideoStream = {
        deviceId: string;
        name: string;
        frame: RefImage;
        palette: number[];
        paletteName: string;
    }

    export class VideoState {
        streams: VideoStream[];

        constructor(private board: CommonBoard) {
        }

        init() {
            lastSetPalette = null;
            this.streams = [];
            this.board.addMessageListener(msg => this.messageHandler(msg));
        }

        messageHandler(msg: SimulatorMessage) {
            if (!isVideoMessage(msg)) return;

            if (isVideoFrameMessage(msg)) {
                let stream = this.streams.filter(item => item.deviceId === msg.deviceId).shift();
                if (!stream) {
                    stream = {
                        deviceId: msg.deviceId,
                        name: msg.name,
                        frame: null,
                        palette: null,
                        paletteName: null
                    };
                    this.streams.push(stream);
                }
                if (!stream.frame || (stream.frame._width !== msg.width || stream.frame._height !== msg.height)) {
                    stream.frame = image.create(msg.width, msg.height);
                }
                if (stream.frame) {
                    const size = msg.width * msg.height;
                    const data = new Uint8Array(size);
                    for (let i = 0; i < size; ++i) {
                        data[i] = msg.pixels[i];
                    }
                    stream.frame.data = data;
                }
                stream.palette = msg.palette;
                stream.paletteName = msg.paletteName;
            }
        }

        getCurrentFrame(stream: number): RefImage {
            if (this.streams.length > stream) {
                return this.streams[stream].frame;
            }
            return null;
        }

        setPaletteFromStream(stream: number): void {
            if (this.streams.length > stream) {
                if (this.streams[stream].palette) {
                    if (this.streams[stream].paletteName !== lastSetPalette) {
                        const pal = createColorBuffer(this.streams[stream].palette);
                        const state = getScreenState();
                        if (state) {
                            state.setPalette(pal);
                            lastSetPalette = this.streams[stream].paletteName;
                        }
                    }
                }
            }
        }

        getStreamCount(): number {
            return this.streams.length;
        }

        getStreamName(stream: number): string {
            if (this.streams.length > stream) {
                return this.streams[stream].name;
            }
            return null;
        }

        getDeviceId(stream: number): string {
            if (this.streams.length > stream) {
                return this.streams[stream].deviceId;
            }
            return null;
        }
    }

    function isVideoMessage(msg: SimulatorMessage): msg is VideoMessage {
        return msg && msg.type === 'video';
    }

    function isVideoFrameMessage(msg: SimulatorMessage): msg is VideoFrameMessage {
        return msg && (msg as VideoFrameMessage).subtype === 'video-frame';
    }

    function createColorBuffer(colors: number[]): RefBuffer {
        const data = new Uint8Array(colors.length * 3);
        for (let iColor = 0, iData = 0; iColor < colors.length; ++iColor) {
            let color = colors[iColor];
            data[iData++] = (color & 0xff0000) >> 16;
            data[iData++] = (color & 0x00ff00) >> 8;
            data[iData++] = (color & 0x0000ff);
        }
        return new RefBuffer(data);
    }
}