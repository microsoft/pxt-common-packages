# repeat Interval (property)

Get or set the interval between each occurrence of the `ControllerButtonEvent.Repeated`
event when a button is held.

## Get

Get the current repeat interval for the ``||controller:A||`` button.

```typescript-ignore
controller.A.repeatInterval
```

### Returns

* A [number](/types/number) that is the current interval between each
`ControllerButtonEvent.Repeated` event occurs when the ``||controller:A||`` button is held

## Set

```typescript-ignore
controller.A.repeatInterval = 0
```

### Parameter

* **value**: the new delay between occurrences of the `ControllerButtonEvent.Repeated` event
when the ``||controller:A||`` button is held

## Examples #example

Create a duck ``||sprites:projectile||`` every second the ``||controller:A||``
button is held down.

```typescript
controller.A.repeatInterval = 1000;
controller.A.repeatDelay = 0;

controller.A.onEvent(ControllerButtonEvent.Repeated, function () {
    let myProjectile = sprites.createProjectileFromSide(img`
        . . . . . . . . . . b 5 b . . .
        . . . . . . . . . b 5 b . . . .
        . . . . . . . . . b c . . . . .
        . . . . . . b b b b b b . . . .
        . . . . . b b 5 5 5 5 5 b . . .
        . . . . b b 5 d 1 f 5 5 d f . .
        . . . . b 5 5 1 f f 5 d 4 c . .
        . . . . b 5 5 d f b d d 4 4 . .
        b d d d b b d 5 5 5 4 4 4 4 4 b
        b b d 5 5 5 b 5 5 4 4 4 4 4 b .
        b d c 5 5 5 5 d 5 5 5 5 5 b . .
        c d d c d 5 5 b 5 5 5 5 5 5 b .
        c b d d c c b 5 5 5 5 5 5 5 b .
        . c d d d d d d 5 5 5 5 5 d b .
        . . c b d d d d d 5 5 5 b b . .
        . . . c c c c c c c c b b . . .
    `, 50, 0);
});
```

## See also #seealso

[repeatDelay](/reference/controller/button/repeat-delay),
[onEvent](/reference/controller/button/on-event)