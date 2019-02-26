# repeat Delay (property)

Get or set the delay before the first occurrence of the `ControllerButtonEvent.Repeated`
event when a button is held.

## Get

Get the current delay for the ``||controller:A||`` button.

```typescript-ignore
controller.A.repeatDelay
```

### Returns

* A [number](/types/number) that is the current delay before the first
`ControllerButtonEvent.Repeated` event occurs when the ``||controller:A||`` button is held

## Set

```typescript-ignore
controller.A.repeatDelay = 0
```

### Parameter

* **value**: the new delay before the first `ControllerButtonEvent.Repeated` event occurs
when the ``||controller:A||`` button is held

## Examples #example

Move a stick figure to the left and right while ``||controller:left||`` and ``||controller:right||``
buttons are held, without any extra delay before the first movement.

```typescript
let mySprite = sprites.create(img`
    . 6 6 6 6 6 .
    6 6 . . . 6 6
    6 . . . . . 6
    6 . . . . . 6
    6 6 . . . 6 6
    . 6 6 6 6 6 .
    . . . 6 . . .
    . . . 6 . . .
    . 6 6 6 6 6 .
    . . . 6 . . .
    . . . 6 . . .
    . . 6 . 6 . .
    . 6 . . . 6 .
`);

controller.left.repeatDelay = 0;
controller.right.repeatDelay = 0;

controller.left.onEvent(ControllerButtonEvent.Repeated, function () {
    mySprite.x--;
});

controller.right.onEvent(ControllerButtonEvent.Repeated, function () {
    mySprite.x++;
});
```

## See also #seealso

[repeatInterval](/reference/controller/button/repeat-interval),
[onEvent](/reference/controller/button/on-event)