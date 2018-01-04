/**
 * Various test event in the execution cycle
 */
enum TestEvent {
    //% block="run setup"
    RunSetUp = 0,
    //% block="run teardown"
    RunTearDown = 1,
    //% block="test setup"
    TestSetUp = 2,
    //% block="test teardown"
    TestTearDown = 3
}

/**
 * A Unit tests framework
 */
//% weight=100 color=#0fbc11 icon=""
namespace tests {
    class Test {
        name: string;
        handler: () => void;
        errors: string[];

        constructor(name: string, handler: () => void) {
            this.name = name;
            this.handler = handler;
            this.errors = [];
        }

        run() {
            // clear state
            if (_runSetup)
                _runSetup();

            console.log(`> ${this.name}`)
            this.handler()

            if (this.errors.length)
                console.log('')

            // ensure clean state after test
            if (_runTearDown)
                _runTearDown();
        }
    }

    let _tests: Test[] = undefined;
    let _currentTest: Test = undefined;
    let _runSetup: () => void = undefined;
    let _runTearDown: () => void = undefined;
    let _testSetUp: () => void = undefined;
    let _testTearDown: () => void = undefined;

    function run() {
        if (!_tests) return;

        if (_testSetUp)
            _testSetUp();

        const start = control.millis();
        console.log(`${_tests.length} tests found`)
        console.log(` `)
        for (let i = 0; i < _tests.length; ++i) {
            const t = _currentTest = _tests[i];
            t.run();
            _currentTest = undefined;
        }

        if (_testTearDown)
            _testTearDown();

        console.log(` `)
        console.log(`${_tests.length} tests, ${_tests.map(t => t.errors.length).reduce((p, c) => p + c, 0)} errs in ${Math.ceil((control.millis() - start) / 1000)}s`)
    }

    /**
     * Registers a test to run
     */
    //% blockId=testtest block="test %name"
    //% weight=100
    export function test(name: string, handler: () => void): void {
        if (!name || !handler) return;
        if (!_tests) {
            _tests = [];
            control.runInBackground(function () {
                // should run after on start
                loops.pause(100)
                run()
            })
        }
        _tests.push(new Test(name, handler));
    }

    /** 
     * Checks a boolean condition
     */
    //% blockId=testAssert block="assert %message|%condition"
    //% weight=80
    //% blockGap=8
    export function assert(message: string, condition: boolean) {
        if (!condition) {
            console.log(`!!! ${message || ''}`)
            if (_currentTest)
                _currentTest.errors.push(message);
        }
    }

    /**
     * Checks that 2 values are close to each other
     * @param expected what the value should be
     * @param actual what the value was
     * @param tolerance the acceptable error margin, eg: 5
     */
    //% blockId=testAssertClose block="assert %message|%expected|close to %actual|by %tolerance"
    //% weight=79
    //% inlineInputMode=inline
    export function assertClose(name: string, expected: number, actual: number, tolerance: number) {
        assert(`${name} ${expected} != ${actual} +-${tolerance}`, Math.abs(expected - actual) <= tolerance);
    }

    /**
     * Registers code to be called at various points in the test execution
     * @param handler 
     */
    //% blockGap=8
    //% weight=10
    export function onEvent(event: TestEvent, handler: () => void) {
        switch(event) {
            case TestEvent.RunSetUp: _runSetup = handler; break;
            case TestEvent.RunTearDown: _runTearDown = handler; break;
            case TestEvent.TestSetUp: _testSetUp = handler; break;
            case TestEvent.TestTearDown: _testTearDown = handler; break;
        }
        this._events[<number>event] = handler;
    }
}
