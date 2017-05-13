# Input

Events and data from sensors

## Accelerometer #acceleration

```cards
input.onGesture(Gesture.Shake, () => {

})
input.setAccelerometerRange(AcceleratorRange.OneG)
input.acceleration(Dimension.X)
input.rotation(Rotation.Pitch)

```

## Light sensor #lightsensor

```cards
input.onLightConditionChanged(LightCondition.Dark, () => {

})
input.ambientColor()
input.lightLevel()
```

## Buttons #buttons

```cards
input.buttonA.isPressed()
input.buttonA.wasPressed()
input.onSwitchMoved(SwitchDirection.Left, () => {

})
input.buttonA.onEvent(ButtonEvent.Click, () => {

})
```

## Microphone #microphone

```cards
input.onSoundConditionChanged(LoudnessCondition.Quiet, () => {

})
```

## Temperature #temperature

```cards
input.onTemperateConditionChanged(TemperatureCondition.Cold, 0, () => {

})
input.temperature(TemperatureUnit.Celsius)
```
