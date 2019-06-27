# Error codes

## #error-info

Your @boardname@ may encounter a situation that prevents it from running your code. The system software that runs the programs on your board may notify you that an error occurred. It might show this error as a numeric code on the display, LEDs, or as output on a data port. These are called _panic_ codes. When an error happens that causes a panic code, your program will stop and you'll need to reset the board to start again.

## Panic codes

Some panic codes are for general errors that might occur while your program runs. Other times, a device or resource you want to use isn't present or isn't working and you receive a panic code for that. Several panic codes are related to the use of memory and accessing data in it.

* **20** (`PANIC_CODAL_OOM`): there is no free memory on the @boardname@
* **21** (`PANIC_GC_OOM`): Garbage Collection can't allocate any more memory
* **22** (`PANIC_GC_TOO_BIG_ALLOCATION`): Garbage Collection can't allocate memory for the requested size
* **30** (`PANIC_CODAL_HEAP_ERROR`): a general memory allocation error
* **40** (`PANIC_CODAL_NULL_DEREFERENCE`): a memory pointer is NULL and points to an invalid location
* **50** (`PANIC_CODAL_USB_ERROR`): USB is not available or can't initialize, transmit, or receive
* **90** (`PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR`): actual board hardware doesn't match the configuration description
* **901** (`PANIC_INVALID_BINARY_HEADER`): the type header for the object is not valid
* **902** (`PANIC_OUT_OF_BOUNDS`): the object data portion is greater than the length defined for it
* **903** (`PANIC_REF_DELETED`): an object reference was deleted and the object is no longer valid
* **904** (`PANIC_SIZE`): the object size doesn't match the size defined for the type
* **905** (`PANIC_INVALID_VTABLE`): an object vtable is invalid or not initialized
* **906** (`PANIC_INTERNAL_ERROR`): an internal resource error
* **907** (`PANIC_NO_SUCH_CONFIG`): the specified device resource is not present
* **908** (`NO_SUCH_PIN`): the specified pin is not present on the board
* **909** (`PANIC_INVALID_ARGUMENT`): the argument value is out of range or the type or format is invalid
* **910** (`PANIC_MEMORY_LIMIT_EXCEEDED`): insufficient memory is available to satisfy and allocation request
* **911** (`PANIC_SCREEN_ERROR`): the screen isn't present or it can't properly display the output
* **912** (`PANIC_MISSING_PROPERTY`): the property requested is not present in the current object
* **913** (`PANIC_INVALID_IMAGE`): the data for a screen image data is invalid or formatted incorrectly
* **914** (`PANIC_CALLED_FROM_ISR`): the current code isn't allowed to run in an interrupt service routine (ISR)
* **915** (`PANIC_HEAP_DUMPED`): the contents of memory was output to a debug port
* **980** (`PANIC_CAST_FROM_UNDEFINED`): attempted cast from an `undefined` value to another type
* **981** (`PANIC_CAST_FROM_BOOLEAN`): attempted cast from a [boolean](/types/boolean) value to an incompatible type
* **982** (`PANIC_CAST_FROM_NUMBER`): attempted cast from a [number](/types) value to an incompatible type or no conversion is available
* **983** (`PANIC_CAST_FROM_STRING`): attempted cast from a [string](/types/string) value to an incompatible type or no conversion is available
* **984** (`PANIC_CAST_FROM_OBJECT`): attempted cast from an object to an incompatible type
* **985** (`PANIC_CAST_FROM_FUNCTION`): attempted cast from a function to a non-function type
* **989** (`PANIC_CAST_FROM_NULL`): attempted cast from a `null` value to another type

## #specific

## See also

[panic](/reference/control/panic), [assert](/reference/control/assert)
