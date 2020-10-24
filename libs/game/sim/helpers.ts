
namespace pxsim.helpers {
    //
    interface SimulatorMessageToParent extends SimulatorMessage {
        status: string;
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
            type: "sim-post-message",
        }

        Runtime.postMessage(msg);
    }
}