namespace controller {
    export interface ControllerSceneState {
        lastGesture?: ControllerGesture;
        gestureHandlers?: any;
        lastCustomGesture?: number;
        customGestureHandlers?: any;
        lastLightCondition?: ControllerLightCondition;
        lightHandlers?: any;
    }

    export interface CustomGestureHandler {
        update: () => boolean;
        handler: () => void;
    }

    export function sceneState(): ControllerSceneState {
        const sc = game.currentScene();
        let state = sc.data["controller.state"];
        if (!state) {
            state = sc.data["controller.state"] = <ControllerSceneState>{
            };
        }
        return state;
    }


    function updateController() {
        const state = sceneState();
        // accelerometer
        if (state.lastGesture !== undefined) {
            const handler = state.gestureHandlers && state.gestureHandlers[state.lastGesture];
            if (handler) {
                state.lastGesture = undefined;
                handler();
            }
        }
        if (state.lastCustomGesture !== undefined) {
            const customHandler = state.customGestureHandlers && state.customGestureHandlers[state.lastCustomGesture] as CustomGestureHandler;
            if (customHandler) {
                state.lastCustomGesture = undefined;
                customHandler.handler();
            }
        }

        // light sensor
        if (state.lightHandlers
            && state.lastLightCondition !== undefined
            && state.lightHandlers[state.lastLightCondition]) {
            const handler = state.lightHandlers[state.lastLightCondition];
            state.lastLightCondition = undefined;
            handler();
        }
    }

    function initController(s: scene.Scene) {
        s.eventContext.registerFrameHandler(scene.UPDATE_CONTROLLER_PRIORITY, updateController);
    }

    scene.Scene.initializers.push(initController);
}