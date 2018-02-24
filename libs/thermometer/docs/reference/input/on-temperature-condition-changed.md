# on Temperature Condition Changed

Run some code when the temperature changes from hot to cold, or from cold to hot.

```sig
input.onTemperatureConditionChanged(TemperatureCondition.Hot, 15, TemperatureUnit.Celsius, () => {
	
});
```

You decide what the temperature goes to before your code starts to run. This is the temperature _threshold_.
Your code will start when the temperature cools down to a certain number of degrees Celsius or Fahrenheit.
Also, you can have your code start if the temperature warms to a certain number of degrees.

You pick the ``cold`` condition to run your code when it cools to your selected temperature (threshold).
Or, you use ``warm`` to run your code when it warms to your temperature _threshold_.

## Parameters

* **condition**: the temperature condition you want code to run for
>  * ``cold``: the code runs when the temperature cools to a certain point
>  * ``hot``: the code runs when the temperature warms to as certain point
* **temperature**: the temperature to get to before your code starts
* **unit**: the unit of temperature, Celcius or Fahrenheit
* **handler**: the code to run when the temperature changes

## Example #example

Make all the pixels show `blue` when the temperature gets cool. The cool setting is `10` degrees Celsius or colder.

```blocks
input.onTemperatureConditionChanged(TemperatureCondition.Cold, 10, TemperatureUnit.Celsius, () => {
	light.createStrip().setAll(Colors.Blue);
})
```
## See also #seealso

[temperature](/reference/input/temperature)

```package
temperature
```