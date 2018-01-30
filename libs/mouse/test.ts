function moveXY() {
    //move x direction
    mouse.move(50, 0);
    loops.pause(500); //wait
    mouse.move(-50, 0);
    loops.pause(500); //wait

    //move y direction
    mouse.move(0, 50);
    loops.pause(500); //wait
    mouse.move(0, -50);
    loops.pause(500); //wait
}

function clicks() {
    mouse.setButton(MouseButton.Left, false);
    loops.pause(500); //wait
    mouse.setButton(MouseButton.Left, true);
    loops.pause(500); //wait

    mouse.setButton(MouseButton.Middle, false);
    loops.pause(500); //wait
    mouse.setButton(MouseButton.Middle, true);
    loops.pause(500); //wait

    mouse.setButton(MouseButton.Right, true);
    loops.pause(500); //wait
    mouse.setButton(MouseButton.Right, true);
    loops.pause(500); //wait
}

function wheel() {
    mouse.turnWheel(50);
    loops.pause(500); //wait
    mouse.turnWheel(-50);
    loops.pause(500); //wait
}

loops.forever(function () {
    moveXY();
    clicks();
    wheel();
})