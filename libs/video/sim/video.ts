namespace pxsim.video {
    export function getCurrentFrame(stream: number): RefImage {
        return pxsim.getCurrentFrame(stream);
    }

    export function getStreamCount(): number {
        return pxsim.getStreamCount();
    }
}

namespace pxsim {
    export interface VideoBoard extends pxsim.EventBusBoard {
        videoState: VideoState;
    }

    export function videoBoard(): VideoBoard {
        return pxsim.board() as pxsim.EventBusBoard as pxsim.VideoBoard;
    }

    export function getStreamCount() {
        const b = videoBoard();
        return b ? b.videoState.streams.length : 0;
    }

    export function getCurrentFrame(stream: number): pxsim.RefImage {
        return null;
    }

    export interface VideoMessage extends pxsim.SimulatorMessage {
        type: 'video';
        subtype: string;
    }

    export interface VideoFrameMessage extends VideoMessage {
        subtype: 'video-frame';
        deviceId: string;
        width: number;
        height: number;
        pixels: string;
    }

    export type VideoStream = {
        deviceId: string;
//        frame: RefImage;
    }

    export class VideoState {
        streams: VideoStream[];

        constructor(private board: CommonBoard) {
            this.streams = [];
            this.board.addMessageListener(msg => this.messageHandler(msg));
        }

        messageHandler(msg: SimulatorMessage) {
//            if (!isVideoMessage(msg)) return;
//
//            if (isVideoFrameMessage(msg)) {
//                let stream = this.streams.filter(item => item.deviceId === msg.deviceId).shift();
//                if (!stream) {
//                    stream = {
//                        deviceId: msg.deviceId,
//                        frame: null
//                    };
//                    this.streams.push(stream);
//                }
//                if (!stream.frame || (stream.frame._width !== msg.width || stream.frame._height !== msg.height)) {
//                    stream.frame = image.create(msg.width, msg.height);
//                }
//                if (stream.frame) {
//                    const size = msg.width * msg.height;
//                    const data = new Uint8Array(size);
//                    for (let i = 0; i < size; ++i) {
//                        data[i] = hexmap[msg.pixels.charAt(i)] || 0;
//                    }
//                    stream.frame.data = data;
//                }
//            }
        }
//
//        getCurrentFrame(stream: number): RefImage {
//            if (this.streams.length < stream) {
//                return this.streams[stream].frame;
//            }
//            return null;
//        }
//
//        getStreamCount(): number {
//            return this.streams.length;
//        }
    }
//
//    function isVideoMessage(msg: SimulatorMessage): msg is VideoMessage {
//        return msg && msg.type === 'video';
//    }
//
//    function isVideoFrameMessage(msg: SimulatorMessage): msg is VideoFrameMessage {
//        return msg && (msg as VideoFrameMessage).subtype === 'video-frame';
//    }
//
//    const hexmap: { [key: string]: number } = {
//        '0': 0,
//        '1': 1,
//        '2': 2,
//        '3': 3,
//        '4': 4,
//        '5': 5,
//        '6': 6,
//        '7': 7,
//        '8': 8,
//        '9': 9,
//        'A': 10,
//        'B': 11,
//        'C': 12,
//        'D': 13,
//        'E': 14,
//        'F': 15
//    };
}