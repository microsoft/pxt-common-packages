
namespace pxsim.helpers {
    //
    interface SimulatorMessageToParent extends SimulatorBroadcastMessage {
        status: string;
        toParent: true;
        broadcast: true;
        type: "sim-post-message";
        data: pxt.Map<string | number>;
    }

    //%
    export function __postToParent(status: string, data?: RefMap) {
        let unpacked: pxt.Map<string | number>;
        if (data) {
            unpacked = {};
            for (const el of data.data) {
                unpacked[el.key] = el.val as string | number;
            }
        }

        const msg: SimulatorMessageToParent = {
            status: status,
            data: unpacked,
            broadcast: true,
            toParent: true,
            type: "sim-post-message",
        }

        Runtime.postMessage(msg);
    }
}