
namespace helpers {
    //% shim=helpers::__receiveDataFromParent
    declare function __receiveDataFromParent(): { [index: string]: string | number};

    //% shim=helpers::__onMessageFromParent
    declare function __onMessageFromParent(h: () => void): void;

    let messageReceivedHandlers: ((data: { [index: string]: string | number }) => void)[];
    export function _onMessageFromParent(h: (data: { [index: string]: string | number }) => void): void {
        if (!messageReceivedHandlers) {
            messageReceivedHandlers = [];

            __onMessageFromParent(() => {
                const data = __receiveDataFromParent();
                if (data) {
                    messageReceivedHandlers.forEach(h => h(data));
                }
            })
        }
        messageReceivedHandlers.push(h);
    }
}

