# tests

A unit test framework

## Defining tests

Tests are registered as event handlers. They will automatically run once ``on start`` is finished.

```blocks
tests.test("lgB set speed 10", () => {
    motors.largeB.setSpeed(10);
    pause(100)
    tests.assertClose("speedB", 10, motors.largeB.speed(), 2)
});
```

## Assertions

The library has various asserts that will register fault. Note that since exceptions are not available, assertion failure **do not** stop the program execution.

* **assert** checks a boolean condition

```blocks
tests.assert("speed positive", motors.largeB.speed() > 0)
```

* **assert close** checks that a numberical value is within a particular range

```blocks
tests.assertClose("speed", motors.largeB.speed(), 10, 2)
```

```package
tests
```