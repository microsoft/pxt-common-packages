/**
 * Various test event in the execution cycle
 */
export enum TestEvent {
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
            const setup = _events[TestEvent.TestSetUp];
            if (setup)
                setup();

            console.log(`> ${this.name}`)
            this.handler()

            if (this.errors.length)
                console.log('')

            // ensure clean state after test
            const teardown = _events[TestEvent.TestTearDown];
            if (teardown)
                teardown();
        }
    }

    let _tests: Test[] = undefined;
    let _currentTest: Test = undefined;
    let _events: (() => void)[] = [undefined, undefined, undefined, undefined];

    function run() {
        if (!_tests) return;

        const setup = _events[TestEvent.RunSetUp];
        if (setup)
            setup();

        const start = control.millis();
        console.log(`${_tests.length} tests found`)
        console.log(` `)
        for (let i = 0; i < _tests.length; ++i) {
            const t = _currentTest = _tests[i];
            t.run();
            _currentTest = undefined;
        }

        const teardown = _events[TestEvent.RunTearDown];
        if (teardown)
            teardown();

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
    //% blockId=testAssertClose block="assert close %message|%expected|~~ %actual|within %tolerance"
    //% blockGap=8
    export function assertClose(name: string, expected: number, actual: number, tolerance: number) {
        assert(`${name} ${expected} != ${actual} +-${tolerance}`, Math.abs(expected - actual) <= tolerance);
    }

    /**
     * Registers code to be called at various points in the test execution
     * @param handler 
     */
    //% blockId=testSetup block="on %event"
    //% blockGap=8
    //% weight=10
    export function onEvent(event: TestEvent, handler: () => void) {
        this._events[event] = handler;
    }
}
