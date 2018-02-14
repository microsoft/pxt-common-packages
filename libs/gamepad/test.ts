
function throttle() {
    //both throttles
    for (let i = 0; i < 2; i++) {
        //increase throttle
        for (let j = 0; j <= 31; j++) {
            gamepad.setThrottle(i, j);
            pause(100);
        }
        //move throttle back down
        for (let j = 31; j >= 0; j--) {
            gamepad.setThrottle(i, j);
            pause(100);
        }
    }
}

function buttons() {
    //set buttons
    for (let i = 0; i < 16; i++) {
        gamepad.setButton(i, false);
        pause(100);
    }

    //clear buttons
    for (let i = 0; i < 16; i++) {
        gamepad.setButton(i, true);
        pause(100);
    }

    //set buttons
    for (let i = 0; i < 16; i++) {
        gamepad.setButton(i, false);
        pause(100);
    }
}

function sticks() {
    //both joysticks
    for (let i = 0; i < 2; i++) {

        //move x axis up
        for (let j = 0; j < 127; j += 8) {
            gamepad.move(i, j, 0);
            pause(50);
        }

        //move x axis back down
        for (let j = 127; j >= 0; j -= 8) {
            gamepad.move(i, j, 0);
            pause(50);
        }

        //move y axis up
        for (let j = 0; j < 127; j += 8) {
            gamepad.move(i, 0, j);
            pause(50);
        }

        //move y axis back down
        for (let j = 127; j >= 0; j -= 8) {
            gamepad.move(i, 0, j);
            pause(50);
        }
    }
}

forever(function () {
    buttons()
    // sticks()
    throttle()
})