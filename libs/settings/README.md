# Settings store in internal MCU flash

This packages implements a simple key-value storage, in vein of browser's `localStorage`.
Keys are strings and values are buffers, but APIs are provided for using strings,
numbers and number arrays as values.

Keys with names starting with `#` are _system keys_.
User applications should not read or write these directly.

Following system keys are used:
* `#run` - current run number; incremented on each reset; it's also used to seed the
  random number generator; accessible via `settings.runNumber()`
* `#volume` - last music volume set explicitly by user using the game menu
* `#scope` - keeps the name of the program; if the current name of the program
  doesn't match what is in that key, all non-system keys are cleared;
  this happens for example when a new game (or rather a game with a new name) 
  is uploaded to a hardware device

The size of storage is typically limited to 16 kilobytes.
This applies in browser and in Arcade devices.
Smaller MCUs may limit it further (eg., it's 1k on SAMD21 devices).

## Panics 920, 921 and 922

When there is no more space to write a key to storage, all non-system keys
are deleted.
Then, if more than 25% of space is still occupied (by system keys),
all keys are deleted.
Finally, a panic 920 is issued.
The user has to reset the device, and hopefully next run will fix things.

All flash devices have a limited number of erases (at least 10,000),
before they start failing.
The settings storage implemented here doesn't erase on every write (typically
it will erase every hundred writes or so);
if your program keeps writing in a loop, you will likely
hit 10,000 erases in about half hour.

For this reason, if erases happen too often (i.e., you're writing too much),
panic 921 will be issued.

If flash memory is found to be inconsistent, panic 922 is issued.
In most cases, the entire flash memory is cleared before that, so that
a device reset will hopefully fix things.

## Storage structure

Settings are written using a very simple log file system.
The flash is divided in two equal regions.
One region is used for writing, and when it fills up, data is compressed
(garbage collected) into the other region, which is to be used from now
on until next compression

Each region starts with a header, followed by data section containing
key names and values.
Data section grows in the positive direction.
From the end of the region, the meta-data section grows in the negative
direction.
Meta-data entries are 8 bytes each and contain hash of key name,
value size, and points to key name and value in the data sections.
When a key value is overwritten, a new meta-data section for it
is created. When a key is to be found, it is searched for from the most 
recent meta-data entry.
