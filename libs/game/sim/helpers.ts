
namespace pxsim.helpers {
    //
    interface SimulatorMessageToParent extends SimulatorBroadcastMessage {
        status: string;
        type: "sim-message";
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

        Runtime.postMessage(<SimulatorMessageToParent>{
            status: status,
            data: unpacked,
            broadcast: true,
            type: "sim-message",
        });
    }
}