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

Never write 0xffffffff as the last word (add empty block if needed)

Upon mount:
* scan meta backwards, find top (first 0xffffffff)
* keep scanning, while getting 0xffffffff
* this is writePtr

upon overwrite, traverse file data and set all sizes to zero, link to fresh block at the end

## Other ideas

Use regular file for directory, but link it backwards

need to write something every mount for random seed - will overwrite 4 byte random seed in a named file
- 2 words upon each write
