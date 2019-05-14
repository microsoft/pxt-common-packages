namespace controller {
    export interface ControllerSceneState {
        lastGesture?: ControllerGesture;
        gestureHandlers?: any;
        lastLightCondition?: ControllerLightCondition;
        lightHandlers?: any;
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
        if (state.gestureHandlers 
            && state.lastGesture !== undefined 
            && state.gestureHandlers[state.lastGesture]) {
            const handler = state.gestureHandlers[state.lastGesture];
            state.lastGesture = undefined;
            handler();
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