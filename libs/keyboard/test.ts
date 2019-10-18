keyboard.type("hello world");
for(let i = 0; i < 10; ++i) // don't send more than 1
    keyboard.key("A", KeyboardKeyEvent.Down);
for(let i = 0; i < 10; ++i) // don't send more than 1
    keyboard.key("A", KeyboardKeyEvent.Up);
keyboard.key("A", KeyboardKeyEvent.Press);