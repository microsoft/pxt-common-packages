# Touch sensors

Some boards have pins or pads that can work like buttons when you touch them. If you touch one
of these pins, you change what's happening electrically to the pin at that moment. The microprocessor
connected to the pin can detect this change and say that is was a button action.

Just like with real buttons, all the same actions are noticed: a press down, lift your finger off, hold
your finger down for a long time, and press down multiple times quickly.

## Resistive touch

One way of sensing touch is to change the electrical resistance of a material when it is
touched. This means that some special stuff is used that allows more or less electricity through it when pressure
(like your finger pushing on it) on its surface changes. The microprocessor is connected to this resistive
stuff and knows when more or less electrical current flows through it. That's how it knows you touched it
or lifted your finger away. Resistive touch material will work with other things too, not just you finger. A pen,
pencil, or something with a pointed tip. If there is a large area of resistive touch material, like a
computer display screen with a touch surface, the material can very accurately detect where you touched it
anywhere on it's surface.

## Capacitive touch

A very popular way to detect touch is with capacitive touch sensors. Capacitive means using _capacitance_ which is about storing up a really, really small number of electrons of the surface of some material. When you touch the
sensor, your body becomes part of the storage surface for the electrons on the sensor. If you have a grounded
sensor, the number of electrons, its _charge_, becomes less when you touch it. If you are using a non-grounded
sensor, the charge increases when you touch it. Either way, a sensing circuit can detect a touch by the change in
this charge.

In fact, a sensor can be just a pin or small metallic area on a circuit board. Probably just like the pins on your board. The microprocessor has a special circuit to detect a change in the charge at a pin and can know when
you touched it. What makes it nice about the capacitive touch pins on your board is that you can just use them
like they are buttons.

## ~hint
### Touch pins and ground (GND)

The capacitive touch pins on your board work as touch sensors by themselves, **WITHOUT** a connection to **GND**.
You can even attach wires to them to make a bigger sensor with other conductive material.
## ~

## See Also

[``||on event||``](/reference/input/button/on-event)
[``||is pressed||``](/reference/input/button/is-pressed),
[``||on event||``](/reference/input/button/on-event)