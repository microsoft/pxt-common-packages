# What is PWM?

To create commands for servos, make analog output voltages, and other command signals, your
board uses a method called _pulse width modulation (pwm)_. That's a fancy way to talk about
making pulse signals that last for different amounts of time. The amount time that the pulse
is on for is called its _width_. The word _modulation_ just means that we are sending some
information by changing something in our signal. In this case, the information is the width
(amount of time) of our pulse.

### Period

With _pwm_, a pulse signal is sent regularly, many times a second. How many times a pulse is sent
in each second will determine it's _period_. If a _pwm_ signal is sent 50 times a second, then its period
is 1/20th of a second which is 20 milliseconds.

### Modulation

To get information from our _pwm_ signal, we can create a number from a pulse. The number comes
from checking how long the pulse lasted (its _width_) and finding out how different the pulse time is from
the length of the period. That difference is some percentage of the period. If your period is
20 milliseconds and the pulse width is 2 milliseconds, then the pulse signal means 10 percent.

### Servos

To make servos work, you have to keep sending a signal to them over and over again. How often a
servo gets this signal is called its period. For common servos, they have a signaling period of
20 milliseconds. This means that they get a new command every 20 milliseconds which is 50 times
every second. You might think that they are really busy but they can handle it. You probably don't
have to use ``||pins:analog set period||`` before writing to your servos. Servos don't use all of the
period to tell how much to turn the shaft. They usally get that information from a pulse that
is between 5 percent and 10 percent of the signal period.

### Analog write

You know that when you write a value to an analog pin you use a number between 0 and 1023. This
creates a different voltage that is detected at the pin. Some boards will have a secret way to
make it look like the voltage changes when you write a different value with ``||pins:analog write||``.
The analog pin can actully make just two voltages: low (0 volts) and high (3.3 volts or 5 volts).
In order to make many voltages, a pulse is sent for some amount time that is only part of the
signal period. If your board can make 3.3 volts for the pin output, it can pretend to make half
that voltage (1.65 volts) when you write `511` using ``||pins:analog write||``. How? Well, to do it,
it sends a pulse that lasts only half of the time of the period. If the period is short enough,
many times per second, other circuits detect that the pin is giving 1.65 volts. Tricky, right!

## See also

[servo set pulse](/reference/pins/servo-set-pulse),
[servo write](/reference/pins/servo-write)
[analog set period](/reference/pins/analog-set-period)