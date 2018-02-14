function moveXY() {
    //move x direction
    mouse.move(50, 0);
    pause(500); //wait
    mouse.move(-50, 0);
    pause(500); //wait

    //move y direction
    mouse.move(0, 50);
    pause(500); //wait
    mouse.move(0, -50);
    pause(500); //wait
}

function clicks() {
    mouse.setButton(MouseButton.Left, false);
    pause(500); //wait
    mouse.setButton(MouseButton.Left, true);
    pause(500); //wait

    mouse.setButton(MouseButton.Middle, false);
    pause(500); //wait
    mouse.setButton(MouseButton.Middle, true);
    pause(500); //wait

    mouse.setButton(MouseButton.Right, true);
    pause(500); //wait
    mouse.setButton(MouseButton.Right, true);
    pause(500); //wait
}

function wheel() {
    mouse.turnWheel(50);
    pause(500); //wait
    mouse.turnWheel(-50);
    pause(500); //wait
}

forever(function () {
    moveXY();
    clicks();
    wheel();
})