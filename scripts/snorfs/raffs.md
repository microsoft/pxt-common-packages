# Random Access Flash File System (RAFFS)

Files as linked lists of data blocks
Directory as a special file

## Structure

Data section, growing from top to bottom

Meta section, growing from bottom to top

File chunk in data:
* word aligned
* 4-byte header: next pointer (2b) and size (2b)
* data follows header, aligned to word

Filename in data:
* file name bytes, NUL terminated, aligned to word

Never write 0xffffffff as the last word (add a few 0 bytes if needed)

Upon mount:
* scan meta backwards, find top (first 0xffffffff)
* keep scanning, while getting 0xffffffff
* this is writePtr

upon overwrite, traverse file data and set all sizes to zero, link to fresh block at the end

## Other ideas

Use regular file for directory, but link it backwards

need to write something every mount for random seed - will overwrite 4 byte random seed in a named file
- 2 words upon each write

## High-level APIs

Files with `$` in name don't appear on USB flash drive. Defaults here use such names.

```typescript
gamestorage.setNamespace("$G" + control.programHash()) // default
gamestorage.overwrite("saveslot-3", "...")
gamestorage.list() // list all files
gamestorage.reset()
```

When out of space, delete files in `gamestorage` in other namespaces.
If we already did that, and need more space, delete files in current namespace.
If we already did that, and need more space, 
delete all files and panic - device reset will hopefully recreate them.

hof = Hall of Fame. These are not namespaced, and so not affected by auto-cleanup
(except for the most severe one).
Namespace for high scores is `scores-`.

```typescript
hof.setGame("$H" + control.programHash()) // default
hof.setGame("my amazing game")
hof.setNumScores(10) // default
hof.setMinScore(1) // if less than this, don't ask for name
// lowest level
hof.isHighScore(score)
hof.addHighScore(score, name)
hof.getHighScores()
// slightly higher
hof.showHighScores()
hof.askHighScore()
// regular users do nothing - triggered automatically from game.over()
```
