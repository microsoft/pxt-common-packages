# Servos

Rotate and run servos connected to the pins.

### ~ hint

To better understand how servos work and how they are controlled, take a few minutes to read this [Brief Guide to Servos](https://www.kitronik.co.uk/pdf/a-brief-guide-to-servos.pdf).


Also, watch this video for a further look into how motors and servos work.

https://www.youtube.com/watch?v=okxooamdAP4

### ~

```cards
servos.P0.setPulse(1500)
servos.P0.setAngle(90)
servos.P0.run(50)
servos.P0.stop()
servos.P0.setRange(0, 180)
servos.P0.setStopOnNeutral(false)
```

## See also

[set pulse](/reference/servos/set-pulse),
[set angle](/reference/servos/set-angle),
[run](/reference/servos/run),
[stop](/reference/servos/stop),
[set range](/reference/servos/set-range),
[set stop on neutral](/reference/servos/set-stop-on-neutral)

[Brief Guide to Servos](https://www.kitronik.co.uk/pdf/a-brief-guide-to-servos.pdf)

```package
servo
```
