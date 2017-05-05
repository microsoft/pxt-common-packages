loops.forever(() => {
    serial.writeLine(`light=${input.lightLevel()}`);
})